'use client';

import { Area, AreaChart, CartesianGrid, Pie, PieChart, XAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { MOCK_CATEGORY_DATA, MOCK_MONTHLY_FLOW_DATA } from '@/test-data';

const areaChartConfig = {
  income: {
    label: 'Gelir',
    color: 'var(--chart-2)', // Genelde yeşil tonu
  },
  expense: {
    label: 'Gider',
    color: 'var(--chart-1)', // Genelde kırmızı/koyu ton
  },
} satisfies ChartConfig;

const pieChartConfig = {
  amount: {
    label: 'Miktar',
  },
  // Kategoriler için dinamik renk ataması Shadcn Chart CSS değişkenlerinden gelir
} satisfies ChartConfig;

export function TransactionCharts() {
  return (
    <div>
      {/* Nakit Akış Grafiği */}
      <h3 className="text-sm font-medium mb-4 italic text-slate-500">Aylık Nakit Akışı</h3>
      <ChartContainer config={areaChartConfig} className="h-50 w-full">
        <AreaChart accessibilityLayer data={MOCK_MONTHLY_FLOW_DATA} margin={{ left: 0, right: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <Area
            dataKey="expense"
            type="linear"
            fill="var(--color-expense)"
            fillOpacity={0.1}
            stroke="var(--color-expense)"
            strokeWidth={2}
          />
          <Area
            dataKey="income"
            type="linear"
            fill="var(--color-income)"
            fillOpacity={0.4}
            stroke="var(--color-income)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>

      <h3 className="text-sm font-medium mb-2 italic text-slate-500">Gider Dağılımı</h3>
      <div className="flex items-center justify-start">
        <ChartContainer config={pieChartConfig} className="aspect-square max-w-75 w-full  max-h-75">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={MOCK_CATEGORY_DATA}
              dataKey="amount"
              nameKey="category"
              innerRadius={60} // Donut görünümü için
              strokeWidth={5}
            />
          </PieChart>
        </ChartContainer>
        <div className="grid grid-cols-2 gap-x-5 gap-y-3">
          <span className="text-green-500 font-semibold">Gelir:</span>{' '}
          <span className="text-green-500">1234 ₺</span>
          <span className="text-red-500 font-semibold">Gider:</span>{' '}
          <span className="text-red-500">1234 ₺</span>
          <span className="text-slate-500 font-semibold text-lg">Toplam:</span>{' '}
          <span className="text-lg">1234 ₺</span>
        </div>
      </div>
    </div>
  );
}
