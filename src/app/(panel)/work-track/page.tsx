import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import ClientCard from './components/ClientCard';
import CreateClientModal from './components/CreateClientModal';

const WorkTrackPage = async () => {
  const { userId } = await auth();
  const rawClients = await prisma.client.findMany({
    where: {
      userId: userId!,
    },
    take: 5,
    orderBy: { createdAt: 'asc' },
    include: {
      projects: {
        take: 3,
        orderBy: { updatedAt: 'desc' },
        include: {
          client: true,
        },
      },
    },
  });
  const clients = rawClients.map((client) => ({
    ...client,
    projects: client.projects.map((project) => ({
      ...project,
      // Prisma Decimal nesnesini JavaScript Number'a çeviriyoruz
      price: project.price.toNumber(),
      paidAmount: project.paidAmount.toNumber(),
    })),
  }));
  return (
    <div className="grid grid-cols-8 gap-4 x-container py-6">
      <div className="col-span-8 flex items-center justify-between ">
        <h3 className="text-normal font-semibold">Ana Sayfa</h3>
        <CreateClientModal />
      </div>
      <div className="lg:col-span-6 col-span-8">
        {clients.length === 0 ? (
          <div className="flex items-center justify-center p-3 rounded-lg border border-dashed">
            <p className="text-xs font-semibold text-center">Henüz kayıt yok</p>
          </div>
        ) : (
          <>
            {clients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </>
        )}
      </div>
      <div className="lg:col-span-2 col-span-8 border rounded-2xl p-3"></div>
    </div>
  );
};

export default WorkTrackPage;
