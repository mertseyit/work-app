import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ProcessCard from './components/TransactionCard';
import { MOCK_PROCESSES } from '@/test-data';
import { TransactionCharts } from './components/TransactionCharts';
import AddNewTransaction from '../components/AddNewTransaction';
import AddCategory from '../components/AddCategory';

const FinansPage = () => {
  return (
    <div className="x-container py-3">
      <div className="grid grid-cols-3 gap-3 py-3">
        {/* last process */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Son Yapılan İşlemler</CardTitle>
            <CardAction>
              <Select>
                <SelectTrigger className="w-auto" size="sm">
                  <SelectValue placeholder="Göster" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Günlük</SelectItem>
                  <SelectItem value="5">5 Günlük</SelectItem>
                  <SelectItem value="10">10 Günlük</SelectItem>
                  <SelectItem value="20">20 Günlük</SelectItem>
                  <SelectItem value="30">30 Günlük</SelectItem>
                </SelectContent>
              </Select>
            </CardAction>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-center w-full gap-3 px-1.5 pb-2 mb-2 pt-2 mt-2 border-y">
              <AddNewTransaction />
              <AddCategory />
            </div>
            {MOCK_PROCESSES.map((transaction) => (
              <ProcessCard key={transaction.id} transaction={transaction} />
            ))}
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-base">İstatiksel Veriler</CardTitle>
            <CardAction>
              <Select>
                <SelectTrigger className="w-auto" size="sm">
                  <SelectValue placeholder="Göster" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Günlük</SelectItem>
                  <SelectItem value="5">5 Günlük</SelectItem>
                  <SelectItem value="10">10 Günlük</SelectItem>
                  <SelectItem value="20">20 Günlük</SelectItem>
                  <SelectItem value="30">30 Günlük</SelectItem>
                </SelectContent>
              </Select>
            </CardAction>
          </CardHeader>
          <CardContent>
            <TransactionCharts />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinansPage;
