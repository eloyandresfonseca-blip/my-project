/**
 * Utilidades de formateo para finanzas personales en Colombia
 */

export const formatCOP = (amount: number, includeCurrency = true): string => {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(rounded);

  // Formato estándar legible $ 1.997.680
  return includeCurrency ? formatted : formatted.replace('COP', '').trim();
};

export const formatShortCOP = (amount: number): string => {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}k`;
  }
  return `$${amount}`;
};

export const calculateNetSalary = (
  baseSalary: number,
  transportAllowance: number,
  deductionRate = 0.08
): number => {
  const deductions = baseSalary * deductionRate; // 4% salud + 4% pension
  return baseSalary + transportAllowance - deductions;
};

export const getCurrentWeekOfMonth = (date: Date = new Date()): number => {
  const day = date.getDate();
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  return 4;
};

export const formatDateDisplay = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const today = new Date();
    
    const isSameDay = 
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isSameDay) {
      return `Hoy, ${date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
    }

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = 
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return `Ayer, ${date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return dateString;
  }
};
