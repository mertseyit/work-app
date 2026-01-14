'use client';
import { formatDate } from '@/helpers/formatDate';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { deleteTransaction } from '@/lib/actions/transaction';
import { BanknoteArrowDown, BanknoteArrowUp } from 'lucide-react';
import { useTransition } from 'react';
import { toast } from 'sonner';

interface TransactionCardProps {
  transaction: Transaction;
}
const TransactionCard = ({ transaction }: TransactionCardProps) => {
  const [isPending, startTransition] = useTransition();
  const handleDelete = () => {
    // Basit bir browser onayı (Hızlı çözüm)
    // İstersen buraya da Dialog (Modal) koyabilirsin ama silme için genelde confirm yeterlidir.
    if (!confirm('Bu işlemi silmek istediğinize emin misiniz?')) return;

    startTransition(async () => {
      const res = await deleteTransaction(transaction.id);
      if (res.error) {
        toast.error('Bir Hata Meydana Geldi: ' + res.error, {
          position: 'top-center',
        });
      } else {
        toast.success(transaction.title + ' işlemi silindi !', {
          position: 'top-center',
        });
      }
    });
  };
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={`border-2 transition-all duration-150 ${
            transaction.type == 'EXPENSE'
              ? 'border-red-500 dark:border-red-500/40 text-red-500 dark:text-red-500/80 hover:bg-red-50 dark:hover:bg-red-50/5'
              : 'border-green-500 dark:border-green-500/40 text-green-500 dark:text-green-500/80 hover:bg-green-50 dark:hover:bg-green-50/5'
          } rounded-md p-3 mb-3`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col gap-1">
              <h3 className="text-xs font-semibold  line-clamp-1">{transaction.title}</h3>
              <span className="italic text-[11px] text-slate-500">
                {transaction.category?.name}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold  line-clamp-2">
                  {Number(transaction.amount)} ₺
                </p>
                <span className="italic text-[11px] text-slate-500">
                  {formatDate(transaction.date, 'hours')}
                </span>
              </div>
              <div
                className={`border w-6 h-6 text-white rounded-full ${
                  transaction.type === 'EXPENSE' ? 'bg-red-500 ' : 'bg-green-500 '
                }  flex items-center justify-center`}
              >
                {transaction.type === 'EXPENSE' ? (
                  <BanknoteArrowUp size={14} />
                ) : (
                  <BanknoteArrowDown size={14} />
                )}
              </div>
            </div>
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

export default TransactionCard;
