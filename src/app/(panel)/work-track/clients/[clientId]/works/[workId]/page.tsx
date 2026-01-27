import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import React from 'react';
import WorkDetailCard from '../components/WorkDetailCard';

const WorkDetailPage = async ({
  params,
}: {
  params: Promise<{ clientId: string; workId: string }>;
}) => {
  const { userId } = await auth();
  const { clientId, workId } = await params;

  const rawProject = await prisma.project.findUnique({
    where: {
      id: workId!,
      userId: userId!,
      clientId: clientId,
    },
    include: {
      client: true,
      tasks: {
        orderBy: {
          order: 'asc',
        },
      },
      notes: true,
      revisions: true,
    },
  });

  const noteList = await prisma.noteList.findMany({
    where: { userId: userId! },
    select: {
      id: true,
      title: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!rawProject) {
    return (
      <p className="text-center text-xs text-red-600 font-semibold my-4">
        Hay aksi :( Kayıt bulunamadı.
      </p>
    );
  }

  const project = {
    ...rawProject,
    price: rawProject.price.toNumber(),
    paidAmount: rawProject.paidAmount.toNumber(),
  };

  return (
    <div className="x-container py-6">
      <WorkDetailCard noteList={noteList} project={project} />
    </div>
  );
};

export default WorkDetailPage;
