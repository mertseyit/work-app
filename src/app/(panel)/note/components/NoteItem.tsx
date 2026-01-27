'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { updateNote } from '@/lib/actions/note';
import { Check, Circle, Star, Bell, CalendarDays, Repeat, FolderKanban } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

type RecurrenceType = 'DAILY' | 'WEEKDAYS' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';

interface Project {
  id: string;
  name: string;
}

interface NoteList {
  id: string;
  title: string;
  color?: string;
}

interface Note {
  id: string;
  title: string;
  isImportant: boolean;
  isCompleted: boolean;
  remindAt: Date | null;
  dueDate: Date | null;
  recurrenceType: RecurrenceType | null;
  recurrenceInterval: number | null;
  listId: string | null;
  list?: NoteList;
  userId: string;
  projectId: string | null;
  project?: Project;
  createdAt: Date;
  updatedAt: Date;
}

interface NoteItemProps {
  note: Note;
  selectedColor: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatDisplayDate(date: Date | null | undefined): string {
  if (!date) return '';
  return format(new Date(date), 'd MMM', { locale: tr });
}

function isOverdue(date: Date | null | undefined): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

// ============================================
// MAIN COMPONENT
// ============================================

const NoteItem = ({ note, selectedColor }: NoteItemProps) => {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(note.isCompleted);
  const [isImportant, setIsImportant] = useState(note.isImportant);

  // Sync local state when note prop changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsCompleted(note.isCompleted);
    setIsImportant(note.isImportant);
  }, [note.isCompleted, note.isImportant]);

  const handleUpdateNote = async (updates: Partial<Pick<Note, 'isCompleted' | 'isImportant'>>) => {
    const response = await updateNote(note.id, {
      ...note,
      isCompleted: updates.isCompleted ?? isCompleted,
      isImportant: updates.isImportant ?? isImportant,
    });

    if (!response.success) {
      toast.error('Not durumu güncellenemedi', { position: 'top-center' });
    } else {
      router.refresh();
    }
  };

  const isDueDateOverdue = note.dueDate && isOverdue(note.dueDate) && !isCompleted;

  return (
    <div
      style={{ borderColor: selectedColor + '80' }}
      className={cn(
        'border rounded-lg p-1 mb-2 cursor-pointer flex items-center justify-between transition-all',
        isCompleted ? 'opacity-40 line-through' : 'opacity-80 hover:opacity-100',
      )}
    >
      <div className="flex items-center justify-start gap-3">
        <Toggle
          onPressedChange={async (e) => {
            setIsCompleted(e);
            await handleUpdateNote({ isCompleted: e });
          }}
          pressed={isCompleted}
          onClick={(e) => e.stopPropagation()}
          className={cn('border! relative', isCompleted ? 'bg-blue-600/20!' : 'bg-transparent')}
        >
          {isCompleted ? (
            <Check className={cn(isCompleted && 'text-blue-500')} />
          ) : (
            <Circle className="rounded-full" />
          )}
        </Toggle>

        <div className="flex flex-col">
          <p className="font-semibold text-sm">{note.title}</p>

          {/* Meta badges */}
          {(note.dueDate || note.remindAt || note.recurrenceType || note.project) && (
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {note.dueDate && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded',
                    isDueDateOverdue
                      ? 'bg-red-500/15 text-red-600'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  <CalendarDays className="h-2.5 w-2.5" />
                  {formatDisplayDate(note.dueDate)}
                </span>
              )}
              {note.remindAt && (
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-600">
                  <Bell className="h-2.5 w-2.5" />
                  {formatDisplayDate(note.remindAt)}
                </span>
              )}
              {note.recurrenceType && (
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-600">
                  <Repeat className="h-2.5 w-2.5" />
                </span>
              )}
              {note.project && (
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-600 max-w-20 truncate">
                  <FolderKanban className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{note.project.name}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <Toggle
          pressed={isImportant}
          className="bg-transparent!"
          onPressedChange={async (e) => {
            setIsImportant(e);
            await handleUpdateNote({ isImportant: e });
          }}
          asChild
          onClick={(e) => e.stopPropagation()}
        >
          <Button variant="ghost" size="icon-sm">
            <Star
              fill={isImportant ? '#E5BA41' : 'transparent'}
              color={isImportant ? '#E5BA41' : 'currentColor'}
              size={16}
            />
          </Button>
        </Toggle>
      </div>
    </div>
  );
};

export default NoteItem;
