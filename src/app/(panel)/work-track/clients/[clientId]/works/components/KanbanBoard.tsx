'use client';

import React, { useMemo, useState, useTransition } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
  DropAnimation,
  useDroppable,
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
import { createTask, deleteTask, updateTaskStatus } from '@/lib/actions/task';
import {
  Check,
  CircleMinus,
  ClipboardList,
  GripVertical,
  Hourglass,
  LayoutList,
} from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateTaskSchema, CreateTaskSchemaType } from '@/lib/validators';
import { Button } from '@/components/ui/button';

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

const TaskCard = ({
  task,
  isOverlay,
  onDelete,
}: {
  task: Task;
  isOverlay?: boolean;
  onDelete?: () => void;
}) => {
  const styles = STATUS_STYLES[task.status];

  return (
    <div
      className={`p-3 rounded-md shadow-sm border mb-2 flex items-center justify-between gap-2 group transition-all duration-200 hover-opacity-important group
      ${styles.card} ${styles.cardBorder} 
      ${
        isOverlay
          ? 'border-primary shadow-xl scale-105 cursor-grabbing z-50'
          : 'cursor-grab hover:border-primary/50'
      }`}
    >
      <div className="flex items-center justify-start">
        <GripVertical className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary" />
        <span className="text-[11px] font-medium text-foreground">{task.title}</span>
      </div>
      {onDelete && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="  p-0 w-3 h-6 rounded-sm  border-red-600/40 text-red-600 border opacity-0 group-hover:opacity-100 bg-transparent hover:bg-transparent"
        >
          <CircleMinus />
        </Button>
      )}
    </div>
  );
};

const SortableItem = ({ task, onDelete }: { task: Task; onDelete: () => void }) => {
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
      <TaskCard onDelete={onDelete} task={task} />
    </div>
  );
};

const KanbanColumn = ({
  id,
  title,
  tasks,
  icon,
  onDeleteTask,
}: {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  icon: React.ReactNode;
  onDeleteTask: (taskId: string) => void;
}) => {
  const { setNodeRef } = useDroppable({
    id,
    data: {
      type: 'Column',
      columnId: id,
    },
  });

  const styles = STATUS_STYLES[id];
  return (
    <div
      ref={setNodeRef}
      className="flex flex-col h-full rounded-lg border bg-background border-border "
    >
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

      <div className="flex-1 p-2 flex flex-col">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableItem key={task.id} task={task} onDelete={() => onDeleteTask(task.id)} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="mt-2 h-24 rounded-md border-2 border-dashed flex items-center justify-center text-[10px] border-border text-muted-foreground bg-muted/40">
            Buraya Sürükle
          </div>
        )}
      </div>
    </div>
  );
};

export default function KanbanBoard({
  initialTasks,
  projectId,
}: {
  initialTasks: Task[];
  projectId: string;
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [changeLoading, setChangeLoading] = useState(false);
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

    if (isOverTask) {
      setTasks((items) => {
        const activeIndex = items.findIndex((t) => t.id === activeId);
        const overIndex = items.findIndex((t) => t.id === overId);
        const activeTask = items[activeIndex];
        const overTask = items[overIndex];

        if (activeTask.status !== overTask.status) {
          const updatedItems = items.map((item) =>
            item.id === activeId ? { ...item, status: overTask.status } : item,
          );
          return updatedItems;
        }

        return arrayMove(items, activeIndex, overIndex);
      });
    }

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
    setChangeLoading(true);
    const { active } = event;
    setActiveTask(null);
    if (active.data.current?.type === 'Task') {
      const task = tasks.find((t) => t.id === active.id);
      if (task) {
        const res = await updateTaskStatus(
          task.id,
          task.status,
          active.data.current.sortable.index,
          task.projectId,
        );
        if (!res.success) {
          toast.error(res.error ?? 'Bir hata oluştu', { position: 'top-center' });
          setChangeLoading(false);
        } else {
          toast.success(`Görev güncellendi`, {
            position: 'top-center',
          });
          setChangeLoading(false);
        }
      }
    }
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.5' } },
    }),
  };

  const todoTasks = useMemo(() => tasks.filter((t) => t.status === 'TODO'), [tasks]);
  const inProgressTasks = useMemo(() => tasks.filter((t) => t.status === 'IN_PROGRESS'), [tasks]);
  const doneTasks = useMemo(() => tasks.filter((t) => t.status === 'DONE'), [tasks]);

  const [isPending, startTransition] = useTransition();
  const form = useForm<CreateTaskSchemaType>({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: {
      title: '',
    },
  });

  const onSubmit = (data: CreateTaskSchemaType) => {
    startTransition(async () => {
      const response = await createTask(data, projectId);
      if (response.error) {
        toast.error(response.error, { position: 'top-center' });
      } else {
        toast.success('Görev Eklendi', { position: 'top-center' });
        if (response.data) {
          setTasks((prev) => [...prev, response.data as Task]);
        }
        form.reset();
      }
    });
  };

  const handleDeleteTask = (id: string) => {
    startTransition(async () => {
      const response = await deleteTask(id);
      if (response.error) {
        toast.error(response.error, { position: 'top-center' });
        // Hata olursa geri ekle (rollback)
        // Not: Burada orijinal task'ı geri eklemek için initialTasks'tan alabilirsiniz
      } else {
        toast.success('Görev silindi', { position: 'top-center' });
        if (response.data) {
          setTasks(response.data);
        }
      }
    });
  };

  return (
    <div className="relative">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <InputGroup>
          <InputGroupInput
            {...form.register('title')}
            placeholder="Görev Girin ve Ekleyin"
            className="border-purple-600/50 border-dashed"
          />
          <InputGroupAddon>
            <LayoutList />
          </InputGroupAddon>
        </InputGroup>
        <p className="text-[11px] text-accent-foreground/60">Görevi yazın ve {"Enter'a"} basın</p>
      </form>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {(changeLoading || isPending) && (
          <div className="absolute flex items-center gap-2 justify-center rounded-2xl top-0 left-0 w-full h-full bg-accent/20 z-100 backdrop-blur-[1px]">
            <Spinner fontSize={32} />
            <span className="text-xs font-semibold">Yenileniyor</span>
          </div>
        )}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 duration-200`}>
          <KanbanColumn
            onDeleteTask={handleDeleteTask}
            icon={<ClipboardList size={14} className="text-blue-500" />}
            id="TODO"
            title="Yapılacaklar"
            tasks={todoTasks}
          />
          <KanbanColumn
            onDeleteTask={handleDeleteTask}
            icon={<Hourglass size={14} className="text-orange-500" />}
            id="IN_PROGRESS"
            title="İşlemde"
            tasks={inProgressTasks}
          />
          <KanbanColumn
            onDeleteTask={handleDeleteTask}
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
    </div>
  );
}
