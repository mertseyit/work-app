export const getDeadlineStatus = (date: Date | string | null | undefined) => {
  // 1. Tarih yoksa boş dön
  if (!date) {
    return {
      label: 'Tarih Belirsiz',
      className: 'bg-slate-100 text-slate-500 border-slate-200',
    };
  }

  // 2. Tarihleri nesneye çevir ve saatleri sıfırla (Sadece gün kıyaslaması için)
  const targetDate = new Date(date);
  const today = new Date();

  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  // 3. Aradaki farkı milisaniye cinsinden hesapla
  const diffTime = targetDate.getTime() - today.getTime();
  // Milisaniyeyi güne çevir (1000ms * 60sn * 60dk * 24sa)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // --- DURUM KONTROLLERİ ---

  // A) Tarih Geçmişse (Kırmızı)
  if (diffDays < 0) {
    return {
      label: `${Math.abs(diffDays)} gün gecikti`,
      className: `
      bg-red-100 text-red-700 border-red-200 border
      dark:bg-red-900/30 dark:text-red-300 dark:border-red-800
    `,
    };
  }

  // B) Bugünse (Turuncu)
  if (diffDays === 0) {
    return {
      label: 'Teslim Tarihi Bugün',
      className: `
      bg-orange-100 text-orange-700 border-orange-200 border
      dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800
    `,
    };
  }

  // C) 10 Günden Az Kaldıysa (Turuncu - Uyarı)
  if (diffDays <= 10) {
    return {
      label: `${diffDays} gün kaldı`,
      className: `
      bg-orange-100 text-orange-700 border-orange-200 border
      dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800
    `,
    };
  }

  // D) 10 Günden Fazla Varsa (Yeşil - Güvenli)
  return {
    label: `${diffDays} gün kaldı`,
    className: `
    bg-emerald-100 text-emerald-700 border-emerald-200 border
    dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800
  `,
  };
};
