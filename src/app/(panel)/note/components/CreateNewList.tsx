'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { createNoteList } from '@/lib/actions/noteList';
import { CreateListSchema, CreateListSchemaType } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { Palette, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const noteColors = [
  { id: 'blue', hex: '#3B82F6', class: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  { id: 'deep-blue', hex: '#2563EB', class: 'bg-blue-600/15 text-blue-500 border-blue-600/30' },
  { id: 'sky', hex: '#0EA5E9', class: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  { id: 'cyan', hex: '#22D3EE', class: 'bg-cyan-400/15 text-cyan-300 border-cyan-400/30' },
  { id: 'teal', hex: '#06B6D4', class: 'bg-teal-400/15 text-teal-300 border-teal-400/30' },

  { id: 'green', hex: '#22C55E', class: 'bg-green-500/15 text-green-400 border-green-500/30' },
  { id: 'dark-green', hex: '#16A34A', class: 'bg-green-600/15 text-green-500 border-green-600/30' },
  { id: 'soft-green', hex: '#4ADE80', class: 'bg-green-400/15 text-green-300 border-green-400/30' },
  { id: 'lime', hex: '#84CC16', class: 'bg-lime-400/15 text-lime-300 border-lime-400/30' },
  {
    id: 'emerald',
    hex: '#10B981',
    class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },

  { id: 'yellow', hex: '#FACC15', class: 'bg-yellow-400/15 text-yellow-300 border-yellow-400/30' },
  { id: 'gold', hex: '#EAB308', class: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  { id: 'orange', hex: '#FB923C', class: 'bg-orange-400/15 text-orange-300 border-orange-400/30' },
  {
    id: 'deep-orange',
    hex: '#F97316',
    class: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  },
  {
    id: 'soft-orange',
    hex: '#FDBA74',
    class: 'bg-orange-300/15 text-orange-200 border-orange-300/30',
  },

  { id: 'red', hex: '#EF4444', class: 'bg-red-500/15 text-red-400 border-red-500/30' },
  { id: 'dark-red', hex: '#DC2626', class: 'bg-red-600/15 text-red-500 border-red-600/30' },
  { id: 'purple', hex: '#A855F7', class: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  { id: 'indigo', hex: '#8B5CF6', class: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
  { id: 'pink', hex: '#EC4899', class: 'bg-pink-500/15 text-pink-400 border-pink-500/30' },
];

const CreateNewList = () => {
  const form = useForm<CreateListSchemaType>({
    resolver: zodResolver(CreateListSchema),
    defaultValues: {
      title: '',
      description: 'Açıklama Girilmedi',
      color: '#2563eb',
    },
  });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const onSubmit = (data: CreateListSchemaType) => {
    startTransition(async () => {
      const response = await createNoteList(data);
      if (response.error) {
        toast.error(response.error, {
          position: 'top-center',
        });
      } else {
        toast.success('Liste oluşturuldu', {
          position: 'top-center',
        });
        router.refresh();
        form.reset();
      }
    });
  };
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-start gap-2">
        <Input {...form.register('title')} placeholder="Liste adı girin" />
        <Select
          value={form.watch('color')}
          onValueChange={(val: string | undefined) => form.setValue('color', val)}
        >
          <SelectTrigger>
            <SelectValue className="text-[9px]!" placeholder={<Palette />} />
          </SelectTrigger>
          <SelectContent>
            {noteColors.map((item) => (
              <SelectItem key={item.id} value={item.hex}>
                <span className={`w-4 h-4 rounded-xs`} style={{ backgroundColor: item.hex }} />
                {item.hex}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {form.formState.errors.title && (
        <span className="text-xs text-red-500">{form.formState.errors.title.message}</span>
      )}
      <Button disabled={isPending} className="w-full">
        {isPending ? <Spinner /> : <Plus />} Yeni Liste Oluştur
      </Button>
    </form>
  );
};

export default CreateNewList;
