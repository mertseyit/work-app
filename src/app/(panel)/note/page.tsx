import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import NotesTabMenu from './components/NotesTabMenu';

const NotePage = async () => {
  const { userId } = await auth();

  const noteList = await prisma.noteList.findMany({
    where: { userId: userId! },
    include: {
      _count: {
        //notes değerlerini count olarak ekle sadece
        select: { notes: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const notes = await prisma.note.findMany({
    where: {
      userId: userId!,
    },
    orderBy: { createdAt: 'desc' },
  });

  const projectList = await prisma.project.findMany({
    where: {
      userId: userId!,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className=" x-container py-6">
      <div>
        <h3 className="text-normal font-semibold">Notlarım</h3>
      </div>
      <NotesTabMenu projectlist={projectList} noteList={noteList} notes={notes} />
    </div>
  );
};

export default NotePage;
