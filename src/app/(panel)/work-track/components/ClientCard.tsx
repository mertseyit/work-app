'use client';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ellipsis, Eye, Link2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import ProjectCard from './ProjectCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DialogClose, DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { deleteClient } from '@/lib/actions/client';
import { useTransition } from 'react';
import UpdateClientModal from './UpdateClientModal';

interface ClientWithProjects extends Client {
  projects: Project[];
}

interface ClientCardProps {
  client: ClientWithProjects;
  showDetailLink?: boolean;
}

const ClientCard = ({ client, showDetailLink = true }: ClientCardProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteClient(client.id);
      if (res.error) {
        toast.error('Bir Hata Meydana Geldi: ' + res.error, {
          position: 'top-center',
        });
      } else {
        toast.success(client.name + ' müşterisi silindi !', {
          position: 'top-center',
        });
        router.push(`/work-track/clients/`);
      }
    });
  };
  return (
    <Card className="mb-5">
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between w-full">
          {showDetailLink ? (
            <Link
              href={`/work-track/clients/${client.id}`}
              className=" flex items-center justify-end gap-1 font-semibold"
            >
              <Link2 />
              {client.name}
            </Link>
          ) : (
            <>{client.name}</>
          )}
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
                  clientName={client.name}
                />
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <UpdateClientModal client={client} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-3">
        {client.projects.length === 0 ? (
          <div className="col-span-3 w-full p-3 rounded border-dashed border">
            <p className=" text-center py-4 text-xs font-semibold">Henüz hiç kayıt yok</p>
          </div>
        ) : (
          <>
            {client.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
};

interface DeleteModalPropos {
  clientName: string;
  handleDelete: () => void;
  isPending: boolean;
}

const DeleteModal = ({ clientName, handleDelete, isPending }: DeleteModalPropos) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={'ghost'} className="w-auto justify-start" size={'sm'}>
          <Trash2 className="text-red-600" />
          Müşteriyi Sil
        </Button>
      </DialogTrigger>
      <DialogContent className="border-red-500 ">
        <DialogHeader>
          <DialogTitle>
            <span className="font-semibold text-red-600">{`"${clientName}"`}</span> Müşterisini
            Silmek İstediğinizden Emin Misiniz ?{' '}
          </DialogTitle>
          <DialogDescription>
            Bu işlem geri alınamaz. Bu müşteriyi sildiğinizde, projeye ait tüm <b>çalışmalar</b> ve
            <b>veriler</b> kalıcı olarak silinecektir.
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
  );
};

export default ClientCard;
