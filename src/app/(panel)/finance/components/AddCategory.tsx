'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCategorySchema, CreateCategorySchemaType } from '@/lib/validators';
import { createCategory } from '@/lib/actions/category';

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

const AddCategory = () => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateCategorySchemaType>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      name: '',
      type: 'EXPENSE',
    },
  });

  const onSubmit = (data: CreateCategorySchemaType) => {
    startTransition(async () => {
      const response = await createCategory(data);
      if (response.error) {
        toast.error(response.error, {
          position: 'top-center',
        });
      } else {
        toast.success('Kategori Eklendi', {
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
        <Button size={'sm'} className="text-xs text-white w-full bg-purple-600 hover:bg-purple-700">
          Kategori Ekle
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kategori Ekle</DialogTitle>
        </DialogHeader>

        {/* Form Başlangıcı */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* İsim Alanı */}
          <div className="space-y-1">
            <Label htmlFor="name">Kategori Adı</Label>
            <Input id="name" placeholder="Örn: Mutfak" {...form.register('name')} />
            {form.formState.errors.name && (
              <span className="text-xs text-red-500">{form.formState.errors.name.message}</span>
            )}
          </div>

          {/* Gelir / Gider Seçimi */}
          <div className="space-y-1">
            <Label>Tür</Label>
            <RadioGroup
              defaultValue="EXPENSE"
              onValueChange={(value) => form.setValue('type', value as 'INCOME' | 'EXPENSE')}
              className="flex gap-4"
            >
              <div className="flex items-center justify-start gap-2">
                <RadioGroupItem value="INCOME" id="INCOME" />
                <Label htmlFor="INCOME" className="text-green-600 font-bold cursor-pointer">
                  Gelir
                </Label>
              </div>
              <div className="flex items-center justify-start gap-2">
                <RadioGroupItem value="EXPENSE" id="EXPENSE" />
                <Label htmlFor="EXPENSE" className="text-red-600 font-bold cursor-pointer">
                  Gider
                </Label>
              </div>
            </RadioGroup>
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

export default AddCategory;
