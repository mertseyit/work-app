// src/lib/actions/category.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { CreateCategorySchema, CreateCategorySchemaType } from '@/lib/validators';
import { revalidatePath } from 'next/cache';

export async function createCategory(form: CreateCategorySchemaType) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Yetkisiz erişim. Lütfen giriş yapın.');
  }

  const validatedFields = CreateCategorySchema.safeParse(form);

  if (!validatedFields.success) {
    return { error: 'Form verileri geçersiz.' };
  }

  const { name, type } = validatedFields.data;

  try {
    // Aynı kategori var mı kontrol et
    const existingCategory = await prisma.category.findUnique({
      where: {
        userId_name_type: {
          userId,
          name,
          type,
        },
      },
    });

    if (existingCategory) {
      return {
        error: `"${name}" adında bir ${type === 'INCOME' ? 'gelir' : 'gider'} kategorisi zaten mevcut.`,
      };
    }

    await prisma.category.create({
      data: {
        userId,
        name,
        type,
      },
    });

    revalidatePath('/finance');
    return { success: true };
  } catch (error) {
    console.error('Kategori oluşturma hatası:', error);
    return { error: 'Bir hata oluştu, lütfen tekrar deneyin.' };
  }
}

export async function deleteCategory(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Yetkisiz erişim.');

  try {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category || category.userId !== userId) {
      return { error: 'İşlem Yapılamadı' };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath('/finance');
    return { success: true };
  } catch (error) {
    console.error('Silme hatası:', error);
    return { error: 'Silinirken bir hata oluştu.' };
  }
}
