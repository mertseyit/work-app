'use server';

import { CreateNoteSchema, CreateNoteSchemaType } from '@/lib/validators';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import prisma from '../prisma';

export async function createNote(data: CreateNoteSchemaType) {
  const { userId } = await auth();

  if (!userId) throw new Error('Yetkisiz erişim.');

  const validatedFields = CreateNoteSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: 'Form verileri geçersiz.' };
  }

  const {
    title,
    isImportant,
    isCompleted,
    remindAt,
    dueDate,
    recurrenceType,
    recurrenceInterval,
    listId,
    projectId,
  } = validatedFields.data;

  try {
    await prisma.note.create({
      data: {
        title,
        isImportant,
        isCompleted,
        remindAt,
        dueDate,
        recurrenceType,
        recurrenceInterval,
        listId,
        projectId,
        userId: userId,
      },
    });

    revalidatePath('/notes');
    return { success: true };
  } catch (error) {
    console.error('Note creation error:', error);
    return { error: 'Not oluşturulurken bir hata oluştu.' };
  }
}

export async function updateNote(noteId: string, data: Partial<CreateNoteSchemaType>) {
  const { userId } = await auth();
  if (!userId) throw new Error('Yetkisiz erişim.');

  try {
    const existNote = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!existNote || existNote.userId !== userId) {
      return { error: 'Not bulunamadı veya erişim yetkiniz yok.' };
    }

    await prisma.note.update({
      where: { id: noteId, userId: userId },
      data: {
        ...data,
        // undefined değerleri filtreleme (sadece gönderilen alanları güncelle)
        ...(data.remindAt === undefined ? {} : { remindAt: data.remindAt }),
        ...(data.dueDate === undefined ? {} : { dueDate: data.dueDate }),
        ...(data.recurrenceType === undefined ? {} : { recurrenceType: data.recurrenceType }),
        ...(data.recurrenceInterval === undefined
          ? {}
          : { recurrenceInterval: data.recurrenceInterval }),
        ...(data.projectId === undefined ? {} : { projectId: data.projectId }),
        ...(data.listId === undefined ? {} : { listId: data.listId }),
      },
    });

    revalidatePath('/notes');
    return { success: true };
  } catch (error) {
    console.error('Note update error:', error);
    return { error: 'Not güncellenirken bir hata oluştu.' };
  }
}

export async function deleteNote(noteId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Yetkisiz erişim.');

  try {
    const existNote = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!existNote || existNote.userId !== userId) {
      return { error: 'Not bulunamadı veya erişim yetkiniz yok.' };
    }

    await prisma.note.delete({
      where: { id: noteId, userId: userId },
    });

    revalidatePath('/notes');
    return { success: true };
  } catch (error) {
    console.error('Note delete error:', error);
    return { error: 'Not silinirken bir hata oluştu.' };
  }
}
