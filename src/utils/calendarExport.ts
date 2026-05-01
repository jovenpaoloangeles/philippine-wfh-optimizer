import { format } from 'date-fns';
import type { Holiday, OptimizedPlan, MultiMonthOptimizedPlan } from './types';

const formatDateForICS = (date: Date): string => {
  return format(date, 'yyyyMMdd') + 'T090000Z';
};

const escapeICS = (text: string): string => {
  return text.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
};

export const generateICS = (
  holidays: Holiday[],
  plan: OptimizedPlan | null,
  month: number,
  year: number
): string => {
  const monthName = format(new Date(year, month, 1), 'MMMM yyyy');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Philippine Holiday Optimizer//Holiday Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Philippine Holidays - ${monthName}`,
    `X-WR-CALDESC:Optimized schedule for ${monthName}`
  ];

  holidays.forEach(holiday => {
    icsContent.push(
      'BEGIN:VEVENT',
      `UID:holiday-${holiday.date.getTime()}@ph-holiday-optimizer`,
      `DTSTART:${formatDateForICS(holiday.date)}`,
      `DTEND:${formatDateForICS(holiday.date)}`,
      'SUMMARY:' + escapeICS(holiday.name),
      `DESCRIPTION:${holiday.isSpecial ? 'Special Non-working Holiday' : 'Regular Holiday'}`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      'END:VEVENT'
    );
  });

  if (plan && plan.leaveDates) {
    plan.leaveDates.forEach(date => {
      icsContent.push(
        'BEGIN:VEVENT',
        `UID:leave-${date.getTime()}@ph-holiday-optimizer`,
        `DTSTART:${formatDateForICS(date)}`,
        `DTEND:${formatDateForICS(date)}`,
        'SUMMARY:Leave Day',
        'DESCRIPTION:Recommended leave day for extended weekend',
        'STATUS:CONFIRMED',
        'TRANSP:TRANSPARENT',
        'END:VEVENT'
      );
    });
  }

  if (plan && plan.wfhDates) {
    plan.wfhDates.forEach(date => {
      icsContent.push(
        'BEGIN:VEVENT',
        `UID:wfh-${date.getTime()}@ph-holiday-optimizer`,
        `DTSTART:${formatDateForICS(date)}`,
        `DTEND:${formatDateForICS(date)}`,
        'SUMMARY:Work From Home',
        'DESCRIPTION:Recommended WFH day',
        'STATUS:CONFIRMED',
        'TRANSP:TRANSPARENT',
        'END:VEVENT'
      );
    });
  }

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
};

export const generateICSForPeriod = (
  holidays: Holiday[],
  plan: MultiMonthOptimizedPlan | null
): string => {
  const startDate = plan?.startDate ?? new Date();
  const endDate = plan?.endDate ?? new Date();
  const periodName = `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d yyyy')}`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Philippine Holiday Optimizer//Holiday Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Philippine Holidays - Optimized Plan`,
    `X-WR-CALDESC:Optimized schedule for ${periodName}`
  ];

  // Add holidays within the optimization period
  holidays.forEach(holiday => {
    if (plan && (holiday.date < plan.startDate || holiday.date > plan.endDate)) return;
    icsContent.push(
      'BEGIN:VEVENT',
      `UID:holiday-${holiday.date.getTime()}@ph-holiday-optimizer`,
      `DTSTART:${formatDateForICS(holiday.date)}`,
      `DTEND:${formatDateForICS(holiday.date)}`,
      'SUMMARY:' + escapeICS(holiday.name),
      `DESCRIPTION:${holiday.isSpecial ? 'Special Non-working Holiday' : 'Regular Holiday'}`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      'END:VEVENT'
    );
  });

  if (plan) {
    plan.leaveDates.forEach(date => {
      icsContent.push(
        'BEGIN:VEVENT',
        `UID:leave-${date.getTime()}@ph-holiday-optimizer`,
        `DTSTART:${formatDateForICS(date)}`,
        `DTEND:${formatDateForICS(date)}`,
        'SUMMARY:Leave Day',
        'DESCRIPTION:Recommended leave day for extended weekend',
        'STATUS:CONFIRMED',
        'TRANSP:TRANSPARENT',
        'END:VEVENT'
      );
    });

    plan.wfhDates.forEach(date => {
      icsContent.push(
        'BEGIN:VEVENT',
        `UID:wfh-${date.getTime()}@ph-holiday-optimizer`,
        `DTSTART:${formatDateForICS(date)}`,
        `DTEND:${formatDateForICS(date)}`,
        'SUMMARY:Work From Home',
        'DESCRIPTION:Recommended WFH day',
        'STATUS:CONFIRMED',
        'TRANSP:TRANSPARENT',
        'END:VEVENT'
      );
    });
  }

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
};

export const downloadICS = (icsContent: string, filename: string) => {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToCalendar = (
  holidays: Holiday[],
  plan: OptimizedPlan | null,
  month: number,
  year: number
) => {
  const icsContent = generateICS(holidays, plan, month, year);
  const monthName = format(new Date(year, month, 1), 'yyyy-MM');
  const filename = `philippine-holidays-${monthName}.ics`;
  downloadICS(icsContent, filename);
};

export const exportToCalendarForPeriod = (
  holidays: Holiday[],
  plan: MultiMonthOptimizedPlan | null
) => {
  const icsContent = generateICSForPeriod(holidays, plan);
  const filename = 'philippine-holidays-optimized-plan.ics';
  downloadICS(icsContent, filename);
};
