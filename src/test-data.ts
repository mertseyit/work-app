// Aylık Nakit Akışı (Area Chart için)
export const MOCK_MONTHLY_FLOW_DATA = [
  { month: 'Ocak', income: 45000, expense: 32000 },
  { month: 'Şubat', income: 42000, expense: 35000 },
  { month: 'Mart', income: 52000, expense: 41000 },
  { month: 'Nisan', income: 48000, expense: 49000 }, // Zarar edilen ay
  { month: 'Mayıs', income: 61000, expense: 38000 },
  { month: 'Haziran', income: 55000, expense: 42000 },
];

// Kategori Dağılımı (Pie Chart için)
export const MOCK_CATEGORY_DATA = [
  { category: 'Kira', amount: 15000, fill: 'var(--chart-1)' },
  { category: 'Mutfak', amount: 8000, fill: 'var(--chart-2)' },
  { category: 'Yazılım', amount: 5000, fill: 'var(--chart-3)' },
  { category: 'Eğlence', amount: 3500, fill: 'var(--chart-4)' },
  { category: 'Diğer', amount: 2500, fill: 'var(--chart-5)' },
];
