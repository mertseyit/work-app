'use client';

import React, { useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
  DropAnimation,
  useDroppable, // YENİ: Sütunlar için bunu kullanacağız
  pointerWithin,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { updateTaskStatus } from '@/lib/actions/task';
import { Check, ClipboardList, GripVertical, Hourglass } from 'lucide-react';
import { toast } from 'sonner';

/* ... STATUS_STYLES ve TaskCard AYNI KALACAK ... */
const STATUS_STYLES: Record<TaskStatus, { header: string; card: string; cardBorder: string }> = {
  TODO: {
    header: 'bg-blue-50 dark:bg-blue-500/10',
    card: 'bg-blue-50/60 dark:bg-blue-500/10',
    cardBorder: 'border-blue-400/30 dark:border-blue-500/20',
  },
  IN_PROGRESS: {
    header: 'bg-orange-50 dark:bg-orange-500/10',
    card: 'bg-orange-50/60 dark:bg-orange-500/10',
    cardBorder: 'border-orange-400/30 dark:border-orange-500/20',
  },
  DONE: {
    header: 'bg-emerald-50 dark:bg-emerald-500/10',
    card: 'bg-emerald-50/60 dark:bg-emerald-500/10',
    cardBorder: 'border-emerald-400/30 dark:border-emerald-500/20',
  },
};

const TaskCard = ({ task, isOverlay }: { task: Task; isOverlay?: boolean }) => {
  const styles = STATUS_STYLES[task.status];
  return (
    <div
      className={`p-3 rounded-md shadow-sm border mb-2 flex items-start gap-2 group transition-all duration-200 
      ${styles.card} ${styles.cardBorder} 
      ${
        isOverlay
          ? 'border-primary shadow-xl scale-105 cursor-grabbing z-50'
          : 'cursor-grab hover:border-primary/50'
      }`}
    >
      <GripVertical className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary" />
      <span className="text-[11px] font-medium text-foreground">{task.title}</span>
    </div>
  );
};

/* ... SortableItem AYNI KALACAK ... */
const SortableItem = ({ task }: { task: Task }) => {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'Task', task },
  });

  const style = { transition, transform: CSS.Translate.toString(transform) };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-12 mb-2 rounded-md bg-muted border border-dashed border-primary/20 opacity-40"
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* KANBAN COLUMN (DÜZENLENDİ)                        */
/* -------------------------------------------------------------------------- */

const KanbanColumn = ({
  id,
  title,
  tasks,
  icon,
}: {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  icon: React.ReactNode;
}) => {
  // DÜZELTME 1: useSortable yerine useDroppable kullandık.
  // Çünkü sütunların kendisi sıralanmıyor, sadece içine item kabul ediyor.
  const { setNodeRef } = useDroppable({
    id,
    data: {
      type: 'Column',
      columnId: id,
    },
  });

  const styles = STATUS_STYLES[id];

  return (
    // DÜZELTME 2: ref={setNodeRef} en dış katmana taşındı.
    // Böylece sütunun herhangi bir yerine (header dahil) sürükleyince algılar.
    <div
      ref={setNodeRef}
      className="flex flex-col h-full rounded-lg border bg-background border-border "
    >
      {/* Header */}
      <div
        className={`p-3 border-b rounded-t-lg flex items-center justify-between border-border ${styles.header}`}
      >
        <h6 className="text-xs flex items-center justify-start gap-2 font-semibold text-foreground">
          {icon} {title}
        </h6>
        <Badge
          variant="secondary"
          className="bg-background/60 dark:bg-muted text-muted-foreground text-[10px]"
        >
          {tasks.length}
        </Badge>
      </div>

      {/* Drop Area */}
      {/* Flex-1 ve min-h değerleri drop alanını genişletir */}
      <div className="flex-1 p-2 flex flex-col">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableItem key={task.id} task={task} />
          ))}
        </SortableContext>

        {/* Placeholder sadece liste boşsa gösterilir */}
        {tasks.length === 0 && (
          <div className="mt-2 h-24 rounded-md border-2 border-dashed flex items-center justify-center text-[10px] border-border text-muted-foreground bg-muted/40">
            Buraya Sürükle
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN BOARD                                    */
/* -------------------------------------------------------------------------- */

export default function KanbanBoard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    // Eğer bir taskın üzerine geliniyorsa
    if (isOverTask) {
      setTasks((items) => {
        const activeIndex = items.findIndex((t) => t.id === activeId);
        const overIndex = items.findIndex((t) => t.id === overId);
        const activeTask = items[activeIndex];
        const overTask = items[overIndex];

        // Farklı sütunlara taşıma
        if (activeTask.status !== overTask.status) {
          const updatedItems = items.map((item) =>
            item.id === activeId ? { ...item, status: overTask.status } : item,
          );
          return updatedItems;
        }

        // Aynı sütun içinde sıralama
        return arrayMove(items, activeIndex, overIndex);
      });
    }

    // Eğer bir kolona geliniyorsa
    if (isOverColumn) {
      setTasks((items) => {
        const activeIndex = items.findIndex((t) => t.id === activeId);
        const newStatus = overId as TaskStatus;

        const updatedItems = items.map((item, index) =>
          index === activeIndex ? { ...item, status: newStatus } : item,
        );

        return updatedItems;
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active } = event;
    setActiveTask(null);

    // Veritabanı güncellemesi
    if (active.data.current?.type === 'Task') {
      const task = tasks.find((t) => t.id === active.id);
      if (task) {
        // Optimistic update zaten yapıldı, sadece backend'e bildiriyoruz
        const res = await updateTaskStatus(task.id, task.status);
        if (!res.success) {
          // Hata olursa kullanıcıyı uyar (burada rollback mantığı da eklenebilir)
          toast.error(res.error ?? 'Bir hata oluştu', { position: 'top-center' });
        } else {
          // İsteğe bağlı: Her işlemde toast göstermek kullanıcıyı yorabilir,
          // sadece hata durumunda veya statü değişiminde gösterilebilir.
        }
      }
    }
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.5' } },
    }),
  };

  // Memoize tasks per status
  const todoTasks = useMemo(() => tasks.filter((t) => t.status === 'TODO'), [tasks]);
  const inProgressTasks = useMemo(() => tasks.filter((t) => t.status === 'IN_PROGRESS'), [tasks]);
  const doneTasks = useMemo(() => tasks.filter((t) => t.status === 'DONE'), [tasks]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div suppressHydrationWarning className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
        <KanbanColumn
          icon={<ClipboardList size={14} className="text-blue-500" />}
          id="TODO"
          title="Yapılacaklar"
          tasks={todoTasks}
        />
        <KanbanColumn
          icon={<Hourglass size={14} className="text-orange-500" />}
          id="IN_PROGRESS"
          title="İşlemde"
          tasks={inProgressTasks}
        />
        <KanbanColumn
          icon={<Check size={14} className="text-emerald-500" />}
          id="DONE"
          title="Tamamlandı"
          tasks={doneTasks}
        />
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
