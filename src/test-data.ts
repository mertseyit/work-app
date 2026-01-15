// src/lib/mock-data.ts

// İlişkilerin çalışması için sabit bir User ID
const MOCK_USER_ID = 'user_2bS...';

// 1. MÜŞTERİLER (CLIENTS)
export const CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'TechStart A.Ş.',
    description: 'Kurumsal teknoloji çözümleri üreten bir firma.',
    logo: null,
    userId: MOCK_USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'client-2',
    name: 'Ahmet Yılmaz',
    description: 'Freelance E-Ticaret girişimcisi.',
    logo: null,
    userId: MOCK_USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'client-3',
    name: 'Global Lojistik',
    description: 'Uluslararası taşımacılık firması.',
    logo: null,
    userId: MOCK_USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// 2. PROJELER (PROJECTS)
export const PROJECTS: Project[] = [
  {
    id: 'project-1',
    name: 'TechStart Kurumsal Web Sitesi',
    description: 'Next.js ve Tailwind kullanılarak yapılan kurumsal web sitesi yenileme projesi.',
    startDate: new Date('2024-01-10'),
    endDate: new Date('2024-02-15'),
    status: 'IN_PROGRESS',
    paymentStatus: 'PARTIAL',
    price: 25000,
    techStack: ['Next.js', 'Tailwind CSS', 'Framer Motion'],
    category: 'Web Sitesi',
    meetCount: 3,
    clientId: 'client-1',
    userId: MOCK_USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'project-2',
    name: 'Organik Pazar E-Ticaret',
    description: 'Özel tasarım e-ticaret paneli ve ödeme sistemi entegrasyonu.',
    startDate: new Date('2023-12-01'),
    endDate: new Date('2024-01-01'),
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    price: 45000,
    techStack: ['Node.js', 'PostgreSQL', 'React', 'Stripe'],
    category: 'E-Ticaret',
    meetCount: 12,
    clientId: 'client-2',
    userId: MOCK_USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'project-3',
    name: 'Lojistik Takip Paneli',
    description: 'Araçların canlı konumlarını gösteren harita tabanlı dashboard.',
    startDate: new Date('2024-02-01'),
    endDate: null, // Henüz belli değil
    status: 'WAITING',
    paymentStatus: 'UNPAID',
    price: 60000,
    techStack: ['React', 'Leaflet', 'Socket.io'],
    category: 'Dashboard',
    meetCount: 0,
    clientId: 'client-3',
    userId: MOCK_USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'project-4',
    name: 'Mobil Uygulama Arayüzü',
    description: 'Figma üzerinden UI/UX tasarımı.',
    startDate: new Date('2024-01-20'),
    endDate: new Date('2024-02-01'),
    status: 'REVISION_REQUEST',
    paymentStatus: 'PARTIAL',
    price: 15000,
    techStack: ['Figma', 'Adobe XD'],
    category: 'UI Design',
    meetCount: 2,
    clientId: 'client-1',
    userId: MOCK_USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// 3. GÖREVLER (TASKS)
export const TASKS: Task[] = [
  // Project 1 Görevleri
  {
    id: 'task-1',
    title: 'Anasayfa tasarımının kodlanması',
    order: 0,
    status: 'DONE',
    projectId: 'project-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'task-2',
    title: 'İletişim formu validasyonları',
    order: 1,
    status: 'IN_PROGRESS',
    projectId: 'project-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'task-3',
    title: 'SEO optimizasyonu',
    order: 2,
    status: 'TODO',
    projectId: 'project-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Project 2 Görevleri
  {
    id: 'task-4',
    title: 'Veritabanı şemasının oluşturulması',
    order: 0,
    status: 'DONE',
    projectId: 'project-2',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'task-5',
    title: 'Admin paneli giriş ekranı',
    order: 1,
    status: 'DONE',
    projectId: 'project-2',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Project 3 Görevleri
  {
    id: 'task-6',
    title: 'Müşteri ile gereksinim analizi toplantısı',
    order: 0,
    status: 'TODO',
    projectId: 'project-3',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// 4. REVİZELER (REVISIONS)
export const REVISIONS: Revision[] = [
  {
    id: 'rev-1',
    title: 'Mobil menü açılma sorunu',
    description: 'iPhone cihazlarda menü butonu bazen algılamıyor, büyütülmesi lazım.',
    projectId: 'project-4',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'rev-2',
    title: 'Renk paleti değişikliği',
    description: 'Müşteri mavinin daha koyu bir tonunu istiyor (#0055FF).',
    projectId: 'project-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
