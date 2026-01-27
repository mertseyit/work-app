'use client';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/helpers/formatDate';
import formatPaymentStatus from '@/helpers/formatPaymentStatus';
import formatProjectStatus from '@/helpers/formatProjectStatus';
import { getDeadlineStatus } from '@/helpers/getDeadLineStatus';
import {
  ArrowRight,
  BadgeTurkishLira,
  CalendarClock,
  ChevronsLeftRight,
  ChevronsRightLeft,
  Ellipsis,
  Info,
  Trash,
} from 'lucide-react';
import KanbanBoard from './KanbanBoard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useTransition } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { deleteClientProject } from '@/lib/actions/project';
import { useRouter } from 'next/navigation';
import UpdateClientProjectModal from './UpdateClientProjectModal';
import CreateNewNoteInput from '@/app/(panel)/note/components/CreateNewNoteInput';
import NoteItem from '@/app/(panel)/note/components/NoteItem';
import { ScrollArea } from '@/components/ui/scroll-area';
interface WorkDetailCardProps {
  project: Project;
  noteList: { id: string; title: string }[];
}

const WorkDetailCard = ({ project, noteList }: WorkDetailCardProps) => {
  const router = useRouter();
  const paymentStatus = formatPaymentStatus(project.paymentStatus);
  const projectStatus = formatProjectStatus(project.status);
  const deadLineStatus = getDeadlineStatus(project.endDate);
  const [isDetailCardOpen, setIsDetailCardOpen] = useState(true);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteClientProject(project.id);
      if (res.error) {
        toast.error('Bir Hata Meydana Geldi: ' + res.error, {
          position: 'top-center',
        });
      } else {
        toast.success(project.name + ' projesi silindi !', {
          position: 'top-center',
        });
        router.push(`/work-track/clients/${project.clientId}`);
      }
    });
  };

  return (
    <div className="grid grid-cols-9 gap-3">
      <div
        className={`
        ${isDetailCardOpen ? 'col-span-3' : 'col-span-0'} 
        transition-all duration-300 ease-in-out
        overflow-hidden
      `}
      >
        <Card
          className={`
            transition-all duration-300 ease-in-out
            ${
              isDetailCardOpen
                ? 'opacity-100 translate-x-0 visible'
                : 'opacity-0 -translate-x-full hidden'
            }
          `}
        >
          <CardHeader>
            <div className="flex flex-col gap-2 w-full">
              <CardTitle className="flex items-center justify-between w-full">
                <div>{project.name}</div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="ms-auto">
                    <Button size={'icon-sm'} variant={'ghost'}>
                      <Ellipsis />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="flex flex-col gap-1">
                    <DropdownMenuItem asChild>
                      <DeleteModal
                        handleDelete={handleDelete}
                        isPending={isPending}
                        projectName={project.name}
                      />
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <UpdateClientProjectModal project={project} />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </div>
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
            <div className="flex items-center justify-center gap-3">
              <div className="flex gap-2 text-sm w-full">
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
              <div className="flex gap-2 text-sm w-full">
                <div className="flex flex-col gap-2 w-full">
                  <span className="font-semibold">Proje Durumu</span>
                  <span
                    className={
                      projectStatus.className +
                      ' text-xs flex items-center justify-center gap-2 py-2 px-2 rounded-lg font-semibold'
                    }
                  >
                    {projectStatus.label}
                  </span>
                </div>
              </div>
            </div>
            <Separator className="my-5" />
            <h5 className="font-semibold block ">İş Detay</h5>
            <Separator className="my-3" />
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
              <span className="font-semibold col-span-3 text-sm flex items-center gap-1">
                Ödenen Tutar:
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">
                      Bu proje için şu ana kadar alınan toplam ödeme tutarını gösterir.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </span>
              <span className="font-semibold col-span-3 text-green-600 text-sm block">
                {project.paidAmount || '-'} ₺
              </span>
              <span className="font-semibold col-span-3 text-sm">Kullanılan Teknolojiler: </span>
              <div className="font-semibold col-span-3 text-sm flex flex-wrap gap-1">
                {project.techStack.length === 0 ? (
                  <span className="text-xs text-accent-foreground">Girilmemiş</span>
                ) : (
                  <>
                    {project.techStack.map((item, key) => (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[11px] dark:bg-purple-950 dark:text-purple-300"
                        key={key}
                      >
                        {item}
                      </span>
                    ))}
                  </>
                )}
              </div>
              <span className="font-semibold col-span-3 text-sm">Kategori: </span>
              <div className="font-semibold col-span-3 text-sm flex flex-wrap gap-1">
                {project.category || (
                  <span className="text-xs text-accent-foreground">Girilmemiş</span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mt-8">
              <h5 className="font-semibold block ">İlişkili Notlar</h5>
              <Link
                href={'/notes'}
                className="text-xs font-semibold flex items-center justify-end gap-2"
              >
                Tüm Notlarım <ArrowRight size={12} />
              </Link>
            </div>
            <Separator className="my-3" />
            {project.notes?.length !== 0 ? (
              <ScrollArea className="h-[240px]">
                {project.notes?.map((note) => (
                  <NoteItem key={note.id} note={note} selectedColor="" />
                ))}
              </ScrollArea>
            ) : (
              <p className="text-xs text-accent-foreground my-3">Henüz hiç notunuz bulunmamakta</p>
            )}
            <div className="bg-background w-full mt-3">
              <CreateNewNoteInput
                noteList={noteList}
                projectList={[{ ...project }]}
                selectDefaultProject={true}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      <div
        className={`
          ${isDetailCardOpen ? 'col-span-6' : 'col-span-9'} 
          transition-all duration-300 ease-in-out
        `}
      >
        <div className="flex items-start justify-start gap-2">
          {/* KANBAN BOARD BİLEŞENİ */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsDetailCardOpen((prev) => !prev)}
                size={'icon-sm'}
                variant={'outline'}
              >
                {!isDetailCardOpen ? <ChevronsRightLeft /> : <ChevronsLeftRight />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span>{isDetailCardOpen ? 'Genişlet' : 'Daralt'}</span>
            </TooltipContent>
          </Tooltip>
          <div className="flex-1">
            {['COMPLETED', 'CANCELLED', 'PAUSED'].includes(project.status) ? (
              <div className="border border-dashed border-green-600/40 p-4 rounded-lg">
                <p className="text-sm">
                  Bu projenin durumunu
                  <b style={{ color: projectStatus.iconColor }}>{projectStatus.label}</b> olarak
                  işaretlediniz. Artık bu proje için görev tanımlaması yapamazsanız.
                </p>
              </div>
            ) : (
              <>
                {/* Başlık Alanı */}
                <div className="bg-card p-4 rounded-lg border mb-3 flex items-center justify-between">
                  <div className="flex items-center justify-start gap-2">
                    <h5 className="flex items-center gap-2 font-semibold text-accent-foreground">
                      <span className="text-purple-600">{project.name}</span> - Kanban Grafik
                    </h5>
                  </div>
                  <Badge variant="outline">Toplam {project.tasks?.length || 0} Görev</Badge>
                </div>
                {/* Tasks varsa board'u göster, yoksa boş state */}
                {project.tasks ? (
                  <KanbanBoard initialTasks={project.tasks} projectId={project.id} />
                ) : (
                  <div className="text-center p-10 text-slate-400 border-2 border-dashed rounded-lg">
                    Henüz görev eklenmemiş.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

//client project delete modal
interface DeleteModalPropos {
  projectName: string;
  handleDelete: () => void;
  isPending: boolean;
}

const DeleteModal = ({ projectName, handleDelete, isPending }: DeleteModalPropos) => {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant={'ghost'} className="w-auto justify-start" size={'sm'}>
            <Trash className="text-red-600" />
            Projeyi Sil
          </Button>
        </DialogTrigger>
        <DialogContent className="border-red-500 ">
          <DialogHeader>
            <DialogTitle>
              <span className="font-semibold text-red-600">{`"${projectName}"`}</span> Projesini
              Silmek İstediğinizden Emin Misiniz ?{' '}
            </DialogTitle>
            <DialogDescription>
              Bu işlem geri alınamaz. Bu projeyi sildiğinizde, projeye ait tüm <b>görevler</b>,{' '}
              <b>revizeler</b> ve <b>veriler</b> kalıcı olarak silinecektir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Vazgeç</Button>
            </DialogClose>
            <Button
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isPending ? 'Siliniyor...' : 'Evet, Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

//client project complate modal

export default WorkDetailCard;
