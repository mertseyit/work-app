// src/lib/actions/user.ts
'use server';

import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma'; // Prisma client importun

export async function checkAndAddUser() {
  // 1. Clerk'ten o anki kullanıcıyı al
  const clerkUser = await currentUser();

  if (!clerkUser) return null;

  // 2. Veritabanında bu ID ile kullanıcı var mı?
  const dbUser = await prisma.user.findUnique({
    where: {
      id: clerkUser.id,
    },
  });

  // 3. Varsa, kullanıcıyı döndür (işlem tamam)
  if (dbUser) {
    return dbUser;
  }

  // 4. Yoksa, yeni kullanıcı oluştur
  const newUser = await prisma.user.create({
    data: {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0].emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    },
  });

  return newUser;
}
