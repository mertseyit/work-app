'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateClientProjectSchema, CreateClientProjectSchemaType } from '@/lib/validators';
import { tr } from 'date-fns/locale';
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
import { CalendarIcon, UserPlus, Loader2, Info, Percent, DollarSign } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { createClientProject } from '@/lib/actions/project';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { formatDate } from '@/helpers/formatDate';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CreateClientProjectSheetProps {
  clientId: string;
}

const CreateClientProjectSheet = ({ clientId }: CreateClientProjectSheetProps) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [techInput, setTechInput] = useState('');

  // Partial ödeme için state'ler
  const [partialMode, setPartialMode] = useState<'amount' | 'percent'>('amount');
  const [partialPercent, setPartialPercent] = useState<number>(0);

  const form = useForm<CreateClientProjectSchemaType>({
    resolver: zodResolver(CreateClientProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      startDate: new Date(),
      endDate: undefined,
      price: 0,
      paidAmount: 0,
      techStack: [],
      paymentStatus: 'UNPAID',
      status: 'IN_PROGRESS',
      category: '',
      clientId: clientId,
    },
  });

  const watchStartDate = form.watch('startDate');
  const watchEndDate = form.watch('endDate');
  const watchPrice = form.watch('price');
  const watchPaidAmount = form.watch('paidAmount');

  // Fiyat değiştiğinde yüzdeliği güncelle (amount modundayken)
  useEffect(() => {
    if (partialMode === 'amount' && watchPrice > 0) {
      const percent = (watchPaidAmount / watchPrice) * 100;
      setPartialPercent(Math.round(percent * 100) / 100); // 2 decimal
    }
  }, [watchPaidAmount, watchPrice, partialMode]);

  // Yüzdelik değiştiğinde miktarı güncelle
  const handlePercentChange = (percent: number) => {
    setPartialPercent(percent);
    if (watchPrice > 0) {
      const amount = (watchPrice * percent) / 100;
      form.setValue('paidAmount', Math.round(amount * 100) / 100);
    }
  };

  // Miktar değiştiğinde yüzdeliği güncelle
  const handleAmountChange = (amount: number) => {
    form.setValue('paidAmount', amount);
    if (watchPrice > 0) {
      const percent = (amount / watchPrice) * 100;
      setPartialPercent(Math.round(percent * 100) / 100);
    }
  };

  const onSubmit = (data: CreateClientProjectSchemaType) => {
    // paidAmount > 0 ise paymentStatus'u PARTIAL yap
    if (data.paidAmount > 0 && data.paidAmount < data.price) {
      data.paymentStatus = 'PARTIAL';
    } else if (data.paidAmount >= data.price) {
      data.paymentStatus = 'PAID';
    }

    startTransition(async () => {
      const response = await createClientProject(data);
      if (response.error) {
        toast.error(response.error, { position: 'top-center' });
      } else {
        toast.success('Proje oluşturuldu', { position: 'top-center' });
        form.reset();
        setPartialPercent(0);
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white" size={'sm'}>
          <UserPlus className="mr-2 h-4 w-4" /> Yeni Proje Oluştur
        </Button>
      </DialogTrigger>

      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-150 overflow-y-auto max-h-[90vh]"
      >
        <DialogHeader>
          <DialogTitle>Yeni Proje Oluştur</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* --- 1. ZORUNLU / ÖNEMLİ BİLGİLER --- */}
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="name">
                Proje Adı <span className="text-red-500">*</span>
              </Label>
              <Input id="name" placeholder="Örn: E-Ticaret Sitesi" {...form.register('name')} />
              {form.formState.errors.name && (
                <span className="text-xs text-red-500">{form.formState.errors.name.message}</span>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="description">Proje Açıklaması</Label>
              <Textarea
                id="description"
                placeholder="Proje detayları..."
                className="resize-none h-20"
                {...form.register('description')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Başlangıç Tarihi */}
            <div className="space-y-1 flex flex-col">
              <Label>Başlangıç Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full pl-3 text-left font-normal',
                      !watchStartDate && 'text-muted-foreground',
                    )}
                  >
                    {watchStartDate ? formatDate(watchStartDate, 'hours') : <span>Tarih Seç</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={tr}
                    selected={watchStartDate}
                    onSelect={(date) => date && form.setValue('startDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.startDate && (
                <span className="text-xs text-red-500">
                  {form.formState.errors.startDate.message}
                </span>
              )}
            </div>

            {/* Bitiş Tarihi */}
            <div className="space-y-1 flex flex-col">
              <Label>Teslim Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full pl-3 text-left font-normal',
                      !watchEndDate && 'text-muted-foreground',
                    )}
                  >
                    {watchEndDate ? formatDate(watchEndDate, 'hours') : <span>Tarih Seç</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={tr}
                    selected={watchEndDate}
                    onSelect={(date) => date && form.setValue('endDate', date)}
                    disabled={(date) => date < (watchStartDate || new Date())}
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.endDate && (
                <span className="text-xs text-red-500">
                  {form.formState.errors.endDate.message}
                </span>
              )}
            </div>
          </div>

          {/* Fiyat ve Kısmi Ödeme */}
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="price">Toplam Fiyat (₺)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...form.register('price', { valueAsNumber: true })}
              />
              {form.formState.errors.price && (
                <span className="text-xs text-red-500">{form.formState.errors.price.message}</span>
              )}
            </div>

            {/* Kısmi Ödeme Alanı */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Label>Alınan Ödeme (Opsiyonel)</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-[200px]">
                        Bu proje için şu ana kadar alınan toplam ödeme tutarını gösterir. Eğer hiç
                        ödeme almadıysanız bu alanı gerektiği takdirde daha sonra da
                        güncelleyebilirsiniz.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <ToggleGroup
                  type="single"
                  value={partialMode}
                  onValueChange={(value: string) =>
                    value && setPartialMode(value as 'amount' | 'percent')
                  }
                  size="sm"
                >
                  <ToggleGroupItem value="amount" aria-label="Tutar">
                    <DollarSign className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">₺</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="percent" aria-label="Yüzde">
                    <Percent className="h-3.5 w-3.5" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Tutar Input */}
                <div className="space-y-1">
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max={watchPrice || undefined}
                      placeholder="0.00"
                      value={watchPaidAmount || ''}
                      onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                      disabled={partialMode === 'percent'}
                      className={cn('pr-8', partialMode === 'percent' && 'bg-muted')}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      ₺
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Alınan tutar</p>
                </div>

                {/* Yüzde Input */}
                <div className="space-y-1">
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={partialPercent || ''}
                      onChange={(e) => handlePercentChange(parseFloat(e.target.value) || 0)}
                      disabled={partialMode === 'amount'}
                      className={cn('pr-8', partialMode === 'amount' && 'bg-muted')}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      %
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Ödeme yüzdesi</p>
                </div>
              </div>

              {/* Kalan miktar bilgisi */}
              {watchPaidAmount > 0 && watchPrice > 0 && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-amber-50 dark:bg-amber-950/30 text-xs">
                  <Info className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="text-amber-700 dark:text-amber-300">
                    Kalan: <strong>{(watchPrice - watchPaidAmount).toFixed(2)} ₺</strong> (
                    {(100 - partialPercent).toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* --- AYIRICI --- */}
          <div className="py-2">
            <Separator />
            <div className="mt-2 flex items-start gap-2 rounded-md bg-blue-50 p-2 text-xs text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                Aşağıdaki alanlar isteğe bağlıdır. Doldurmazsanız varsayılan değerler atanır, daha
                sonra proje detayından düzenleyebilirsiniz.
              </p>
            </div>
          </div>

          {/* --- OPSİYONEL ALANLAR --- */}

          {/* Kategori */}
          <div className="space-y-1">
            <Label htmlFor="category">Kategori</Label>
            <Input
              id="category"
              maxLength={100}
              placeholder="Örn: Web, Mobil, UI/UX"
              {...form.register('category')}
            />
            {form.formState.errors.category && (
              <span className="text-xs text-red-500">{form.formState.errors.category.message}</span>
            )}
          </div>

          {/* Teknoloji Yığını */}
          <div className="space-y-1">
            <Label htmlFor="techStack">Kullanılan Teknolojiler</Label>
            <Input
              id="techStack"
              maxLength={100}
              placeholder="Teknoloji yazıp Enter'a basın"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = techInput.trim();
                  if (value && !form.getValues('techStack')?.includes(value)) {
                    const current = form.getValues('techStack') || [];
                    form.setValue('techStack', [...current, value]);
                    setTechInput('');
                  }
                }
              }}
            />
            <p className="text-[10px] text-muted-foreground">
              Teknoloji yazıp Enter tuşuna basarak ekleyin.
            </p>
            {/* Badge Alanı */}
            {Array(form.watch('techStack') || [])?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 border border-dashed rounded-md mt-1 ">
                {form.watch('techStack')?.map((tech, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[11px] dark:bg-purple-950 dark:text-purple-300"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => {
                        const current = form.getValues('techStack') || [];
                        form.setValue(
                          'techStack',
                          current.filter((_, i) => i !== index),
                        );
                      }}
                      className="hover:text-red-500 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {form.formState.errors.techStack && (
              <span className="text-xs text-red-500">
                {form.formState.errors.techStack.message}
              </span>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Vazgeç
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Kaydediliyor
                </>
              ) : (
                'Kaydet'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClientProjectSheet;
