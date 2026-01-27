'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Check,
  Circle,
  Paperclip,
  Star,
  Bell,
  CalendarDays,
  Repeat,
  Trash2,
  X,
  FolderKanban,
  ListTodo,
  Pencil,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format, setHours, setMinutes, startOfTomorrow, nextMonday } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

import NoteItem from './NoteItem';
import CreateNewList from './CreateNewList';
import CreateNewNoteInput from './CreateNewNoteInput';
import { updateNote, deleteNote } from '@/lib/actions/note';
import { updateNoteList, deleteNoteList } from '@/lib/actions/noteList';

interface NotesTabMenuProps {
  noteList: NoteList[];
  notes: Note[];
  projectlist: { id: string; name: string }[];
}

type DatePreset = 'TODAY' | 'TOMORROW' | 'NEXT_WEEK' | 'CUSTOM';

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'TODAY', label: 'Bugün' },
  { value: 'TOMORROW', label: 'Yarın' },
  { value: 'NEXT_WEEK', label: 'Gelecek Hafta' },
  { value: 'CUSTOM', label: 'Tarih Seç...' },
];

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: 'DAILY', label: 'Her Gün' },
  { value: 'WEEKDAYS', label: 'Hafta İçi' },
  { value: 'WEEKLY', label: 'Her Hafta' },
  { value: 'MONTHLY', label: 'Her Ay' },
  { value: 'YEARLY', label: 'Her Yıl' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function getDateFromPreset(preset: DatePreset, customDate?: Date): Date {
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

function formatFullDate(date: Date | null | undefined): string {
  if (!date) return '';
  return format(new Date(date), 'd MMMM yyyy, EEEE', { locale: tr });
}

function isOverdue(date: Date | null | undefined): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

// ============================================
// NOTE LIST ITEM COMPONENT
// ============================================

interface NoteListItemProps {
  list: NoteList;
  isActive: boolean;
  onSelect: () => void;
}

const NoteListItem = ({ list, isActive, onSelect }: NoteListItemProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(list.title);

  // Sync title when list prop changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(list.title);
  }, [list.title]);

  const handleSaveTitle = async () => {
    if (title.trim() && title !== list.title) {
      startTransition(async () => {
        const response = await updateNoteList(list.id, { title: title.trim() });
        if (!response.success) {
          toast.error('Liste adı güncellenemedi', { position: 'top-center' });
          setTitle(list.title); // Revert on error
        } else {
          router.refresh();
        }
      });
    }
    setIsEditing(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      const response = await deleteNoteList(list.id);
      if (!response.success) {
        toast.error('Liste silinemedi', { position: 'top-center' });
      } else {
        toast.success('Liste silindi', { position: 'top-center' });
        router.refresh();
      }
    });
  };

  return (
    <div
      className={cn(
        'group w-full flex items-center justify-between rounded-md border mt-2 transition-all',
        'hover:opacity-100',
        isPending && 'opacity-50 pointer-events-none',
      )}
      style={{
        borderColor: isActive ? list.color + '80' : list.color + '40',
        backgroundColor: isActive ? list.color + '30' : list.color + '10',
        opacity: isActive ? 1 : 0.6,
      }}
    >
      {isEditing ? (
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSaveTitle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveTitle();
            if (e.key === 'Escape') {
              setTitle(list.title);
              setIsEditing(false);
            }
          }}
          autoFocus
          className="flex-1 h-9 text-sm border-0 bg-transparent focus-visible:ring-0"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <Button
          variant="ghost"
          className="flex-1 justify-start gap-2 h-9 px-3 hover:bg-transparent"
          onClick={onSelect}
        >
          <Paperclip className="h-4 w-4 shrink-0" />
          <span className="truncate">{list.title}</span>
        </Button>
      )}

      <div className="flex items-center gap-1 pr-2">
        <span className="text-xs border bg-accent px-2 py-0.5 rounded">
          {list?._count?.notes ?? 0}
        </span>

        {/* Edit Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          <Pencil className="h-3 w-3 text-muted-foreground" />
        </Button>

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleDelete}
        >
          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>
    </div>
  );
};

// ============================================
// NOTE DETAIL PANEL COMPONENT
// ============================================

interface NoteDetailPanelProps {
  note: Note;
  noteList: NoteList[];
  projectList: { id: string; name: string }[];
  selectedColor: string;
  onClose: () => void;
}

const NoteDetailPanel = ({
  note,
  noteList,
  projectList,
  selectedColor,
  onClose,
}: NoteDetailPanelProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local state
  const [isCompleted, setIsCompleted] = useState(note.isCompleted);
  const [isImportant, setIsImportant] = useState(note.isImportant);
  const [title, setTitle] = useState(note.title);
  const [remindAt, setRemindAt] = useState<Date | null>(
    note.remindAt ? new Date(note.remindAt) : null,
  );
  const [dueDate, setDueDate] = useState<Date | null>(note.dueDate ? new Date(note.dueDate) : null);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType | null>(note.recurrenceType);
  const [projectId, setProjectId] = useState<string | null>(note.projectId);
  const [listId, setListId] = useState<string | null>(note.listId);

  // Sync local state when note prop changes (from server or other components)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsCompleted(note.isCompleted);
    setIsImportant(note.isImportant);
    setTitle(note.title);
    setRemindAt(note.remindAt ? new Date(note.remindAt) : null);
    setDueDate(note.dueDate ? new Date(note.dueDate) : null);
    setRecurrenceType(note.recurrenceType);
    setProjectId(note.projectId);
    setListId(note.listId);
  }, [note]);

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [showReminderCalendar, setShowReminderCalendar] = useState(false);
  const [showDueDateCalendar, setShowDueDateCalendar] = useState(false);

  // Derived values
  const selectedProject = projectList.find((p) => p.id === projectId);
  const selectedList = noteList.find((l) => l.id === listId);
  const isDueDateOverdue = dueDate && isOverdue(dueDate) && !isCompleted;

  // ============================================
  // HANDLERS
  // ============================================

  const handleUpdate = useCallback(
    async (updates: Partial<Note>) => {
      startTransition(async () => {
        const response = await updateNote(note.id, {
          title: updates.title ?? title,
          isCompleted: updates.isCompleted ?? isCompleted,
          isImportant: updates.isImportant ?? isImportant,
          remindAt: updates.remindAt !== undefined ? updates.remindAt : remindAt,
          dueDate: updates.dueDate !== undefined ? updates.dueDate : dueDate,
          recurrenceType:
            updates.recurrenceType !== undefined ? updates.recurrenceType : recurrenceType,
          recurrenceInterval: updates.recurrenceType ? 1 : null,
          projectId: updates.projectId !== undefined ? updates.projectId : projectId,
          listId: updates.listId !== undefined ? updates.listId : listId,
        });

        if (!response.success) {
          toast.error('Güncelleme başarısız', { position: 'top-center' });
        } else {
          router.refresh();
        }
      });
    },
    [
      note.id,
      title,
      isCompleted,
      isImportant,
      remindAt,
      dueDate,
      recurrenceType,
      projectId,
      listId,
      router,
    ],
  );

  const handleDelete = useCallback(async () => {
    startTransition(async () => {
      const response = await deleteNote(note.id);
      if (!response.success) {
        toast.error('Silme başarısız', { position: 'top-center' });
      } else {
        toast.success('Not silindi', { position: 'top-center' });
        onClose();
        router.refresh();
      }
    });
  }, [note.id, router, onClose]);

  const handleToggleComplete = useCallback(
    async (value: boolean) => {
      setIsCompleted(value);
      await handleUpdate({ isCompleted: value });
    },
    [handleUpdate],
  );

  const handleToggleImportant = useCallback(
    async (value: boolean) => {
      setIsImportant(value);
      await handleUpdate({ isImportant: value });
    },
    [handleUpdate],
  );

  const handleTitleSave = useCallback(async () => {
    if (title.trim() && title !== note.title) {
      await handleUpdate({ title: title.trim() });
    }
    setIsEditing(false);
  }, [title, note.title, handleUpdate]);

  const handleDateSelect = useCallback(
    async (type: 'remindAt' | 'dueDate', preset: DatePreset, customDate?: Date) => {
      if (preset === 'CUSTOM' && !customDate) {
        if (type === 'remindAt') setShowReminderCalendar(true);
        else setShowDueDateCalendar(true);
        return;
      }

      const date = getDateFromPreset(preset, customDate);

      if (type === 'remindAt') {
        setRemindAt(date);
        setShowReminderCalendar(false);
        await handleUpdate({ remindAt: date });
      } else {
        setDueDate(date);
        setShowDueDateCalendar(false);
        await handleUpdate({ dueDate: date });
      }
    },
    [handleUpdate],
  );

  const handleClearDate = useCallback(
    async (type: 'remindAt' | 'dueDate') => {
      if (type === 'remindAt') {
        setRemindAt(null);
        await handleUpdate({ remindAt: null });
      } else {
        setDueDate(null);
        await handleUpdate({ dueDate: null });
      }
    },
    [handleUpdate],
  );

  const handleRecurrenceSelect = useCallback(
    async (value: RecurrenceType | null) => {
      setRecurrenceType(value);
      await handleUpdate({ recurrenceType: value });
    },
    [handleUpdate],
  );

  const handleProjectSelect = useCallback(
    async (value: string | null) => {
      setProjectId(value);
      await handleUpdate({ projectId: value });
    },
    [handleUpdate],
  );

  const handleListSelect = useCallback(
    async (value: string | null) => {
      setListId(value);
      await handleUpdate({ listId: value });
    },
    [handleUpdate],
  );

  return (
    <div
      style={{ borderColor: selectedColor + '60' }}
      className="border p-4 rounded-lg max-w-sm w-full h-fit sticky top-0"
    >
      {/* Header */}
      <div className="flex items-start gap-3 justify-between">
        <Toggle
          pressed={isCompleted}
          onPressedChange={handleToggleComplete}
          size="sm"
          className={cn(
            'border! shrink-0 rounded-full',
            isCompleted ? 'bg-blue-600/20!' : 'bg-transparent',
          )}
        >
          {isCompleted ? <Check className="text-blue-500" /> : <Circle className="rounded-full" />}
        </Toggle>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') {
                  setTitle(note.title);
                  setIsEditing(false);
                }
              }}
              autoFocus
              className="text-lg font-semibold h-auto py-1"
            />
          ) : (
            <h3
              onClick={() => setIsEditing(true)}
              className={cn(
                'text-lg font-semibold cursor-text hover:bg-muted/50 rounded px-1 py-0.5 -ml-1 transition-colors flex items-center gap-2',
                isCompleted && 'line-through text-muted-foreground',
              )}
            >
              {title}
              <Pencil className="h-3 w-3 opacity-30" />
            </h3>
          )}
        </div>

        <Toggle
          pressed={isImportant}
          onPressedChange={handleToggleImportant}
          size="sm"
          className="bg-transparent! shrink-0"
        >
          <Star
            fill={isImportant ? '#E5BA41' : 'transparent'}
            color={isImportant ? '#E5BA41' : 'currentColor'}
            size={18}
          />
        </Toggle>

        <Button variant="ghost" size="icon-sm" onClick={onClose} className="shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Separator className="my-4" />

      {/* Options */}
      <div className="space-y-1">
        {/* Hatırlatıcı */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <Bell
                  className={cn('h-4 w-4', remindAt ? 'text-purple-500' : 'text-muted-foreground')}
                />
                <span className="text-sm">Hatırlatıcı</span>
              </div>
              <div className="flex items-center gap-1">
                {remindAt ? (
                  <>
                    <span className="text-purple-600 text-xs">{formatFullDate(remindAt)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearDate('remindAt');
                      }}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </>
                ) : (
                  <span className="text-muted-foreground text-xs">Ekle</span>
                )}
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            {!showReminderCalendar ? (
              <div className="p-2 space-y-1">
                <p className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                  Bana Hatırlat
                </p>
                {DATE_PRESETS.map((preset) => (
                  <Button
                    key={preset.value}
                    variant="ghost"
                    className="w-full justify-start h-9"
                    onClick={() => handleDateSelect('remindAt', preset.value)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="p-2">
                <Calendar
                  mode="single"
                  selected={remindAt || undefined}
                  onSelect={(date) => date && handleDateSelect('remindAt', 'CUSTOM', date)}
                  locale={tr}
                  disabled={(date) => date < new Date()}
                />
                <Button
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

        {/* Son Tarih */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <CalendarDays
                  className={cn(
                    'h-4 w-4',
                    dueDate
                      ? isDueDateOverdue
                        ? 'text-red-500'
                        : 'text-red-400'
                      : 'text-muted-foreground',
                  )}
                />
                <span className="text-sm">Son Tarih</span>
              </div>
              <div className="flex items-center gap-1">
                {dueDate ? (
                  <>
                    <span
                      className={cn('text-xs', isDueDateOverdue ? 'text-red-600' : 'text-red-500')}
                    >
                      {formatFullDate(dueDate)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearDate('dueDate');
                      }}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </>
                ) : (
                  <span className="text-muted-foreground text-xs">Ekle</span>
                )}
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            {!showDueDateCalendar ? (
              <div className="p-2 space-y-1">
                <p className="px-2 py-1.5 text-sm font-medium text-muted-foreground">Son Tarih</p>
                {DATE_PRESETS.map((preset) => (
                  <Button
                    key={preset.value}
                    variant="ghost"
                    className="w-full justify-start h-9"
                    onClick={() => handleDateSelect('dueDate', preset.value)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="p-2">
                <Calendar
                  mode="single"
                  selected={dueDate || undefined}
                  onSelect={(date) => date && handleDateSelect('dueDate', 'CUSTOM', date)}
                  locale={tr}
                />
                <Button
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
        <div className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <Repeat
              className={cn('h-4 w-4', recurrenceType ? 'text-green-500' : 'text-muted-foreground')}
            />
            <span className="text-sm">Tekrarla</span>
          </div>
          <div className="flex items-center gap-1">
            <Select
              value={recurrenceType || ''}
              onValueChange={(val) => handleRecurrenceSelect((val as RecurrenceType) || null)}
            >
              <SelectTrigger className="h-7 w-auto border-0 bg-transparent gap-1 text-xs">
                <SelectValue placeholder="Yok">
                  {recurrenceType ? (
                    <span className="text-green-600">
                      {RECURRENCE_OPTIONS.find((r) => r.value === recurrenceType)?.label}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Yok</span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {RECURRENCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {recurrenceType && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => handleRecurrenceSelect(null)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </Button>
            )}
          </div>
        </div>

        <Separator className="my-2" />

        {/* Proje */}
        <div className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <FolderKanban
              className={cn('h-4 w-4', projectId ? 'text-orange-500' : 'text-muted-foreground')}
            />
            <span className="text-sm">Proje</span>
          </div>
          <div className="flex items-center gap-1">
            <Select
              value={projectId || ''}
              onValueChange={(val) => handleProjectSelect(val || null)}
            >
              <SelectTrigger className="h-7 w-auto max-w-32 border-0 bg-transparent gap-1 text-xs">
                <SelectValue placeholder="Yok">
                  {selectedProject ? (
                    <span className="text-orange-600 truncate">{selectedProject.name}</span>
                  ) : (
                    <span className="text-muted-foreground">Yok</span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {projectList.length === 0 ? (
                  <p className="px-2 py-3 text-sm text-muted-foreground text-center">Proje yok</p>
                ) : (
                  projectList.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {projectId && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => handleProjectSelect(null)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </Button>
            )}
          </div>
        </div>

        {/* Liste */}
        <div className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <ListTodo
              className={cn('h-4 w-4', listId ? 'text-cyan-500' : 'text-muted-foreground')}
            />
            <span className="text-sm">Liste</span>
          </div>
          <div className="flex items-center gap-1">
            <Select value={listId || ''} onValueChange={(val) => handleListSelect(val || null)}>
              <SelectTrigger className="h-7 w-auto max-w-32 border-0 bg-transparent gap-1 text-xs">
                <SelectValue placeholder="Yok">
                  {selectedList ? (
                    <span className="text-cyan-600 truncate">{selectedList.title}</span>
                  ) : (
                    <span className="text-muted-foreground">Yok</span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {noteList.length === 0 ? (
                  <p className="px-2 py-3 text-sm text-muted-foreground text-center">Liste yok</p>
                ) : (
                  noteList.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {listId && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => handleListSelect(null)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {format(new Date(note.createdAt), 'd MMM yyyy', { locale: tr })}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          disabled={isPending}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Sil
        </Button>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const NotesTabMenu = ({ noteList, notes, projectlist }: NotesTabMenuProps) => {
  const [activeTab, setActiveTab] = useState<string>('ALL');

  // Helper: Bugünün başlangıç ve bitiş tarihleri
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  // Filter counts
  const importantNoteCount = notes.filter((note) => note.isImportant === true).length;
  const completedNoteCount = notes.filter((note) => note.isCompleted === true).length;

  // Bugün: dueDate bugün olanlar (tamamlanmamış)
  const todayNoteCount = notes.filter((note) => {
    if (note.isCompleted) return false;
    if (!note.dueDate) return false;
    const due = new Date(note.dueDate);
    return due >= startOfToday && due <= endOfToday;
  }).length;

  // Planlanan: dueDate VEYA remindAt değeri olanlar (tamamlanmamış, gelecek tarihli)
  const plannedNoteCount = notes.filter((note) => {
    if (note.isCompleted) return false;
    return note.dueDate || note.remindAt;
  }).length;

  // Yaklaşan: remindAt bugün veya geçmişte olanlar (tamamlanmamış)
  const upcomingNoteCount = notes.filter((note) => {
    if (note.isCompleted) return false;
    if (!note.remindAt) return false;
    const remind = new Date(note.remindAt);
    return remind <= endOfToday;
  }).length;

  // Not'un rengini bul
  const getNoteColor = (note: Note) => {
    const list = noteList.find((item) => item.id === note.listId);
    return list?.color || '#ececec';
  };

  const handleCategorizeNotes = (listId: string) => {
    setActiveTab(listId);
  };

  const tabNotes = useMemo(() => {
    if (activeTab === 'ALL') return notes;
    if (activeTab === 'STAR') return notes.filter((note) => note.isImportant === true);
    if (activeTab === 'DONE') return notes.filter((note) => note.isCompleted === true);

    // Yeni filtreler
    if (activeTab === 'TODAY') {
      return notes.filter((note) => {
        if (note.isCompleted) return false;
        if (!note.dueDate) return false;
        const due = new Date(note.dueDate);
        return due >= startOfToday && due <= endOfToday;
      });
    }

    if (activeTab === 'PLANNED') {
      return notes.filter((note) => {
        if (note.isCompleted) return false;
        return note.dueDate || note.remindAt;
      });
    }

    if (activeTab === 'UPCOMING') {
      return notes.filter((note) => {
        if (note.isCompleted) return false;
        if (!note.remindAt) return false;
        const remind = new Date(note.remindAt);
        return remind <= endOfToday;
      });
    }

    return notes.filter((note) => note.listId === activeTab);
  }, [notes, activeTab, startOfToday, endOfToday]);

  // Sağ tarafta açılacak olan note detail yapısı için
  const [noteDetail, setNoteDetail] = useState<Note | null>(null);
  const [openNoteDetail, setOpenNoteDetail] = useState(false);

  // Keep noteDetail in sync with notes array (when server refreshes data)
  useEffect(() => {
    if (noteDetail) {
      const updatedNote = notes.find((n) => n.id === noteDetail.id);
      if (updatedNote) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNoteDetail(updatedNote);
      } else {
        // Note was deleted
        setNoteDetail(null);
        setOpenNoteDetail(false);
      }
    }
  }, [notes, noteDetail?.id]);

  const handleNoteClick = (note: Note) => {
    if (noteDetail?.id === note.id && openNoteDetail) {
      // Aynı nota tekrar tıklandıysa kapat
      setOpenNoteDetail(false);
      setNoteDetail(null);
    } else {
      // Farklı nota tıklandıysa veya panel kapalıysa aç
      setNoteDetail(note);
      setOpenNoteDetail(true);
    }
  };

  const handleCloseDetail = () => {
    setOpenNoteDetail(false);
    setNoteDetail(null);
  };

  return (
    <div className="grid grid-cols-9 gap-4 mt-4 items-start justify-start">
      {/* Sol Menü - Listeler */}
      <div className="lg:col-span-2 col-span-9 border rounded-lg p-4">
        <div className="flex flex-col py-2 px-2 w-full bg-transparent gap-1">
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between rounded-md border hover:opacity-100!"
              style={{
                borderColor: activeTab === 'DONE' ? '#5AA469' + '80' : '#5AA469' + '40',
                backgroundColor: activeTab === 'DONE' ? '#5AA469' + '30' : '#5AA469' + '10',
                opacity: activeTab === 'DONE' ? 1 : 0.6,
              }}
              onClick={() => handleCategorizeNotes('DONE')}
            >
              <div className="flex items-center gap-2">
                <Check color="#5AA469" className="h-4 w-4" />
                <span>Tamamlandı</span>
              </div>
              <span className="text-xs border bg-accent px-2 py-0.5 rounded">
                {completedNoteCount}
              </span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-between rounded-md border hover:opacity-100! mt-2"
              style={{
                borderColor: activeTab === 'STAR' ? '#E5BA41' + '80' : '#E5BA41' + '40',
                backgroundColor: activeTab === 'STAR' ? '#E5BA41' + '30' : '#E5BA41' + '10',
                opacity: activeTab === 'STAR' ? 1 : 0.6,
              }}
              onClick={() => handleCategorizeNotes('STAR')}
            >
              <div className="flex items-center gap-2">
                <Star fill="#E5BA41" color="#E5BA41" className="h-4 w-4" />
                <span>Önemli</span>
              </div>
              <span className="text-xs border bg-accent px-2 py-0.5 rounded">
                {importantNoteCount}
              </span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-between rounded-md border hover:opacity-100! mt-2"
              style={{
                borderColor: activeTab === 'ALL' ? '#ececec' + '80' : '#ececec' + '40',
                backgroundColor: activeTab === 'ALL' ? '#ececec' + '30' : '#ececec' + '10',
                opacity: activeTab === 'ALL' ? 1 : 0.6,
              }}
              onClick={() => handleCategorizeNotes('ALL')}
            >
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                <span>Tümü</span>
              </div>
              <span className="text-xs border bg-accent px-2 py-0.5 rounded">{notes.length}</span>
            </Button>

            <Separator className="my-3" />
            <h4 className="text-sm font-semibold mb-3">Tarih Filtreleri</h4>

            {/* Bugün */}
            <Button
              variant="ghost"
              className="w-full justify-between rounded-md border hover:opacity-100! mt-2"
              style={{
                borderColor: activeTab === 'TODAY' ? '#3B82F6' + '80' : '#3B82F6' + '40',
                backgroundColor: activeTab === 'TODAY' ? '#3B82F6' + '30' : '#3B82F6' + '10',
                opacity: activeTab === 'TODAY' ? 1 : 0.6,
              }}
              onClick={() => handleCategorizeNotes('TODAY')}
            >
              <div className="flex items-center gap-2">
                <CalendarDays color="#3B82F6" className="h-4 w-4" />
                <span>Bugün</span>
              </div>
              <span className="text-xs border bg-accent px-2 py-0.5 rounded">{todayNoteCount}</span>
            </Button>

            {/* Planlanan */}
            <Button
              variant="ghost"
              className="w-full justify-between rounded-md border hover:opacity-100! mt-2"
              style={{
                borderColor: activeTab === 'PLANNED' ? '#8B5CF6' + '80' : '#8B5CF6' + '40',
                backgroundColor: activeTab === 'PLANNED' ? '#8B5CF6' + '30' : '#8B5CF6' + '10',
                opacity: activeTab === 'PLANNED' ? 1 : 0.6,
              }}
              onClick={() => handleCategorizeNotes('PLANNED')}
            >
              <div className="flex items-center gap-2">
                <CalendarDays color="#8B5CF6" className="h-4 w-4" />
                <span>Planlanan</span>
              </div>
              <span className="text-xs border bg-accent px-2 py-0.5 rounded">
                {plannedNoteCount}
              </span>
            </Button>

            {/* Yaklaşan Hatırlatıcılar */}
            <Button
              variant="ghost"
              className="w-full justify-between rounded-md border hover:opacity-100! mt-2"
              style={{
                borderColor: activeTab === 'UPCOMING' ? '#F97316' + '80' : '#F97316' + '40',
                backgroundColor: activeTab === 'UPCOMING' ? '#F97316' + '30' : '#F97316' + '10',
                opacity: activeTab === 'UPCOMING' ? 1 : 0.6,
              }}
              onClick={() => handleCategorizeNotes('UPCOMING')}
            >
              <div className="flex items-center gap-2">
                <Bell color="#F97316" className="h-4 w-4" />
                <span>Yaklaşan</span>
              </div>
              <span className="text-xs border bg-accent px-2 py-0.5 rounded">
                {upcomingNoteCount}
              </span>
            </Button>

            <Separator className="my-3" />

            <h4 className="text-sm font-semibold mb-3">Not Listelerim</h4>
            <Separator className="my-3" />
            <ScrollArea className="h-[calc(100vh-650px)] min-h-40">
              {noteList.map((list) => (
                <NoteListItem
                  key={list.id}
                  list={list}
                  isActive={activeTab === list.id}
                  onSelect={() => handleCategorizeNotes(list.id)}
                />
              ))}
            </ScrollArea>
          </div>
          <Separator className="my-3" />
          {/* Yeni liste oluştur */}
          <CreateNewList />
        </div>
      </div>

      {/* Sağ Taraf - Notlar ve Detay Paneli */}
      <div className="lg:col-span-7 col-span-9 border rounded-lg p-4 flex gap-4">
        {/* Not Listesi */}
        <div className={cn('h-auto', openNoteDetail ? 'flex-1' : 'w-full')}>
          <ScrollArea className="h-[calc(100vh-215px)]">
            <div className="sticky top-0 z-10 bg-background">
              <p className="mb-3 text-accent-foreground/60">
                {activeTab === 'ALL'
                  ? 'Tüm Notlarınız'
                  : activeTab === 'STAR'
                    ? 'Önemli Notlar'
                    : activeTab === 'DONE'
                      ? 'Tamamlanan Notlar'
                      : activeTab === 'TODAY'
                        ? 'Bugün Yapılacaklar'
                        : activeTab === 'PLANNED'
                          ? 'Planlanan Notlar'
                          : activeTab === 'UPCOMING'
                            ? 'Yaklaşan Hatırlatıcılar'
                            : noteList[noteList.findIndex((val) => val.id === activeTab)]
                                ?.description || 'Notlar'}
              </p>
              <Separator className="mt-3 mb-5" />
            </div>
            {tabNotes.map((note) => (
              <div
                key={note.id}
                style={{
                  borderLeftColor:
                    note.id === noteDetail?.id && openNoteDetail
                      ? getNoteColor(note)
                      : 'transparent',
                }}
                className="border-l-4 rounded-xl transition-all"
                onClick={() => handleNoteClick(note)}
              >
                <NoteItem note={note} selectedColor={getNoteColor(note)} />
              </div>
            ))}
          </ScrollArea>
          <CreateNewNoteInput noteList={noteList} projectList={projectlist} />
        </div>

        {/* Detay Paneli */}
        {openNoteDetail && noteDetail && (
          <NoteDetailPanel
            note={noteDetail}
            noteList={noteList}
            projectList={projectlist}
            selectedColor={getNoteColor(noteDetail)}
            onClose={handleCloseDetail}
          />
        )}
      </div>
    </div>
  );
};

export default NotesTabMenu;
