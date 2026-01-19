import prisma from '@/lib/prisma';
import React from 'react';
import { auth } from '@clerk/nextjs/server';
import ClientList from './components/ClientList';
import CreateClientModal from '../components/CreateClientModal';

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
      <div className="flex items-center justify-between ">
        <h3 className="text-normal font-semibold">Proje Oluştur</h3>
        <CreateClientModal />
      </div>
      <ClientList clients={rawClients} />
    </div>
  );
};

export default ClientsPage;
