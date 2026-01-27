// src/types.d.ts
declare global {
  type TransactionType = 'INCOME' | 'EXPENSE';
  type RecurrenceType = 'DAILY' | 'WEEKDAYS' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
  type ProjectStatus =
    | 'WAITING'
    | 'IN_PROGRESS' // devam ediyor anlamında değil, çalışılıyor anlamında kullanılıyor.
    | 'COMPLETED'
    | 'CANCELLED'
    | 'PAUSED'
    | 'REVISION_REQUEST';
  type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';
  type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

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

  // --- CLIENT (MÜŞTERİ) ---
  interface Client {
    id: string;
    name: string;
    description?: string | null;
    logo?: string | null;
    userId: string;

    // İlişkiler
    projects?: Project[];

    createdAt: Date;
    updatedAt: Date;
  }

  // --- PROJECT (PROJE) ---
  interface Project {
    id: string;
    name: string;
    description?: string | null;

    startDate: Date;
    endDate?: Date | null;

    status: ProjectStatus;
    paymentStatus: PaymentStatus;

    // Prisma Decimal -> JS number dönüşümü yapılmalı
    price: number;
    paidAmount: number;

    techStack: string[];
    category?: string | null;
    // Foreign Keys
    clientId: string;
    userId: string;
    // İlişkiler (Opsiyonel)
    client?: Client;
    revisions?: Revision[];
    tasks?: Task[];
    notes?: Note[];
    _count?: {
      tasks: number;
      revisions: number;
    };

    createdAt: Date;
    updatedAt: Date;
  }

  // --- REVISION (REVİZE) ---
  interface Revision {
    id: string;
    title: string;
    description?: string | null;

    projectId: string;

    createdAt: Date;
    updatedAt: Date;
  }

  // --- TASK (GÖREV - KANBAN) ---
  interface Task {
    id: string;
    title: string;
    order: number;
    status: TaskStatus; // Boolean yerine Enum

    projectId: string;

    createdAt: Date;
    updatedAt: Date;
  }

  interface Note {
    id: string;
    title: string;
    isImportant: boolean;
    isCompleted: boolean;

    // Hatırlatıcı
    remindAt: Date | null;

    // Son tarih (Due Date) - YENİ
    dueDate: Date | null;

    // Tekrarlama
    recurrenceType: RecurrenceType | null;
    recurrenceInterval: number | null;

    // İlişkiler
    listId: string | null;
    list?: NoteList;

    userId: string;

    projectId: string | null;
    project?: Project;

    // Zaman damgaları
    createdAt: Date;
    updatedAt: Date;
  }

  interface NoteList {
    id: string;
    title: string;
    description: string | null;
    color: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    _count?: {
      notes: number;
    };
    notes?: Note[];
  }
}

// Bu dosyanın bir modül olarak algılanması için boş bir export ekliyoruz
export {};
