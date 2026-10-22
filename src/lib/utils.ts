import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUSD(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '$0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatDateTime(d: string | Date | null | undefined): string {
  if (!d) return '—';
  return new Intl.DateTimeFormat('es-SV', {
    timeZone: 'America/El_Salvador',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(d));
}

export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return '—';
  return new Intl.DateTimeFormat('es-SV', {
    timeZone: 'America/El_Salvador',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(d));
}
