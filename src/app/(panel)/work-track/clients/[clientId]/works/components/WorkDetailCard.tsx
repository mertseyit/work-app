'use client';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/helpers/formatDate';
import formatPaymentStatus from '@/helpers/formatPaymentStatus';
import { getDeadlineStatus } from '@/helpers/getDeadLineStatus';
import { BadgeTurkishLira, CalendarClock, ListTodo } from 'lucide-react';
import KanbanBoard from './KanbanBoard';
import Link from 'next/link';

interface WorkDetailCardProps {
  project: Project;
}

const WorkDetailCard = ({ project }: WorkDetailCardProps) => {
  const paymentStatus = formatPaymentStatus(project.paymentStatus);
  const deadLineStatus = getDeadlineStatus(project.endDate);
  return (
    <div className="grid grid-cols-9 gap-3">
      <div className="col-span-3">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2">
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </div>
            <CardAction>-</CardAction>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 text-sm">
              <div className="flex flex-col gap-2 w-full">
                <span className="font-semibold">Proje Başlangıç Tarihi</span>
                <span
                  className={
                    'text-xs flex border items-center justify-center gap-2 py-2 px-2 rounded-lg font-semibold'
                  }
                >
                  {formatDate(project.startDate, 'hours')}
                </span>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <span className="font-semibold">Teslim Tarihi</span>
                <span
                  className={
                    deadLineStatus.className +
                    ' text-xs flex items-center justify-center gap-2 py-2 px-2 rounded-lg font-semibold'
                  }
                >
                  <CalendarClock size={16} />
                  {deadLineStatus.label}
                </span>
              </div>
            </div>
            <Separator className="my-5" />
            <div className="flex gap-2 text-sm">
              <div className="flex flex-col gap-2 w-full">
                <span className="font-semibold">Ödeme Durumu</span>
                <span
                  className={
                    paymentStatus.className +
                    ' text-xs flex items-center justify-center gap-2 py-2 px-2 rounded-lg font-semibold'
                  }
                >
                  <BadgeTurkishLira size={16} />
                  {paymentStatus.label}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p>Card Footer</p>
          </CardFooter>
        </Card>
        <Card className="mt-3">
          <CardHeader>
            <CardTitle>Detay Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 w-full justify-between items-center gap-y-5">
              <span className="font-semibold col-span-3 text-sm">Müşteri: </span>
              <Link
                href={`/work-track/clients/${project.client?.id}`}
                className="font-semibold col-span-3  text-sm block "
              >
                {project.client?.name}
              </Link>
              <span className="font-semibold col-span-3 text-sm">Teklif Verilen Ücret: </span>
              <span className="font-semibold col-span-3 text-green-600 text-sm block ">
                {project.price} ₺
              </span>
              <span className="font-semibold col-span-3 text-sm">Kullanılan Teknolojiler: </span>
              <div className="font-semibold col-span-3 text-sm flex flex-wrap gap-1">
                {project.techStack.map((item, key) => (
                  <Badge variant={'secondary'} key={key}>
                    {item}
                  </Badge>
                ))}
              </div>
              <span className="font-semibold col-span-3 text-sm">Yapılan Toplantılar: </span>
              <span className="font-semibold col-span-3 text-sm block ">
                {project.meetCount} Adet
              </span>
            </div>
          </CardContent>
          <CardFooter>-</CardFooter>
        </Card>
      </div>
      <div className="col-span-1 lg:col-span-6 flex flex-col h-full">
        {/* Başlık Alanı */}
        <div className="bg-card p-4 rounded-lg border mb-3 flex items-center justify-between">
          <h5 className="flex items-center gap-2 font-semibold text-accent-foreground">
            Kanban Grafik
          </h5>
          <Badge variant="outline">Toplam {project.tasks?.length || 0} Görev</Badge>
        </div>

        {/* KANBAN BOARD BİLEŞENİ */}
        <div className="flex-1">
          {/* Tasks varsa board'u göster, yoksa boş state */}
          {project.tasks ? (
            <KanbanBoard initialTasks={project.tasks} />
          ) : (
            <div className="text-center p-10 text-slate-400 border-2 border-dashed rounded-lg">
              Henüz görev eklenmemiş.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkDetailCard;
