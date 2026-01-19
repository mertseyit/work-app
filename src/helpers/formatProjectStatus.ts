const formatProjectStatus = (status: ProjectStatus) => {
  switch (status) {
    case 'WAITING':
      return {
        label: 'Beklemede',
        className: `
          bg-slate-100 text-slate-700 border border-slate-200
          dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700
        `,
        iconColor: '#94a3b8', // slate-400
      };

    case 'IN_PROGRESS':
      return {
        label: 'Çalışılıyor',
        className: `
          bg-blue-100 text-blue-700 border border-blue-200
          dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800
        `,
        iconColor: '#60a5fa', // blue-400
      };

    case 'COMPLETED':
      return {
        label: 'Tamamlandı',
        className: `
          bg-emerald-100 text-emerald-700 border border-emerald-200
          dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800
        `,
        iconColor: '#34d399', // emerald-400
      };

    case 'CANCELLED':
      return {
        label: 'İptal Edildi',
        className: `
          bg-red-100 text-red-700 border border-red-200
          dark:bg-red-900/30 dark:text-red-300 dark:border-red-800
        `,
        iconColor: '#f87171', // red-400
      };

    case 'PAUSED':
      return {
        label: 'Durduruldu',
        className: `
          bg-amber-100 text-amber-700 border border-amber-200
          dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800
        `,
        iconColor: '#fbbf24', // amber-400
      };

    case 'REVISION_REQUEST':
      return {
        label: 'Revize Bekleniyor',
        className: `
          bg-purple-100 text-purple-700 border border-purple-200
          dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800
        `,
        iconColor: '#c084fc', // purple-400
      };

    default:
      return {
        label: 'Bilinmiyor',
        className: `
          bg-slate-100 text-slate-700 border border-slate-200
          dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700
        `,
        iconColor: '#94a3b8', // slate-400
      };
  }
};

export default formatProjectStatus;
