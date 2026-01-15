import prisma from '@/lib/prisma';
import React from 'react';
import { auth } from '@clerk/nextjs/server';
import ClientList from './components/ClientList';

const ClientsPage = async () => {
  const { userId } = await auth();
  const rawClients = await prisma.client.findMany({
    where: {
      userId: userId!,
    },
    orderBy: { createdAt: 'asc' },
  });
  return (
    <div className="x-container py-6">
      <ClientList clients={rawClients} />
    </div>
  );
};

export default ClientsPage;
