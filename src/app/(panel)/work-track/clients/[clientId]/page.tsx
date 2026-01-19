import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import ClientCard from '../../components/ClientCard';
import CreateClientProjectSheet from './works/components/CreateClientProjectSheet';

const ClientDetailPage = async ({ params }: { params: Promise<{ clientId: string }> }) => {
  const { clientId } = await params;
  const { userId } = await auth();
  const rawClient = await prisma.client.findUnique({
    where: {
      id: clientId!,
      userId: userId!,
    },
    include: {
      projects: {
        orderBy: { updatedAt: 'desc' },
        include: {
          client: true,
        },
      },
    },
  });

  if (!rawClient) {
    return (
      <p className="text-center text-xs text-red-600 font-semibold my-4">
        Hay aksi :( Kayıtlı müşteri bulunamadı.
      </p>
    );
  }

  const client = {
    ...rawClient,
    projects: rawClient.projects.map((project) => ({
      ...project,
      // Prisma Decimal nesnesini JavaScript Number'a çeviriyoruz
      price: project.price.toNumber(),
      paidAmount: project.price.toNumber(),
    })),
  };
  return (
    <div className="x-container py-6">
      <div className="flex mb-4 items-center justify-end gap-2">
        <CreateClientProjectSheet clientId={client.id} />
      </div>
      <ClientCard showDetailLink={false} client={client} />
    </div>
  );
};

export default ClientDetailPage;
