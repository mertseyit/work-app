type TransactionType = 'income' | 'expense'; // Gelir mi Gider mi?

interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string; // ISO string formatında tutmak sıralama için en iyisidir
  category: string;
  type: TransactionType;
  description?: string; // Opsiyonel detay açıklaması
}
