'use server';

import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { CreateTaskSchema, CreateTaskType } from '../validators';

export async function createTask(data: CreateTaskType, projectId: string) {
  const { userId } = await auth();

  if (!userId) throw new Error('Yetkisiz erişim.');

  const validatedFields = CreateTaskSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: 'Form verileri geçersiz.' };
  }

  const { title } = data;

  try {
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject || existingProject.userId !== userId) {
      return { error: 'İşlem gerçekleşmedi' };
    }

    //task eklerken projede TODO status'a sahip task'ın son order değeri olarak eklenmeli. Yani son eklenen olmalı.
    const newTask = await prisma.$transaction(async (tx) => {
      const todoCount = await tx.task.count({
        where: {
          projectId: projectId,
          status: 'TODO',
        },
      });

      return await tx.task.create({
        data: {
          title,
          order: todoCount,
          projectId: projectId,
          status: 'TODO',
          userId,
        },
      });
    });

    return { success: true, data: newTask };
  } catch (error) {
    console.error('Task create error:', error);
    return { error: 'Görev eklenemedi.' };
  }
}

export async function updateTaskStatus(
  taskId: string,
  newStatus: TaskStatus,
  newOrder: number,
  projectId: string,
) {
  const { userId } = await auth();

  if (!userId) throw new Error('Yetkisiz erişim.');

  try {
    const data = await prisma.$transaction(async (tx) => {
      // İlk olarak task'ın statüsünü ve indexini güncelle
      const updatedTask = await tx.task.update({
        where: { id: taskId, projectId: projectId, userId: userId },
        data: {
          status: newStatus,
          order: newOrder,
        },
      });

      // Aynı sütundaki task'ları al
      const tasksInSameColumn = await tx.task.findMany({
        where: {
          status: newStatus,
          id: { not: taskId },
        },
        orderBy: { order: 'asc' },
      });

      // Toplu güncelleme için hazırla
      const bulkUpdateOperations = tasksInSameColumn.map((task, index) => {
        // Yeni index'ten sonraki task'ların sırasını ayarla
        const newOrder = index >= updatedTask.order ? index + 1 : index;

        return tx.task.update({
          where: { id: task.id },
          data: { order: newOrder },
        });
      });

      // Toplu güncellemeyi tek seferde yap
      const finalResult = await Promise.all(bulkUpdateOperations);
      return finalResult;
    });
    revalidatePath(`/work-track/clients`);
    return { success: true, data: data };
  } catch (error) {
    console.error('Task update error:', error);
    return { error: 'Görev güncellenemedi.' };
  }
}

export async function deleteTask(id: string) {
  const { userId } = await auth();

  if (!userId) throw new Error('Yetkisiz erişim.');

  try {
    const existTask = await prisma.task.findUnique({ where: { id: id } });
    if (!existTask || existTask.userId !== userId) {
      return { error: 'Görev bulunamadı' };
    }

    const data = await prisma.$transaction(async (tx) => {
      // Task'ı sil
      await tx.task.delete({ where: { id: id } });

      // Sadece silinen task'tan sonraki task'ları al
      const tasksAfterDeleted = await tx.task.findMany({
        where: {
          projectId: existTask.projectId,
          status: existTask.status,
          order: { gt: existTask.order }, // Silinen task'ın order'ından büyük olanlar
        },
        orderBy: { order: 'asc' },
      });

      // Her birinin order değerini 1 azalt
      const reorderOperations = tasksAfterDeleted.map((task) =>
        tx.task.update({
          where: { id: task.id },
          data: { order: task.order - 1 },
        }),
      );

      const finalValues = await Promise.all(reorderOperations);
      return finalValues;
    });

    return { success: true, data: data };
  } catch (error) {
    console.error('Task delete error:', error);
    return { error: 'Görev silinemedi.' };
  }
}
