'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChangeEvent, ChangeEventHandler, useState } from 'react';

interface TransactionFilterPropTypes {
  transactions: Transaction[];
  onFilterWork: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const TransactionFilter = ({ transactions, onFilterWork }: TransactionFilterPropTypes) => {
  const sortOptions = [
    { label: 'Artan', value: 'ascending' },
    { label: 'Azalan', value: 'descending' },
    { label: 'En Yüksek Miktar', value: 'amount_desc' },
    { label: 'En Düşük Miktar', value: 'amount_asc' },
  ];

  const dateOptions = [
    { label: '3 Günlük', value: '3' },
    { label: '10 Günlük', value: '10' },
    { label: '30 Günlük', value: '30' },
    { label: '1 Yıllık', value: '365' },
    { label: '5 Yıllık', value: '1825' },
    { label: 'Tüm Zamanlar', value: '1' },
  ];

  const [sort, setSort] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    const searchedTransactions = transactions.filter((transaction) =>
      transaction.title.toLowerCase().includes(value),
    );
    onFilterWork(searchedTransactions);
  };

  return (
    <div className="relative">
      <Input onChange={handleSearch} placeholder="Ara" className="abosolute left-0" />
      <Accordion type="single" collapsible className="p-0 pt-2">
        <AccordionItem className="flex flex-col items-end justify-center" value="item-1">
          <AccordionTrigger className="h-auto text-xs p-0">Filtrele</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center justify-end gap-2 mt-2">
              <Select onValueChange={(value) => setSort(value)}>
                <SelectTrigger size="sm" className="w-[90px] text-xs">
                  <SelectValue placeholder="Sırala" />
                </SelectTrigger>

                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => setDate(value)}>
                <SelectTrigger size="sm" className="w-[90px] text-xs">
                  <SelectValue placeholder="Tarih" />
                </SelectTrigger>

                <SelectContent>
                  {dateOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default TransactionFilter;
