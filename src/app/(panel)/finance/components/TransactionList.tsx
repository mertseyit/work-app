'use client';
import { useState } from 'react';
import TransactionFilter from './TransactionFilter';
import TransactionCard from './TransactionCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TransactionListPropTypes {
  listTransactions: Transaction[];
}

const TransactionList = ({ listTransactions }: TransactionListPropTypes) => {
  const [transactions, setTransactions] = useState<Transaction[]>(listTransactions);

  return (
    <div>
      <TransactionFilter onFilterWork={setTransactions} transactions={listTransactions} />
      {transactions.length === 0 ? (
        <p className="text-center text-xs font-semibold py-3">Henüz kayıt yok</p>
      ) : (
        <>
          <ScrollArea className="h-[500px] p-2 ">
            {transactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </ScrollArea>
        </>
      )}
    </div>
  );
};

export default TransactionList;
