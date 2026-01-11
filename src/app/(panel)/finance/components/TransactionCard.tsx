import { formatDate } from '@/app/helpers/formatDate';
import { BanknoteArrowDown, BanknoteArrowUp } from 'lucide-react';

interface TransactionCardProps {
  transaction: Transaction;
}
const TransactionCard = ({ transaction }: TransactionCardProps) => {
  return (
    <div
      className={`border-2 transition-all duration-150 ${
        transaction.type == 'expense'
          ? 'border-red-500 dark:border-red-500/40 text-red-500 dark:text-red-500/80 hover:bg-red-50 dark:hover:bg-red-50/5'
          : 'border-green-500 dark:border-green-500/40 text-green-500 dark:text-green-500/80 hover:bg-green-50 dark:hover:bg-green-50/5'
      } rounded-md p-3 mb-3`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h3 className="text-xs font-semibold  line-clamp-1">{transaction.title}</h3>
          <span className="italic text-[11px] text-slate-500">{transaction.category}</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold  line-clamp-2">{transaction.amount} ₺</p>
            <span className="italic text-[11px] text-slate-500">
              {formatDate(transaction.date)}
            </span>
          </div>
          <div
            className={`border w-6 h-6 text-white rounded-full ${
              transaction.type === 'expense' ? 'bg-red-500 ' : 'bg-green-500 '
            }  flex items-center justify-center`}
          >
            {transaction.type === 'expense' ? (
              <BanknoteArrowUp size={14} />
            ) : (
              <BanknoteArrowDown size={14} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
