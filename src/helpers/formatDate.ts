/**
 * ISO tarih formatını GG/AA/YY SS:DD:SS formatına çevirir.
 * @param isoDate - "2025-05-10T14:30:00Z"
 * @returns - "10/05/25 14:30:00"
 */
type FormatDateExlude = 'hours' | 'date';

type FormatDate = (isoDate: string | Date | null | undefined, exclude?: FormatDateExlude) => string;

export const formatDate: FormatDate = (isoDate, exlude) => {
  const date = new Date(isoDate!);

  // Gün, ay, yıl kısımlarını al
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-4);

  // Saat, dakika, saniye kısımlarını al
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  //eğer harici isteniyorsa
  if (exlude === 'date') {
    return `${hours}:${minutes}:${seconds}`;
  } else if (exlude === 'hours') {
    return `${day}/${month}/${year}`;
  }

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};
