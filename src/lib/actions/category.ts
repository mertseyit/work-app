// src/lib/actions/category.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma'; // Prisma client dosyan
import { CreateCategorySchema, CreateCategorySchemaType } from '@/lib/validators';
import { revalidatePath } from 'next/cache';

export async function createCategory(form: CreateCategorySchemaType) {
  // 1. Kullanıcı giriş yapmış mı?
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Yetkisiz erişim. Lütfen giriş yapın.');
  }

  // 2. Gelen veriyi Zod ile doğrula
  const validatedFields = CreateCategorySchema.safeParse(form);

  if (!validatedFields.success) {
    return { error: 'Form verileri geçersiz.' };
  }

  const { name, type } = validatedFields.data;

  try {
    // 3. Veritabanına kaydet
    await prisma.category.create({
      data: {
        userId,
        name,
        type,
      },
    });

    // 4. Sayfayı yenile (Yeni kategori listeye düşsün)
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
      return { error: 'İşlem bulunamadı veya silme yetkiniz yok.' };
    }

    //ilişkisel verileri silerken, o ilişkiye sahip diğer verileri de manuel sil.
    await prisma.transaction.deleteMany({
      where: { categoryId: id },
    });

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
