// src/lib/actions/transaction.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { CreateTransactionSchema, CreateTransactionSchemaType } from '@/lib/validators';
import { revalidatePath } from 'next/cache';

export async function createTransaction(form: CreateTransactionSchemaType) {
  const { userId } = await auth();
  if (!userId) throw new Error('Yetkisiz erişim.');

  const validatedFields = CreateTransactionSchema.safeParse(form);

  if (!validatedFields.success) {
    return { error: 'Form verileri geçersiz.' };
  }

  const { title, amount, type, categoryId } = validatedFields.data;

  try {
    await prisma.transaction.create({
      data: {
        userId,
        title,
        amount,
        type,
        categoryId,
        date: new Date(), // Şu anki tarih
      },
    });

    revalidatePath('/finance');
    return { success: true };
  } catch (error) {
    console.error('İşlem ekleme hatası:', error);
    return { error: 'Bir hata oluştu.' };
  }
}

export async function deleteTransaction(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Yetkisiz erişim.');

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction || transaction.userId !== userId) {
      return { error: 'İşlem bulunamadı veya silme yetkiniz yok.' };
    }

    await prisma.transaction.delete({
      where: { id },
    });

    revalidatePath('/finance');
    return { success: true };
  } catch (error) {
    console.error('Silme hatası:', error);
    return { error: 'Silinirken bir hata oluştu.' };
  }
}
