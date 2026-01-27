import { z } from 'zod';

//zod enum yapıları:
const ProjectStatusEnum = z.enum([
  'WAITING',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'PAUSED',
  'REVISION_REQUEST',
]);
const PaymentStatusEnum = z.enum(['UNPAID', 'PARTIAL', 'PAID']);
export const RecurrenceTypeEnum = z.enum([
  'DAILY',
  'WEEKDAYS',
  'WEEKLY',
  'MONTHLY',
  'YEARLY',
  'CUSTOM',
]);

//finansal işlem kategori
export const CreateCategorySchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Kategori adı en az 2 karakter olmalı.' })
    .max(50, { message: 'Kategori adı en fazla 50 karakter olabilir.' }),
  type: z.enum(['INCOME', 'EXPENSE'], {
    error: 'Tür Gelir veya Gider olmalı',
  }),
});

//finansal işlem
export const CreateTransactionSchema = z.object({
  title: z
    .string()
    .min(2, { message: 'Başlık en az 2 karakter olmalı.' })
    .max(100, { message: 'Başlık en fazla 100 karakter olabilir.' }),
  amount: z.coerce.number().positive({ message: "Miktar 0'dan büyük olmalı." }),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.string().min(1, { message: 'Lütfen bir kategori seçin.' }),
  date: z.coerce.date({ error: 'Tarih seçimi zorunludur' }),
  description: z
    .string()
    .max(500, { message: 'Açıklama en fazla 500 karakter olabilir.' })
    .optional(),
});

//müşteri ekleme (client)
export const CreateClientSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Başlık en az 2 karakter olmalı.' })
    .max(100, { message: 'İsim en fazla 100 karakter olabilir.' }),
  description: z
    .string()
    .min(2, { message: 'Açıklama en az 2 karekter olmalı' })
    .max(1000, { message: 'Açıklama en fazla 1000 karakter olabilir.' }),
  //logo field assigned default value as 'null'
});

//müşteri çalışması/projesi/işi (projects)

export const CreateClientProjectSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'Proje adı en az 2 karakter olmalı.' })
      .max(150, { message: 'Proje adı en fazla 150 karakter olabilir.' }),

    description: z
      .string()
      .max(2000, { message: 'Açıklama en fazla 2000 karakter olabilir.' })
      .optional(),

    startDate: z.date({
      error: 'Geçersiz tarih formatı',
    }),

    endDate: z.date({
      error: 'Geçersiz tarih formatı',
    }),

    // --- Durumlar ---
    status: ProjectStatusEnum,
    paymentStatus: PaymentStatusEnum,
    price: z
      .number({
        error: 'Fiyat geçerli bir değer olmak zorunda',
      })
      .min(0, { message: "Fiyat 0'dan küçük olamaz." }),
    paidAmount: z.number().min(0, { error: "Fiyat 0'dan küçük olamaz." }),
    techStack: z
      .array(z.string().max(50, { message: 'Her teknoloji adı en fazla 50 karakter olabilir.' }))
      .optional(),

    /* NOT: Eğer input'tan "Next.js, React" gibi tek bir string geliyorsa üsttekini silip bunu aç:
   techStack: z.string().transform((val) => val.split(',').map((t) => t.trim())),
  */
    category: z
      .string()
      .max(50, { message: 'Kategori en fazla 50 karakter olabilir.' })
      .default('Genel')
      .optional(),
    clientId: z.string().min(1, { message: 'Müşteri seçimi zorunludur.' }),
  })
  .strict();

export const CreateTaskSchema = z.object({
  title: z
    .string()
    .min(2, { message: 'Başlık en az 2 karakter olmalı.' })
    .max(200, { message: 'Başlık en fazla 200 karakter olabilir.' }),
});

export const CreateListSchema = z.object({
  title: z
    .string()
    .min(2, { message: 'Liste adı en az 2 karakter olmalı.' })
    .max(50, { message: 'Liste adı en fazla 50 karakter olabilir.' }),
  description: z
    .string()
    .min(2, { error: 'Açıklama en az 2 karakter olmalı' })
    .max(300, { error: 'Açıklama en fazla 300 karakter olabilir.' })
    .optional(),
  color: z.string().optional(),
});

export const CreateNoteSchema = z
  .object({
    title: z
      .string()
      .min(2, { message: 'Not en az 2 karakter olmalı.' })
      .max(400, { message: 'Not en fazla 400 karakter olabilir.' }),

    // Boolean alanlar - zorunlu (default yok, form'da set edilecek)
    isImportant: z.boolean(),
    isCompleted: z.boolean(),

    // Hatırlatıcı - belirli bir tarih/saat
    remindAt: z.date().nullable().optional(),

    // Son tarih (Due Date)
    dueDate: z.date().nullable().optional(),

    // Tekrarlama ayarları
    recurrenceType: RecurrenceTypeEnum.nullable().optional(),
    recurrenceInterval: z
      .number()
      .int()
      .min(1, { message: 'Tekrar aralığı en az 1 olmalı.' })
      .max(365, { message: 'Tekrar aralığı en fazla 365 olabilir.' })
      .nullable()
      .optional(),

    // İlişkiler - uuid validasyonu kaldırıldı (Prisma zaten kontrol ediyor)
    listId: z.string().nullable().optional(),
    projectId: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      // Eğer recurrenceType CUSTOM ise, recurrenceInterval zorunlu
      if (data.recurrenceType === 'CUSTOM') {
        return data.recurrenceInterval !== null && data.recurrenceInterval !== undefined;
      }
      return true;
    },
    {
      message: 'Özel tekrarlama seçildiğinde tekrar aralığı zorunludur.',
      path: ['recurrenceInterval'],
    },
  );
export const UpdateNoteSchema = CreateNoteSchema.extend({
  id: z.string(),
});

export type CreateCategorySchemaType = z.infer<typeof CreateCategorySchema>;
export type CreateTransactionSchemaType = z.infer<typeof CreateTransactionSchema>;
export type CreateClientSchemaType = z.infer<typeof CreateClientSchema>;
export type CreateClientProjectSchemaType = z.infer<typeof CreateClientProjectSchema>;
export type CreateTaskSchemaType = z.infer<typeof CreateTaskSchema>;
export type CreateListSchemaType = z.infer<typeof CreateListSchema>;
export type CreateNoteSchemaType = z.infer<typeof CreateNoteSchema>;
export type UpdateNoteSchemaType = z.infer<typeof UpdateNoteSchema>;
