const formatPaymentStatus = (paymentStatus: PaymentStatus) => {
  switch (paymentStatus) {
    case 'PAID':
      return {
        label: 'Ödendi',
        className: `
      bg-emerald-100 text-emerald-700 border border-emerald-200
      dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800
    `,
        iconColor: '#34d399', // emerald-400 (dark için daha yumuşak)
      };

    case 'PARTIAL':
      return {
        label: 'Kısmi Ödeme',
        className: `
      bg-amber-100 text-amber-700 border border-amber-200
      dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800
    `,
        iconColor: '#fbbf24', // amber-400
      };

    case 'UNPAID':
      return {
        label: 'Ödeme Bekliyor',
        className: `
      bg-red-100 text-red-700 border border-red-200
      dark:bg-red-900/30 dark:text-red-300 dark:border-red-800
    `,
        iconColor: '#f87171', // red-400
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

export default formatPaymentStatus;
