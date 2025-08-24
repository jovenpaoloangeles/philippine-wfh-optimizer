import { isSameDay, addDays, isFriday, isMonday } from 'date-fns';
import { Holiday } from './types';

/**
 * Check if a given date is a holiday
 * @param date - Date to check
 * @param holidays - Array of holidays to check against
 * @returns Holiday object if date is a holiday, undefined otherwise
 */
export const isHoliday = (date: Date, holidays: Holiday[]): Holiday | undefined => {
  return holidays.find(holiday => isSameDay(holiday.date, date));
};

/**
 * Check if a date creates a "bridge" opportunity (e.g., Thursday before a Friday holiday)
 * @param date - Date to check
 * @param holidays - Array of holidays to check against
 * @returns True if the date creates a bridge opportunity
 */
export const isBridgeOpportunity = (date: Date, holidays: Holiday[]): boolean => {
  if (isFriday(date)) {
    // Friday - check if Monday is a holiday
    const monday = addDays(date, 3);
    return holidays.some(h => isSameDay(h.date, monday)) || isHoliday(monday, holidays) !== undefined;
  } else if (isMonday(date)) {
    // Monday - check if Friday is a holiday
    const friday = addDays(date, -3);
    return holidays.some(h => isSameDay(h.date, friday)) || isHoliday(friday, holidays) !== undefined;
  }
  return false;
};
