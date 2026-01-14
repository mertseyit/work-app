import { z } from 'zod';

//finansal işlem kategori
export const CreateCategorySchema = z.object({
  name: z.string().min(2, { message: 'Kategori adı en az 2 karakter olmalı.' }),
  type: z.enum(['INCOME', 'EXPENSE'], {
    error: 'Tür Gelir veya Gider olmalı',
  }),
});

//finansal işlem
export const CreateTransactionSchema = z.object({
  title: z.string().min(2, { message: 'Başlık en az 2 karakter olmalı.' }),
  amount: z.coerce.number().positive({ message: "Miktar 0'dan büyük olmalı." }),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.string().min(1, { message: 'Lütfen bir kategori seçin.' }),
  date: z.coerce.date({ error: 'Tarih seçimi zorunludur' }),
});

export type CreateCategorySchemaType = z.infer<typeof CreateCategorySchema>;
export type CreateTransactionSchemaType = z.infer<typeof CreateTransactionSchema>;
