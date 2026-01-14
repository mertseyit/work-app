import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import ProcessCard from './components/TransactionCard';
import { TransactionCharts } from './components/TransactionCharts';
import AddNewTransaction from './components/AddNewTransaction';
import AddCategory from './components/AddCategory';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategoryCard from './components/CategoryCard';
import { getCategoryPieData, getMonthlyChartData } from '@/lib/chart-utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const FinansPage = async ({ searchParams }: { searchParams: { days?: string } }) => {
  const { userId } = await auth();
  //gün sayısına göre verileri filtrelet
  const days = (await searchParams).days;
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - (days ? parseInt(days) : 30));

  // 1. Veritabanından Veriyi Çek
  const rawTransactions = await prisma.transaction.findMany({
    where: {
      userId: userId!,
      date: { gte: dateLimit }, // Tarih filtresi
    },
    orderBy: { date: 'asc' }, // Grafikler için tarih sırası önemli
    include: { category: true },
  });

  // 2. Grafik Verilerini Hazırla
  const lineChartData = getMonthlyChartData(rawTransactions);
  const pieChartData = getCategoryPieData(rawTransactions);

  // Liste görünümü için veriyi ters çevirip formatla (En yeni en üstte)
  const listTransactions = [...rawTransactions].reverse().map((t) => ({
    ...t,
    amount: Number(t.amount),
  }));
  const categories = await prisma.category.findMany({
    where: { userId: userId! },
    orderBy: { name: 'desc' },
    include: { _count: true },
  });

  return (
    <div className="x-container py-3">
      <div className="grid grid-cols-3 gap-3 py-3">
        {/* last process */}
        <Tabs defaultValue="last_transactions" className="h-full">
          <Card className="col-span-1 h-full">
            <CardHeader>
              <TabsList>
                <TabsTrigger value="last_transactions">Son Yapılan İşlemler</TabsTrigger>
                <TabsTrigger value="categories">Kategoriler</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="last_transactions">
                <div className="flex items-center justify-center w-full gap-3 pb-2 mb-2 ">
                  <AddNewTransaction categories={categories} />
                </div>
                {listTransactions.length === 0 ? (
                  <p className="text-center text-xs font-semibold py-3">Henüz kayıt yok</p>
                ) : (
                  <>
                    <ScrollArea className="h-[500px] p-2 ">
                      {listTransactions.map((transaction) => (
                        <ProcessCard key={transaction.id} transaction={transaction} />
                      ))}
                    </ScrollArea>
                  </>
                )}
              </TabsContent>
              <TabsContent value="categories">
                <div className="flex items-center justify-center w-full gap-3 pb-2 mb-2 ">
                  <AddCategory />
                </div>
                {categories.length === 0 ? (
                  <p className="text-center text-xs font-semibold py-3">Henüz kayıt yok</p>
                ) : (
                  <>
                    <ScrollArea className="h-[500px] p-2 ">
                      {categories.map((category) => (
                        <CategoryCard category={category} key={category.id} />
                      ))}
                    </ScrollArea>
                  </>
                )}
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-base">İstatiksel Veriler</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionCharts lineData={lineChartData} pieData={pieChartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinansPage;
