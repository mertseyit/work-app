'use client';

import { useState, useTransition, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateNoteSchema, CreateNoteSchemaType } from '@/lib/validators';
import { createNote } from '@/lib/actions/note';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Bell,
  CalendarDays,
  Repeat,
  Star,
  Check,
  Circle,
  Plus,
  X,
  FolderKanban,
  ListTodo,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import {
  format,
  addDays,
  addWeeks,
  setHours,
  setMinutes,
  startOfTomorrow,
  nextMonday,
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// ============================================
// TYPES & CONSTANTS
// ============================================

interface CreateNewNoteInputProps {
  projectList: { id: string; name: string }[];
  noteList: { id: string; title: string }[];
  selectDefaultProject?: boolean;
}

type ReminderPreset = 'TODAY' | 'TOMORROW' | 'NEXT_WEEK' | 'CUSTOM';
type DueDatePreset = 'TODAY' | 'TOMORROW' | 'NEXT_WEEK' | 'CUSTOM';
type RecurrenceOption = 'DAILY' | 'WEEKDAYS' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM' | null;

const REMINDER_PRESETS: { value: ReminderPreset; label: string }[] = [
  { value: 'TODAY', label: 'Bugün' },
  { value: 'TOMORROW', label: 'Yarın' },
  { value: 'NEXT_WEEK', label: 'Gelecek Hafta' },
  { value: 'CUSTOM', label: 'Tarih Seç...' },
];

const DUE_DATE_PRESETS: { value: DueDatePreset; label: string }[] = [
  { value: 'TODAY', label: 'Bugün' },
  { value: 'TOMORROW', label: 'Yarın' },
  { value: 'NEXT_WEEK', label: 'Gelecek Hafta' },
  { value: 'CUSTOM', label: 'Tarih Seç...' },
];

const RECURRENCE_OPTIONS: { value: RecurrenceOption; label: string }[] = [
  { value: 'DAILY', label: 'Her Gün' },
  { value: 'WEEKDAYS', label: 'Hafta İçi' },
  { value: 'WEEKLY', label: 'Her Hafta' },
  { value: 'MONTHLY', label: 'Her Ay' },
  { value: 'YEARLY', label: 'Her Yıl' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function getDateFromPreset(preset: ReminderPreset | DueDatePreset, customDate?: Date): Date {
  const now = new Date();
  const today9am = setMinutes(setHours(now, 9), 0);

  switch (preset) {
    case 'TODAY':
      return now.getHours() >= 9 ? setMinutes(setHours(now, now.getHours() + 1), 0) : today9am;
    case 'TOMORROW':
      return setMinutes(setHours(startOfTomorrow(), 9), 0);
    case 'NEXT_WEEK':
      return setMinutes(setHours(nextMonday(now), 9), 0);
    case 'CUSTOM':
      return customDate || now;
    default:
      return now;
  }
}

function formatDisplayDate(date: Date | null | undefined): string {
  if (!date) return '';
  return format(date, 'd MMM, EEEE', { locale: tr });
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  activeColor?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const ActionButton = ({
  icon,
  label,
  isActive,
  activeColor = 'text-blue-500',
  onClick,
  children,
}: ActionButtonProps) => {
  const button = (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        'h-8 px-2 gap-1.5 text-muted-foreground hover:text-foreground transition-colors',
        isActive && activeColor,
      )}
    >
      {icon}
      {children}
    </Button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};

interface ClearableSelectProps {
  value: string | null | undefined;
  onValueChange: (value: string | null) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
  triggerClassName?: string;
}

const ClearableSelect = ({
  value,
  onValueChange,
  placeholder,
  options,
  icon,
  triggerClassName,
}: ClearableSelectProps) => {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative inline-flex items-center">
      <Select value={value || ''} onValueChange={(val) => onValueChange(val || null)}>
        <SelectTrigger className={cn('h-8 gap-1.5', triggerClassName)}>
          {icon}
          <SelectValue placeholder={placeholder}>
            {selectedOption?.label || placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 ml-1 rounded-full hover:bg-destructive/10"
          onClick={(e) => {
            e.stopPropagation();
            onValueChange(null);
          }}
        >
          <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
        </Button>
      )}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const CreateNewNoteInput = ({
  projectList,
  noteList,
  selectDefaultProject = false,
}: CreateNewNoteInputProps) => {
  const [isPending, startTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  // Popover states
  const [reminderOpen, setReminderOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [recurrenceOpen, setRecurrenceOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  // Custom date picker states
  const [showReminderCalendar, setShowReminderCalendar] = useState(false);
  const [showDueDateCalendar, setShowDueDateCalendar] = useState(false);

  const form = useForm<CreateNoteSchemaType>({
    resolver: zodResolver(CreateNoteSchema),
    defaultValues: {
      title: '',
      isImportant: false,
      isCompleted: false,
      remindAt: null,
      dueDate: null,
      recurrenceType: null,
      recurrenceInterval: null,
      listId: null,
      projectId: selectDefaultProject ? projectList[0].id : null,
    },
  });

  const title = form.watch('title');
  const isCompleted = form.watch('isCompleted');
  const isImportant = form.watch('isImportant');
  const remindAt = form.watch('remindAt');
  const dueDate = form.watch('dueDate');
  const recurrenceType = form.watch('recurrenceType');
  const projectId = form.watch('projectId');
  const listId = form.watch('listId');

  // ============================================
  // HANDLERS
  // ============================================

  const handleReminderSelect = useCallback(
    (preset: ReminderPreset, customDate?: Date) => {
      if (preset === 'CUSTOM' && !customDate) {
        setShowReminderCalendar(true);
        return;
      }
      const date = getDateFromPreset(preset, customDate);
      form.setValue('remindAt', date);
      setShowReminderCalendar(false);
      setReminderOpen(false);
    },
    [form],
  );

  const handleDueDateSelect = useCallback(
    (preset: DueDatePreset, customDate?: Date) => {
      if (preset === 'CUSTOM' && !customDate) {
        setShowDueDateCalendar(true);
        return;
      }
      const date = getDateFromPreset(preset, customDate);
      form.setValue('dueDate', date);
      setShowDueDateCalendar(false);
      setDueDateOpen(false);
    },
    [form],
  );

  const handleRecurrenceSelect = useCallback(
    (value: RecurrenceOption) => {
      form.setValue('recurrenceType', value);
      if (value && value !== 'CUSTOM') {
        form.setValue('recurrenceInterval', 1);
      } else if (!value) {
        form.setValue('recurrenceInterval', null);
      }
      setRecurrenceOpen(false);
    },
    [form],
  );

  const clearReminder = useCallback(() => {
    form.setValue('remindAt', null);
  }, [form]);

  const clearDueDate = useCallback(() => {
    form.setValue('dueDate', null);
  }, [form]);

  const clearRecurrence = useCallback(() => {
    form.setValue('recurrenceType', null);
    form.setValue('recurrenceInterval', null);
  }, [form]);

  const resetForm = useCallback(() => {
    form.reset();
    setIsExpanded(false);
    setShowReminderCalendar(false);
    setShowDueDateCalendar(false);
  }, [form]);

  const onSubmit = (data: CreateNoteSchemaType) => {
    startTransition(async () => {
      const response = await createNote(data);
      if (response.error) {
        toast.error(response.error, { position: 'top-center' });
      } else {
        toast.success('Not başarıyla eklendi', { position: 'top-center' });
        resetForm();
        router.refresh();
      }
    });
  };

  // ============================================
  // RENDER
  // ============================================

  const selectedProject = projectList.find((p) => p.id === projectId);
  const selectedList = noteList.find((l) => l.id === listId);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
      <div
        className={cn(
          'border rounded-lg bg-card transition-all duration-200',
          isExpanded ? 'shadow-md ring-1 ring-ring/10' : 'hover:shadow-sm',
        )}
      >
        {/* Ana Input Alanı */}
        <div className="flex items-center gap-2 p-3">
          {/* Tamamlandı Toggle */}
          {title && (
            <Toggle
              pressed={isCompleted}
              onPressedChange={(pressed) => form.setValue('isCompleted', pressed)}
              size="sm"
              className={cn(
                'h-8 w-8 p-0 rounded-full border transition-all',
                isCompleted
                  ? 'bg-blue-500/20 border-blue-500 text-blue-500'
                  : 'bg-transparent border-muted-foreground/30',
              )}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
            </Toggle>
          )}

          {/* Input */}
          <div className="flex-1 relative">
            <Input
              {...form.register('title')}
              placeholder="Yeni not ekle..."
              disabled={isPending}
              onFocus={() => setIsExpanded(true)}
              className={cn(
                'border-0 shadow-none focus-visible:ring-0 px-0 h-10 text-base',
                isCompleted && 'line-through text-muted-foreground',
              )}
            />
          </div>

          {/* Önemli Toggle */}
          {title && (
            <Toggle
              pressed={isImportant}
              onPressedChange={(pressed) => form.setValue('isImportant', pressed)}
              size="sm"
              className="h-8 w-8 p-0 bg-transparent hover:bg-transparent"
            >
              <Star
                className={cn(
                  'h-5 w-5 transition-all',
                  isImportant
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground hover:text-yellow-400',
                )}
              />
            </Toggle>
          )}

          {/* Submit Button veya Spinner */}
          {title && (
            <>
              {isPending ? (
                <Spinner className="h-5 w-5" />
              ) : (
                <Button type="submit" size="sm" className="h-8 px-3">
                  <Plus className="h-4 w-4 mr-1" />
                  Ekle
                </Button>
              )}
            </>
          )}
        </div>

        {/* Genişletilmiş Seçenekler */}
        {isExpanded && title && (
          <div className="border-t px-3 py-2">
            <div className="flex flex-wrap items-center gap-1">
              {/* Hatırlatıcı */}
              <Popover open={reminderOpen} onOpenChange={setReminderOpen}>
                <PopoverTrigger asChild>
                  <div>
                    <ActionButton
                      icon={<Bell className="h-4 w-4" />}
                      label="Hatırlatıcı Ekle"
                      isActive={!!remindAt}
                      activeColor="text-purple-500"
                    >
                      {remindAt && <span className="text-xs">{formatDisplayDate(remindAt)}</span>}
                    </ActionButton>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  {!showReminderCalendar ? (
                    <div className="p-2 space-y-1">
                      <p className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                        Bana Hatırlat
                      </p>
                      {REMINDER_PRESETS.map((preset) => (
                        <Button
                          key={preset.value}
                          type="button"
                          variant="ghost"
                          className="w-full justify-start h-9"
                          onClick={() => handleReminderSelect(preset.value)}
                        >
                          {preset.label}
                        </Button>
                      ))}
                      {remindAt && (
                        <>
                          <div className="border-t my-2" />
                          <Button
                            type="button"
                            variant="ghost"
                            className="w-full justify-start h-9 text-destructive hover:text-destructive"
                            onClick={() => {
                              clearReminder();
                              setReminderOpen(false);
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Hatırlatıcıyı Kaldır
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="p-2">
                      <Calendar
                        mode="single"
                        selected={remindAt || undefined}
                        onSelect={(date) => {
                          if (date) handleReminderSelect('CUSTOM', date);
                        }}
                        locale={tr}
                        disabled={(date) => date < new Date()}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => setShowReminderCalendar(false)}
                      >
                        Geri
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              {/* Son Tarih (Due Date) */}
              <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                <PopoverTrigger asChild>
                  <div>
                    <ActionButton
                      icon={<CalendarDays className="h-4 w-4" />}
                      label="Son Tarih Ekle"
                      isActive={!!dueDate}
                      activeColor="text-red-500"
                    >
                      {dueDate && <span className="text-xs">{formatDisplayDate(dueDate)}</span>}
                    </ActionButton>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  {!showDueDateCalendar ? (
                    <div className="p-2 space-y-1">
                      <p className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                        Son Tarih
                      </p>
                      {DUE_DATE_PRESETS.map((preset) => (
                        <Button
                          key={preset.value}
                          type="button"
                          variant="ghost"
                          className="w-full justify-start h-9"
                          onClick={() => handleDueDateSelect(preset.value)}
                        >
                          {preset.label}
                        </Button>
                      ))}
                      {dueDate && (
                        <>
                          <div className="border-t my-2" />
                          <Button
                            type="button"
                            variant="ghost"
                            className="w-full justify-start h-9 text-destructive hover:text-destructive"
                            onClick={() => {
                              clearDueDate();
                              setDueDateOpen(false);
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Son Tarihi Kaldır
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="p-2">
                      <Calendar
                        mode="single"
                        selected={dueDate || undefined}
                        onSelect={(date) => {
                          if (date) handleDueDateSelect('CUSTOM', date);
                        }}
                        locale={tr}
                        disabled={(date) => date < new Date()}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => setShowDueDateCalendar(false)}
                      >
                        Geri
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              {/* Tekrarlama */}
              <Popover open={recurrenceOpen} onOpenChange={setRecurrenceOpen}>
                <PopoverTrigger asChild>
                  <div>
                    <ActionButton
                      icon={<Repeat className="h-4 w-4" />}
                      label="Tekrarlama Ekle"
                      isActive={!!recurrenceType}
                      activeColor="text-green-500"
                    >
                      {recurrenceType && (
                        <span className="text-xs">
                          {RECURRENCE_OPTIONS.find((r) => r.value === recurrenceType)?.label}
                        </span>
                      )}
                    </ActionButton>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-2 space-y-1">
                    <p className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                      Tekrarla
                    </p>
                    {RECURRENCE_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant="ghost"
                        className={cn(
                          'w-full justify-start h-9',
                          recurrenceType === option.value && 'bg-accent',
                        )}
                        onClick={() => handleRecurrenceSelect(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                    {recurrenceType && (
                      <>
                        <div className="border-t my-2" />
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full justify-start h-9 text-destructive hover:text-destructive"
                          onClick={() => {
                            clearRecurrence();
                            setRecurrenceOpen(false);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Tekrarlamayı Kaldır
                        </Button>
                      </>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <div className="h-4 w-px bg-border mx-1" />

              {/* Proje Seçimi */}
              <Popover open={projectOpen} onOpenChange={setProjectOpen}>
                <PopoverTrigger asChild>
                  <div>
                    <ActionButton
                      icon={<FolderKanban className="h-4 w-4" />}
                      label="Projeye Ata"
                      isActive={!!projectId}
                      activeColor="text-orange-500"
                    >
                      {selectedProject && (
                        <span className="text-xs max-w-24 truncate">{selectedProject.name}</span>
                      )}
                    </ActionButton>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0" align="start">
                  <div className="p-2 space-y-1">
                    <p className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                      Projeye Ata
                    </p>
                    {projectList.length === 0 ? (
                      <p className="px-2 py-3 text-sm text-muted-foreground text-center">
                        Henüz proje yok
                      </p>
                    ) : (
                      projectList.map((project) => (
                        <Button
                          key={project.id}
                          type="button"
                          variant="ghost"
                          className={cn(
                            'w-full justify-start h-9 truncate',
                            projectId === project.id && 'bg-accent',
                          )}
                          onClick={() => {
                            form.setValue('projectId', project.id);
                            setProjectOpen(false);
                          }}
                        >
                          {project.name}
                        </Button>
                      ))
                    )}
                    {projectId && (
                      <>
                        <div className="border-t my-2" />
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full justify-start h-9 text-destructive hover:text-destructive"
                          onClick={() => {
                            form.setValue('projectId', null);
                            setProjectOpen(false);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Projeden Çıkar
                        </Button>
                      </>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Liste Seçimi */}
              <Popover open={listOpen} onOpenChange={setListOpen}>
                <PopoverTrigger asChild>
                  <div>
                    <ActionButton
                      icon={<ListTodo className="h-4 w-4" />}
                      label="Listeye Ekle"
                      isActive={!!listId}
                      activeColor="text-cyan-500"
                    >
                      {selectedList && (
                        <span className="text-xs max-w-24 truncate">{selectedList.title}</span>
                      )}
                    </ActionButton>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0" align="start">
                  <div className="p-2 space-y-1">
                    <p className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                      Listeye Ekle
                    </p>
                    {noteList.length === 0 ? (
                      <p className="px-2 py-3 text-sm text-muted-foreground text-center">
                        Henüz liste yok
                      </p>
                    ) : (
                      noteList.map((list) => (
                        <Button
                          key={list.id}
                          type="button"
                          variant="ghost"
                          className={cn(
                            'w-full justify-start h-9 truncate',
                            listId === list.id && 'bg-accent',
                          )}
                          onClick={() => {
                            form.setValue('listId', list.id);
                            setListOpen(false);
                          }}
                        >
                          {list.title}
                        </Button>
                      ))
                    )}
                    {listId && (
                      <>
                        <div className="border-t my-2" />
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full justify-start h-9 text-destructive hover:text-destructive"
                          onClick={() => {
                            form.setValue('listId', null);
                            setListOpen(false);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Listeden Çıkar
                        </Button>
                      </>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Seçili Değerlerin Özeti (Chip'ler) */}
            {(remindAt || dueDate || recurrenceType || projectId || listId) && (
              <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t">
                {remindAt && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs">
                    <Bell className="h-3 w-3" />
                    {formatDisplayDate(remindAt)}
                    <button
                      type="button"
                      onClick={clearReminder}
                      className="ml-1 hover:text-purple-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {dueDate && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-600 text-xs">
                    <CalendarDays className="h-3 w-3" />
                    {formatDisplayDate(dueDate)}
                    <button
                      type="button"
                      onClick={clearDueDate}
                      className="ml-1 hover:text-red-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {recurrenceType && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-xs">
                    <Repeat className="h-3 w-3" />
                    {RECURRENCE_OPTIONS.find((r) => r.value === recurrenceType)?.label}
                    <button
                      type="button"
                      onClick={clearRecurrence}
                      className="ml-1 hover:text-green-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {selectedProject && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 text-orange-600 text-xs">
                    <FolderKanban className="h-3 w-3" />
                    <span className="max-w-20 truncate">{selectedProject.name}</span>
                    <button
                      type="button"
                      onClick={() => form.setValue('projectId', null)}
                      className="ml-1 hover:text-orange-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {selectedList && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-600 text-xs">
                    <ListTodo className="h-3 w-3" />
                    <span className="max-w-20 truncate">{selectedList.title}</span>
                    <button
                      type="button"
                      onClick={() => form.setValue('listId', null)}
                      className="ml-1 hover:text-cyan-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Hata Mesajı */}
        {form.formState.errors.title && (
          <div className="px-3 pb-2">
            <span className="text-xs text-destructive">{form.formState.errors.title.message}</span>
          </div>
        )}
      </div>

      {/* Dışarı tıklama ile kapat */}
      {isExpanded && !title && (
        <div className="fixed inset-0 z-[-1]" onClick={() => setIsExpanded(false)} />
      )}
    </form>
  );
};

export default CreateNewNoteInput;
