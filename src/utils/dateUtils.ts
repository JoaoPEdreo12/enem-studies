import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
// @ts-ignore
import { toZonedTime, format as formatTz } from 'date-fns-tz';

export const formatDate = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
};

export const formatTime = (time: string) => {
  return time.substring(0, 5);
};

export function getTodayInBrasilia() {
  if (typeof window === 'undefined') {
    // Se estiver rodando no Node (build), retorna UTC para evitar erro
    const now = new Date();
    return now.toISOString().split('T')[0];
  }
  // No browser, calcula corretamente para Brasília
  const timeZone = 'America/Sao_Paulo';
  const now = new Date();
  const brNow = toZonedTime(now, timeZone);
  return formatTz(brNow, 'yyyy-MM-dd', { timeZone });
}

export const getRelativeDate = (date: string) => {
  const today = getTodayInBrasilia();
  const [y1, m1, d1] = today.split('-').map(Number);
  const [y2, m2, d2] = date.split('-').map(Number);
  const dt1 = new Date(y1, m1 - 1, d1);
  const dt2 = new Date(y2, m2 - 1, d2);
  const diff = Math.floor((dt2.getTime() - dt1.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return 'Hoje';
  if (diff === -1) return 'Ontem';
  if (diff === 1) return 'Amanhã';
  return formatDate(date);
};

export const getWeekDays = () => {
  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 0 });
  const end = endOfWeek(today, { weekStartsOn: 0 });
  
  return eachDayOfInterval({ start, end }).map(date => ({
    date,
    dayName: format(date, 'EEE', { locale: ptBR }),
    dayNumber: format(date, 'dd'),
    isToday: isToday(date)
  }));
};

export const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}; 