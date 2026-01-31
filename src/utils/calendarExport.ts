import { format } from 'date-fns';
import type { Holiday, OptimizedPlan } from './types';

/**
 * Convert a date to ICS format (YYYYMMDDTHHMMSSZ)
 * @param date The date to convert
 * @returns ICS formatted date string
 */
const formatDateForICS = (date: Date): string => {
  return format(date, 'yyyyMMdd') + 'T090000Z'; // Using 9:00 AM as default time
};

/**
 * Escape text for ICS format
 * @param text The text to escape
 * @returns Escaped text
 */
const escapeICS = (text: string): string => {
  return text.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
};

/**
 * Generate ICS calendar content for holidays and optimized schedule
 * @param holidays Array of holidays
 * @param plan Optimized plan with leave and WFH dates
 * @param month Month number (0-11)
 * @param year Year
 * @returns ICS calendar content as string
 */
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

  // Add holidays
  holidays.forEach(holiday => {
    icsContent.push(
      'BEGIN:VEVENT',
      `UID:holiday-${holiday.date.getTime()}@ph-holiday-optimizer`,
      `DTSTART:${formatDateForICS(holiday.date)}`,
      `DTEND:${formatDateForICS(holiday.date)}`,
      'SUMMARY:' + escapeICS(holiday.name),
      `DESCRIPTION:${holiday.isSpecial ? 'Special Non-working Holiday' : 'Regular Holiday'}`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT', // Show as free time
      'END:VEVENT'
    );
  });

  // Add leave dates if plan exists
  if (plan && plan.leaveDates) {
    plan.leaveDates.forEach((date, index) => {
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

  // Add WFH dates if plan exists
  if (plan && plan.wfhDates) {
    plan.wfhDates.forEach((date, index) => {
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

/**
 * Download ICS file
 * @param icsContent The ICS content to download
 * @param filename The filename for the download
 */
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

/**
 * Export calendar to ICS format and trigger download
 * @param holidays Array of holidays
 * @param plan Optimized plan
 * @param month Month number (0-11)
 * @param year Year
 */
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
