'use server';

import { auth } from '@clerk/nextjs/server';
import { CreateClientSchema, CreateClientSchemaType } from '../validators';
import prisma from '../prisma';
import { revalidatePath } from 'next/cache';
import { createCategory } from './category';

export async function createClient(form: CreateClientSchemaType) {
  const { userId } = await auth();
  if (!userId) throw new Error('Yetkisiz erişim.');

  const validatedFields = CreateClientSchema.safeParse(form);

  if (!validatedFields.success) {
    return { error: 'Form verileri geçersiz.' };
  }

  const { name, description } = validatedFields.data;

  try {
    await prisma.client.create({
      data: {
        userId,
        name,
        description,
        logo: null,
      },
    });

    revalidatePath('/work-track/clients');
    return { success: true };
  } catch (error) {
    console.error('İşlem ekleme hatası:', error);
    return { error: 'Bir hata oluştu.' };
  }
}

export async function updateClient(clientId: string, data: Partial<CreateClientSchemaType>) {
  const { userId } = await auth();
  if (!userId) throw new Error('Yetkisiz erişim.');

  try {
    const existingClient = await prisma.project.findUnique({
      where: { id: clientId, userId: userId },
    });

    if (existingClient) {
      return { error: 'İşlem gerçekleşmedi' };
    }

    //kullanıcının sahip olduğu projeler olsa bile burada silme işlemini yaptır.
    await prisma.client.update({ where: { id: clientId, userId: userId }, data: data });
    revalidatePath(`http://localhost:3000/work-track/clients/${clientId}`);
    return {
      success: true,
    };
  } catch (error) {
    console.error('İşlem yapılamdı:', error);
    return { error: 'Bir hata oluştu.' };
  }
}

export async function deleteClient(clientId: string) {
  const { userId } = await auth();

  if (!userId) throw new Error('Yetkisiz erişim.');

  try {
    const existClient = await prisma.client.findUnique({
      where: {
        id: clientId,
        userId: userId,
      },
    });

    if (!existClient) {
      return { error: 'Müşteri silinemedi' };
    }

    await prisma.client.delete({ where: { id: clientId, userId: userId } });

    return {
      success: true,
    };
  } catch (error) {
    console.error('hata:', error);
    return { error: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' };
  }
}
