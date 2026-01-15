import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import ClientCard from './components/ClientCard';

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
    })),
  }));
  return (
    <div className="grid grid-cols-8 gap-4 x-container py-3">
      <h3 className="col-span-8 font-semibold">Ana Sayfa</h3>
      <div className="lg:col-span-6 col-span-8">
        {clients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>
      <div className="lg:col-span-2 col-span-8 border rounded-2xl p-3"></div>
    </div>
  );
};

export default WorkTrackPage;
