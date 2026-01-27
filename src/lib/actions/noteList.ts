'use server';

import { auth } from '@clerk/nextjs/server';
import { CreateListSchema, CreateListSchemaType } from '../validators';
import prisma from '../prisma';
import { revalidatePath } from 'next/cache';

export async function createNoteList(form: CreateListSchemaType) {
  const { userId } = await auth();
  if (!userId) throw new Error('Yetkisiz erişim.');

  const validatedFields = CreateListSchema.safeParse(form);

  if (!validatedFields.success) {
    return { error: 'Form verileri geçersiz.' };
  }

  const { title, description, color } = validatedFields.data;

  try {
    await prisma.noteList.create({ data: { title, description, userId, color } });
    revalidatePath('/notes');
    return { success: true };
  } catch (error) {
    console.error('Liste ekleme hatası:', error);
    return { error: 'Bir hata oluştu.' };
  }
}

export async function updateNoteList(listId: string, data: Partial<CreateListSchemaType>) {
  const { userId } = await auth();
  if (!userId) throw new Error('Yetkisiz erişim.');

  try {
    const existList = await prisma.noteList.findUnique({
      where: { id: listId },
    });

    if (!existList || existList.userId !== userId) {
      return { error: 'Liste bulunamadı veya erişim yetkiniz yok.' };
    }

    await prisma.noteList.update({
      where: { id: listId, userId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.color !== undefined && { color: data.color }),
      },
    });

    revalidatePath('/notes');
    return { success: true };
  } catch (error) {
    console.error('Liste güncelleme hatası:', error);
    return { error: 'Liste güncellenirken bir hata oluştu.' };
  }
}

export async function deleteNoteList(listId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Yetkisiz erişim.');

  try {
    const existList = await prisma.noteList.findUnique({
      where: { id: listId },
    });

    if (!existList || existList.userId !== userId) {
      return { error: 'Liste bulunamadı veya erişim yetkiniz yok.' };
    }

    await prisma.noteList.delete({
      where: { id: listId, userId },
    });

    revalidatePath('/notes');
    return { success: true };
  } catch (error) {
    console.error('Liste silme hatası:', error);
    return { error: 'Liste silinirken bir hata oluştu.' };
  }
}
