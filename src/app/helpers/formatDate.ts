/**
 * ISO tarih formatını GG/AA/YY SS:DD:SS formatına çevirir.
 * @param isoDate - "2025-05-10T14:30:00Z"
 * @returns - "10/05/25 14:30:00"
 */
export const formatDate = (isoDate: Date): string => {
  const date = new Date(isoDate);

  // Gün, ay, yıl kısımlarını al
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);

  // Saat, dakika, saniye kısımlarını al
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};
