'use client';

import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, Pie, PieChart, Cell, XAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

// Props yapısını işlenmiş verilere göre güncelledik
interface TransactionChartsProps {
  lineData: { date: string; income: number; expense: number }[];
  pieData: { category: string; amount: number; fill: string }[];
}

const areaChartConfig = {
  income: {
    label: 'Gelir',
    color: '#10b981', // Emerald 500
  },
  expense: {
    label: 'Gider',
    color: '#ef4444', // Red 500
  },
} satisfies ChartConfig;

export function TransactionCharts({ lineData, pieData }: TransactionChartsProps) {
  // 1. Özet İstatistikleri Hesapla
  const stats = useMemo(() => {
    const totalIncome = lineData.reduce((acc, curr) => acc + curr.income, 0);
    const totalExpense = lineData.reduce((acc, curr) => acc + curr.expense, 0);
    const balance = totalIncome - totalExpense;
    return { totalIncome, totalExpense, balance };
  }, [lineData]);

  // 2. Pie Chart için Config (Tooltip renkleri için)
  const pieChartConfig = useMemo(() => {
    const config: ChartConfig = {
      amount: { label: 'Miktar' },
    };
    pieData.forEach((item) => {
      config[item.category] = {
        label: item.category,
        color: item.fill,
      };
    });
    return config;
  }, [pieData]);

  return (
    <div className="flex flex-col gap-6">
      {/* --- BÖLÜM 1: AYLIK NAKİT AKIŞI (AREA CHART) --- */}
      <div>
        <h3 className="text-sm font-medium mb-4 italic text-slate-500">Aylık Nakit Akışı</h3>
        <ChartContainer config={areaChartConfig} className="h-[200px] w-full">
          <AreaChart
            accessibilityLayer
            data={lineData}
            margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={30}
            />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="income"
              type="monotone"
              fill="url(#fillIncome)"
              fillOpacity={0.4}
              stroke="var(--color-income)"
              strokeWidth={2}
              stackId="1"
            />
            <Area
              dataKey="expense"
              type="monotone"
              fill="url(#fillExpense)"
              fillOpacity={0.4}
              stroke="var(--color-expense)"
              strokeWidth={2}
              stackId="2"
            />
          </AreaChart>
        </ChartContainer>
      </div>

      {/* --- BÖLÜM 2: GİDER DAĞILIMI VE ÖZET (PIE CHART) --- */}
      <div>
        <h3 className="text-sm font-medium mb-2 italic text-slate-500">Gider Dağılımı & Özet</h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Pie Chart Alanı */}
          <div className="flex-1 w-full max-w-[200px]">
            <ChartContainer config={pieChartConfig} className="aspect-square w-full">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={pieData}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={50} // Donut kalınlığı
                  strokeWidth={4}
                  paddingAngle={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>

          {/* Özet İstatistik Alanı */}
          <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-4 text-sm w-full">
            <div className="flex flex-col">
              <span className="text-emerald-600 font-semibold mb-1">Toplam Gelir</span>
              <span className="text-emerald-600 text-lg font-bold">
                +{stats.totalIncome.toLocaleString('tr-TR')} ₺
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-red-500 font-semibold mb-1">Toplam Gider</span>
              <span className="text-red-500 text-lg font-bold">
                -{stats.totalExpense.toLocaleString('tr-TR')} ₺
              </span>
            </div>

            <div className="col-span-2 border-t pt-3 mt-1 flex flex-col">
              <span className="text-slate-500 font-medium mb-1">Net Bakiye</span>
              <span
                className={`text-2xl font-black ${
                  stats.balance >= 0 ? 'text-slate-800' : 'text-red-600'
                }`}
              >
                {stats.balance.toLocaleString('tr-TR')} ₺
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
