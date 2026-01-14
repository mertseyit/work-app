/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/chart-utils.ts
import { Transaction } from '@prisma/client'; // Prisma tipleri
const CHART_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
];
// Line Chart için veriyi tarihe göre gruplama
export const getMonthlyChartData = (transactions: any[]) => {
  const groupedData: Record<string, { date: string; income: number; expense: number }> = {};

  transactions.forEach((t) => {
    // Tarihi "GG/AA" veya "Ay" formatına çevir
    // Örnek: '2025-01-15' -> '15 Jan' veya 'Jan'
    const dateKey = new Date(t.date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
    });

    if (!groupedData[dateKey]) {
      groupedData[dateKey] = { date: dateKey, income: 0, expense: 0 };
    }

    const amount = Number(t.amount); // Decimal'i number'a çevir

    if (t.type === 'INCOME') {
      groupedData[dateKey].income += amount;
    } else {
      groupedData[dateKey].expense += amount;
    }
  });

  return Object.values(groupedData);
};

// Pie Chart için veriyi kategoriye göre gruplama
export const getCategoryPieData = (transactions: any[]) => {
  const groupedData: Record<string, { category: string; amount: number; fill: string }> = {};

  // Sadece Giderleri (EXPENSE) analiz edelim
  const expenseTransactions = transactions.filter((t) => t.type === 'EXPENSE');

  // Önce tüm benzersiz kategorileri bulalım ki renkleri sırayla atayabilelim
  const uniqueCategories = Array.from(
    new Set(expenseTransactions.map((t) => t.category?.name || 'Diğer')),
  );

  expenseTransactions.forEach((t) => {
    const catName = t.category?.name || 'Diğer';

    if (!groupedData[catName]) {
      // Kategorinin index'ine göre renk paletinden renk seç
      const colorIndex = uniqueCategories.indexOf(catName) % CHART_COLORS.length;

      groupedData[catName] = {
        category: catName,
        amount: 0,
        // Renk değişkenini buraya atıyoruz
        fill: CHART_COLORS[colorIndex],
      };
    }

    groupedData[catName].amount += Number(t.amount);
  });

  // En çok harcanan en başta olacak şekilde sırala
  return Object.values(groupedData).sort((a, b) => b.amount - a.amount);
};
