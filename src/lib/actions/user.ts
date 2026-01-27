// src/lib/actions/user.ts
'use server';

import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function checkAndAddUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) return null;

  const dbUser = await prisma.user.findUnique({
    where: {
      id: clerkUser.id,
    },
  });

  if (dbUser) {
    return dbUser;
  }

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
