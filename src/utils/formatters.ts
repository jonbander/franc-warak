export const formatCurrency = (amount: number, symbol: string = '$'): string => {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} ${symbol}`;
};

export const formatNumber = (num: number, maximumFractionDigits: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(num);
};

export const formatDateArabic = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      return `${year}/${month}/${day}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};
