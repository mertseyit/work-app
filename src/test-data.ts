export const MOCK_PROCESSES: Transaction[] = [
  {
    id: '1',
    title: 'Yazılım Geliştirme Hizmeti',
    amount: 45000,
    date: '2025-05-10T10:00:00Z',
    category: 'Hizmet Bedeli',
    type: 'income',
    description: 'X firmasına yapılan web sitesi ödemesi.',
  },
  {
    id: '2',
    title: 'Ofis Kirası - Mayıs',
    amount: 12500,
    date: '2025-05-05T09:00:00Z',
    category: 'Sabit Gider',
    type: 'expense',
  },
  {
    id: '3',
    title: 'Amazon Web Services (AWS)',
    amount: 840,
    date: '2025-05-02T14:30:00Z',
    category: 'SaaS Abonelik',
    type: 'expense',
    description: 'Sunucu ve veritabanı maliyetleri.',
  },
  {
    id: '4',
    title: 'Freelance Logo Tasarımı',
    amount: 5000,
    date: '2025-05-01T16:45:00Z',
    category: 'Ek Gelir',
    type: 'income',
  },
  {
    id: '5',
    title: 'Starbucks Kahve',
    amount: 145,
    date: '2025-05-12T08:15:00Z',
    category: 'Mutfak/Gıda',
    type: 'expense',
  },
  {
    id: '6',
    title: 'Elektrik Faturası',
    amount: 1200,
    date: '2025-05-08T11:00:00Z',
    category: 'Faturalar',
    type: 'expense',
  },
];
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
