import { startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, isSameDay } from 'date-fns';
import { Holiday } from './types';
import { isHoliday } from './holidayDetection';

/**
 * Calculate consecutive days off periods from an array of days
 * @param allDays - Array of all days to analyze
 * @param holidays - Array of holidays
 * @param leaveDates - Array of leave dates
 * @param wfhDates - Array of WFH dates
 * @returns Array of consecutive off periods with start, end, and length
 */
export const calculateConsecutiveDaysOff = (
  allDays: Date[],
  holidays: Holiday[],
  leaveDates: Date[], 
  wfhDates: Date[]
): { start: Date; end: Date; length: number }[] => {
  const periods: { start: Date; end: Date; length: number }[] = [];
  let currentStart: Date | null = null;
  let currentLength = 0;

  for (const date of allDays) {
    const isOff = isWeekend(date) || 
                 isHoliday(date, holidays) !== undefined ||
                 leaveDates.some(leave => isSameDay(leave, date)) ||
                 wfhDates.some(wfh => isSameDay(wfh, date));

    if (isOff) {
      if (currentStart === null) {
        currentStart = date;
        currentLength = 1;
      } else {
        currentLength++;
      }
    } else {
      if (currentStart !== null && currentLength > 0) {
        periods.push({
          start: currentStart,
          end: allDays[allDays.indexOf(date) - 1],
          length: currentLength
        });
        currentStart = null;
        currentLength = 0;
      }
    }
  }

  // Handle case where month ends with off days
  if (currentStart !== null && currentLength > 0) {
    periods.push({
      start: currentStart,
      end: allDays[allDays.length - 1],
      length: currentLength
    });
  }

  return periods;
};

/**
 * Calculate the longest consecutive days off in a month (legacy version)
 * @param month - Month index (0-11)
 * @param year - Year
 * @param leaveDates - Array of leave dates
 * @param wfhDates - Array of WFH dates
 * @param holidays - Array of holidays
 * @returns Number of consecutive days off
 */
export const calculateConsecutiveDaysOffLegacy = (
  month: number, 
  year: number, 
  leaveDates: Date[], 
  wfhDates: Date[], 
  holidays: Holiday[]
): number => {
  // Get all days in the month
  const startDate = startOfMonth(new Date(year, month, 1));
  const endDate = endOfMonth(startDate);
  const allDaysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Mark all days as working or non-working
  const daysOffMap = new Map<number, boolean>();
  
  allDaysInMonth.forEach(date => {
    const isOff = isWeekend(date) || 
                 isHoliday(date, holidays) !== undefined ||
                 leaveDates.some(leave => isSameDay(leave, date)) ||
                 wfhDates.some(wfh => isSameDay(wfh, date));
    
    daysOffMap.set(date.getTime(), isOff);
  });
  
  // Find longest streak
  let currentStreak = 0;
  let maxStreak = 0;
  
  for (const date of allDaysInMonth) {
    if (daysOffMap.get(date.getTime())) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return maxStreak;
};

/**
 * Calculate what the consecutive days would be if we add a WFH on a specific date
 * @param date - Date to add WFH
 * @param month - Month index (0-11)
 * @param year - Year
 * @param leaveDates - Array of leave dates
 * @param existingWfhDates - Array of existing WFH dates
 * @param holidays - Array of holidays
 * @returns Number of consecutive days off with the new WFH date
 */
export const calculatePotentialConsecutiveDaysOff = (
  date: Date,
  month: number,
  year: number,
  leaveDates: Date[],
  existingWfhDates: Date[],
  holidays: Holiday[]
): number => {
  // Get all days in the month
  const startDate = startOfMonth(new Date(year, month, 1));
  const endDate = endOfMonth(startDate);
  const allDaysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Create a temporary WFH list with the new candidate date
  const tempWfhDates = [...existingWfhDates, date];
  
  // Call the normal consecutive days calculator with this temporary list
  const periods = calculateConsecutiveDaysOff(allDaysInMonth, holidays, leaveDates, tempWfhDates);
  return periods.length > 0 ? Math.max(...periods.map(p => p.length)) : 0;
};

/**
 * Count weekends in a given month
 * @param month - Month index (0-11)
 * @param year - Year
 * @returns Number of weekend days in the month
 */
export const countWeekendsInMonth = (month: number, year: number): number => {
  const startDate = startOfMonth(new Date(year, month, 1));
  const endDate = endOfMonth(startDate);
  const allDaysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
  
  return allDaysInMonth.filter(date => isWeekend(date)).length;
};
