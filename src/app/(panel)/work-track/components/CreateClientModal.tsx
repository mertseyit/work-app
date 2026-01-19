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
import { UserPlus } from 'lucide-react';
import { createClient } from '@/lib/actions/client';
import { Textarea } from '@/components/ui/textarea';

const CreateClientModal = () => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateClientSchemaType>({
    resolver: zodResolver(CreateClientSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = (data: CreateClientSchemaType) => {
    startTransition(async () => {
      const response = await createClient(data);
      if (response.error) {
        toast.error(response.error, {
          position: 'top-center',
        });
      } else {
        toast.success('Müşteri Kaydı Oluşturuldu', {
          position: 'top-center',
        });
        form.reset();
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white" size={'sm'}>
          <UserPlus /> Müşteri Kaydı Oluştur
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Müşteri Kaydı Oluştur</DialogTitle>
        </DialogHeader>

        {/* Form Başlangıcı */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Gelir / Gider Seçimi */}
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
            {form.formState.errors.name && (
              <span className="text-xs text-red-500">{form.formState.errors.name.message}</span>
            )}
          </div>

          <DialogFooter>
            {/* Vazgeç butonu: type="button" önemli yoksa formu submit eder */}
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

export default CreateClientModal;
