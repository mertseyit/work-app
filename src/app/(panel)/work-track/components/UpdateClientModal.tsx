'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateClientSchema, CreateClientSchemaType } from '@/lib/validators';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { updateClient } from '@/lib/actions/client';

interface Client {
  id: string;
  name: string;
  description?: string | null;
}

interface UpdateClientModalProps {
  client: Client;
}

const UpdateClientModal = ({ client }: UpdateClientModalProps) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateClientSchemaType>({
    resolver: zodResolver(CreateClientSchema),
    defaultValues: {
      name: client.name,
      description: client.description ?? '',
    },
  });

  const onSubmit = (data: CreateClientSchemaType) => {
    startTransition(async () => {
      const response = await updateClient(client.id, data);
      if (response.error) {
        toast.error(response.error, {
          position: 'top-center',
        });
      } else {
        toast.success('Müşteri Güncellendi', {
          position: 'top-center',
        });
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="p-0 m-0">
        <Button variant={'ghost'} className="w-auto justify-start" size={'sm'}>
          <Pencil className="text-blue-600" />
          Müşteriyi Düzenle
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Müşteriyi Düzenle</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label className="mb-3" htmlFor="name">
              Müşteri / Kurum Adı
            </Label>
            <Input id="name" {...form.register('name')} />
            {form.formState.errors.name && (
              <span className="text-xs text-red-500">{form.formState.errors.name.message}</span>
            )}
          </div>
          <div className="space-y-1">
            <Label className="mb-3" htmlFor="description">
              Açıklama
            </Label>
            <Textarea id="description" {...form.register('description')} />
            {form.formState.errors.description && (
              <span className="text-xs text-red-500">
                {form.formState.errors.description.message}
              </span>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Vazgeç
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateClientModal;
