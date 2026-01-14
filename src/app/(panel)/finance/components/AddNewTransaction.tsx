'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateTransactionSchema, CreateTransactionSchemaType } from '@/lib/validators';
import { createTransaction } from '@/lib/actions/transaction';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Bileşene prop olarak kategorileri gönderiyoruz
interface AddNewTransactionProps {
  categories: Category[]; // types.d.ts dosyasındaki tip
}

const AddNewTransaction = ({ categories }: AddNewTransactionProps) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: {
      title: '',
      amount: 0,
      type: 'EXPENSE',
      categoryId: '',
    },
  });

  // Anlık seçilen tipi izle (Gelir mi Gider mi?)
  // Buna göre Select içindeki kategorileri filtreleyeceğiz.
  const selectedType = form.watch('type');

  const filteredCategories = categories.filter((cat) => cat.type === selectedType);

  const onSubmit = (data: CreateTransactionSchemaType) => {
    startTransition(async () => {
      const response = await createTransaction(data);
      if (response.error) {
        toast.error(response.error, {
          position: 'top-center',
        });
      } else {
        toast.success('İşlem kaydedildi', {
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
        <Button size={'sm'} className="text-xs text-white bg-green-600 w-full hover:bg-green-700">
          Yeni İşlem Oluştur
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni İşlem Oluştur</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Başlık */}
          <div className="space-y-1">
            <Input type="text" placeholder="Başlık (Örn: Market)" {...form.register('title')} />
            {form.formState.errors.title && (
              <span className="text-xs text-red-500">{form.formState.errors.title.message}</span>
            )}
          </div>

          {/* Gelir / Gider Radyo Butonları */}
          <RadioGroup
            defaultValue="EXPENSE"
            onValueChange={(val) => {
              form.setValue('type', val as 'INCOME' | 'EXPENSE');
              form.setValue('categoryId', ''); // Tip değişince seçili kategori sıfırlanmalı
            }}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2 border p-2 rounded-md w-full justify-center">
              <RadioGroupItem value="INCOME" id="t-income" />
              <Label htmlFor="t-income" className="text-green-600 font-bold cursor-pointer">
                Gelir
              </Label>
            </div>
            <div className="flex items-center space-x-2 border p-2 rounded-md w-full justify-center">
              <RadioGroupItem value="EXPENSE" id="t-expense" />
              <Label htmlFor="t-expense" className="text-red-600 font-bold cursor-pointer">
                Gider
              </Label>
            </div>
          </RadioGroup>

          {/* Kategoriler (Filtrelenmiş) */}
          <div className="space-y-1">
            <Select
              onValueChange={(val) => form.setValue('categoryId', val)}
              // Tip değiştiğinde value sıfırlanıyor, UI da güncellensin diye key ekleyebiliriz
              key={selectedType}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Kategori Seçin" />
              </SelectTrigger>
              <SelectContent className="w-full">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-slate-500 text-center">
                    Bu türde kategori yok.
                  </div>
                )}
              </SelectContent>
            </Select>
            {form.formState.errors.categoryId && (
              <span className="text-xs text-red-500">
                {form.formState.errors.categoryId.message}
              </span>
            )}
          </div>

          {/* Miktar */}
          <div className="space-y-1">
            <Input
              type="number"
              placeholder="Miktar"
              step="0.01" // Kuruş girişi için
              {...form.register('amount')}
            />
            {form.formState.errors.amount && (
              <span className="text-xs text-red-500">{form.formState.errors.amount.message}</span>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Vazgeç
            </Button>
            {categories.length === 0 ? (
              <Button disabled className="opacity-45 cursor-no-drop" variant={'outline'} asChild>
                <span>En az 1 kategori eklemelisiniz</span>
              </Button>
            ) : (
              <>
                {categories.some((category) => category.type === selectedType) ? (
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                ) : (
                  <Button
                    disabled
                    className="opacity-45 cursor-no-drop"
                    variant={'outline'}
                    asChild
                  >
                    <span>{selectedType === 'EXPENSE' ? 'Gider' : 'Gelir'} kategorisi yok</span>
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewTransaction;
