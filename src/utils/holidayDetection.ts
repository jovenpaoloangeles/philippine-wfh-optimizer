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
    const monday = addDays(date, 3);
    return isHoliday(monday, holidays) !== undefined;
  } else if (isMonday(date)) {
    const friday = addDays(date, -3);
    return isHoliday(friday, holidays) !== undefined;
  }
  return false;
};
