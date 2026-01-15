'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateTaskStatus(taskId: string, newStatus: TaskStatus) {
  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus },
    });

    // Veri güncellendiğinde sayfayı yenile (Cache temizle)
    revalidatePath('/workstation');
    return { success: true };
  } catch (error) {
    console.error('Task update error:', error);
    return { error: 'Görev güncellenemedi.' };
  }
}
