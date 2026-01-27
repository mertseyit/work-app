'use server';

import { auth } from '@clerk/nextjs/server';
import { CreateClientProjectSchema, CreateClientProjectSchemaType } from '../validators';
import prisma from '../prisma';
import { revalidatePath } from 'next/cache';
import { ProjectStatus } from '@prisma/client';

export async function createClientProject(form: CreateClientProjectSchemaType) {
  const { userId } = await auth();
  if (!userId) throw new Error('Yetkisiz erişim.');

  const validatedFields = CreateClientProjectSchema.safeParse(form);

  if (!validatedFields.success) {
    return { error: 'Form verileri geçersiz.' };
  }

  const {
    name,
    description,
    category,
    clientId,
    startDate,
    endDate,
    price,
    paidAmount,
    techStack,
    paymentStatus,
  } = validatedFields.data;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Projeyi oluştur
      const project = await tx.project.create({
        data: {
          userId,
          name,
          description,
          category,
          clientId,
          startDate,
          endDate,
          price,
          paidAmount: paidAmount || 0,
          techStack,
          paymentStatus: paymentStatus || 'UNPAID',
        },
        include: { client: true },
      });

      // 2. Eğer paidAmount > 0 ise gelir kaydı oluştur
      if (paidAmount && paidAmount > 0) {
        const incomeCategory = await tx.category.upsert({
          where: {
            userId_name_type: {
              userId,
              name: 'Proje Geliri',
              type: 'INCOME',
            },
          },
          create: {
            userId,
            name: 'Proje Geliri',
            type: 'INCOME',
          },
          update: {},
        });

        await tx.transaction.create({
          data: {
            amount: paidAmount,
            type: 'INCOME',
            date: new Date(),
            title: `${name} - ${paidAmount >= price ? 'Tam Ödeme' : 'Kısmi Ödeme'}`,
            description: `${project.client.name} müşterisinden alınan ödeme`,
            userId,
            categoryId: incomeCategory.id,
          },
        });
      }
    });

    revalidatePath(`/work-track/clients/${clientId}`);
    revalidatePath('/finance');
    return { success: true };
  } catch (error) {
    console.error('İşlem ekleme hatası:', error);
    return { error: 'Bir hata oluştu.' };
  }
}

export async function updateClientProject(
  id: string,
  data: Partial<CreateClientProjectSchemaType>,
) {
  const { userId } = await auth();
  if (!userId) throw new Error('Yetkisiz erişim.');

  const validatedFields = CreateClientProjectSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: 'Form verileri geçersiz.' };
  }

  const {
    name,
    description,
    category,
    clientId,
    startDate,
    endDate,
    price,
    paidAmount,
    techStack,
    status,
    paymentStatus,
  } = validatedFields.data;

  try {
    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!existingProject || existingProject.userId !== userId) {
      return { error: 'İşlem gerçekleşmedi' };
    }

    // Eğer status COMPLETED, CANCELLED veya PAUSED olarak değiştirilmeye çalışılıyorsa
    const restrictedStatuses: ProjectStatus[] = ['COMPLETED', 'CANCELLED', 'PAUSED'];

    if (status && restrictedStatuses.includes(status)) {
      const incompleteTaskCount = await prisma.task.count({
        where: {
          projectId: id,
          status: {
            in: ['TODO', 'IN_PROGRESS'],
          },
        },
      });

      if (incompleteTaskCount > 0) {
        return {
          error: `Bu projeye ait ${incompleteTaskCount} adet tamamlanmamış görev bulunuyor. Proje durumunu değiştirmeden önce tüm görevleri tamamlayın.`,
        };
      }
    }

    // Ödeme farkını hesapla (yeni ödeme - eski ödeme)
    const existingPaidAmount = Number(existingProject.paidAmount) || 0;
    const newPaidAmount = paidAmount ?? existingPaidAmount;
    const paymentDifference = newPaidAmount - existingPaidAmount;

    await prisma.$transaction(async (tx) => {
      // 1. Projeyi güncelle
      await tx.project.update({
        where: { id },
        data: {
          name,
          description,
          category,
          startDate,
          endDate,
          price,
          paidAmount: newPaidAmount,
          techStack,
          status,
          paymentStatus,
        },
      });

      // 2. Eğer ödeme farkı varsa transaction kaydı oluştur
      if (paymentDifference !== 0) {
        const incomeCategory = await tx.category.upsert({
          where: {
            userId_name_type: {
              userId,
              name: 'Proje Geliri',
              type: 'INCOME',
            },
          },
          create: {
            userId,
            name: 'Proje Geliri',
            type: 'INCOME',
          },
          update: {},
        });

        if (paymentDifference > 0) {
          // Ödeme artışı - yeni gelir kaydı
          const projectPrice = price ?? Number(existingProject.price);
          await tx.transaction.create({
            data: {
              amount: paymentDifference,
              type: 'INCOME',
              date: new Date(),
              title: `${existingProject.name} - ${newPaidAmount >= projectPrice ? 'Tam Ödeme' : 'Kısmi Ödeme'}`,
              description: `${existingProject.client.name} müşterisinden alınan ödeme`,
              userId,
              categoryId: incomeCategory.id,
            },
          });
        } else {
          // Ödeme azalışı (iade durumu) - gider kaydı
          await tx.transaction.create({
            data: {
              amount: Math.abs(paymentDifference),
              type: 'EXPENSE',
              date: new Date(),
              title: `${existingProject.name} - Ödeme İadesi`,
              description: `${existingProject.client.name} müşterisine yapılan iade`,
              userId,
              categoryId: incomeCategory.id,
            },
          });
        }
      }
    });

    revalidatePath(`/work-track/clients/${clientId}`);
    revalidatePath(`/work-track/projects/${id}`);
    revalidatePath('/finance');
    return { success: true };
  } catch (error) {
    console.error('Proje güncelleme hatası:', error);
    return { error: 'Güncellenirken bir hata oluştu.' };
  }
}

export async function deleteClientProject(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Yetkisiz erişim.');

  try {
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.userId !== userId) {
      return { error: 'İşlem Yapılamadı' };
    }

    await prisma.project.delete({
      where: { id },
    });

    revalidatePath('/finance');
    return { success: true };
  } catch (error) {
    console.error('Silme hatası:', error);
    return { error: 'Silinirken bir hata oluştu.' };
  }
}
