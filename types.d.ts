// src/types.d.ts

import { TransactionType as PrismaTransactionType } from '@prisma/client';

declare global {
  type TransactionType = 'INCOME' | 'EXPENSE';

  interface User {
    id: string; // Clerk ID (user_2bS...)
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    imageUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }

  interface Category {
    id: string;
    name: string;
    type: TransactionType;
    userId: string;

    // İlişkisel veriler (Opsiyonel: her zaman çekmeyebiliriz)
    transactions?: Transaction[];
    _count?: {
      transactions: number;
    };

    createdAt: Date;
    updatedAt: Date;
  }

  // 4. Transaction (İşlem/Harcama)
  // ----------------------------------------------------------------------
  interface Transaction {
    id: string;
    title: string;

    // ÖNEMLİ: Prisma'da 'Decimal' olan bu alanı UI'da rahat matematik yapmak
    // ve grafik çizdirmek için 'number' olarak tanımlıyoruz.
    // (Veriyi çekerken .toNumber() yapmayı unutmamalısın)
    amount: number;

    type: TransactionType;
    date: Date;
    description?: string | null;

    // Foreign Keys
    categoryId: string;
    userId: string;

    // İlişkisel Veriler (Join yapıldığında dolu gelir)
    category?: Category;

    createdAt: Date;
    updatedAt: Date;
  }

  interface MonthlyStat {
    month: string; // "Ocak", "Şubat" vb.
    income: number; // Toplam gelir
    expense: number; // Toplam gider
  }

  interface CategoryStat {
    categoryName: string;
    amount: number;
    color?: string; // Grafik rengi için
  }
}

// Bu dosyanın bir modül olarak algılanması için boş bir export ekliyoruz
export {};
