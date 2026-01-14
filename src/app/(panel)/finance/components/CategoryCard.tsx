'use client';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { deleteCategory } from '@/lib/actions/category';
import { useTransition } from 'react';
interface CategoryCardProps {
  category: Category;
}
import { toast } from 'sonner';

const CategoryCard = ({ category }: CategoryCardProps) => {
  const [isPending, startTransition] = useTransition();
  const handleDelete = () => {
    if (!confirm('Bu işlemi silmek istediğinize emin misiniz?')) return;
    startTransition(async () => {
      const res = await deleteCategory(category.id);
      if (res.error) {
        toast.error('Bir Hata Meydana Geldi: ' + res.error, {
          position: 'top-center',
        });
      } else {
        toast.success(category.name + ' kategori silindi !', {
          position: 'top-center',
        });
      }
    });
  };
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={`border-2 ${
            category.type == 'EXPENSE'
              ? 'border-red-500 dark:border-red-500/40 text-red-500 dark:text-red-500/80 hover:bg-red-50 dark:hover:bg-red-50/5'
              : 'border-green-500 dark:border-green-500/40 text-green-500 dark:text-green-500/80 hover:bg-green-50 dark:hover:bg-green-50/5'
          } transition-all duration-150 text-xs rounded-md p-2 mb-2 grid grid-cols-7 items-center`}
        >
          <span className="text-sm text-left col-span-5">{category.name}</span>
          <span className="font-semibold text-center col-span-1">
            {category.type === 'EXPENSE' ? 'Gider' : 'Gelir'}
          </span>
          <div className="flex justify-end col-span-1">
            <span
              className={`h-4 w-4 text-white rounded-sm flex items-center justify-center ${
                category.type === 'INCOME' ? 'bg-green-600' : 'bg-red-600'
              }`}
            >
              {category._count?.transactions}
            </span>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleDelete}>Sil</ContextMenuItem>
        <ContextMenuItem>Güncelle</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default CategoryCard;
