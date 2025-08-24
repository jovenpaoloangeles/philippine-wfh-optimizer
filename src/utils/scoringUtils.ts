import { addDays, isWeekend, isFriday, isMonday, getDay } from 'date-fns';
import { Holiday } from './types';
import { isHoliday, isBridgeOpportunity } from './holidayDetection';

/**
 * Score a date for leave potential based on surrounding holidays and weekends
 * @param date - The date to score
 * @param holidays - Array of holidays to consider
 * @returns Numerical score (higher is better for taking leave)
 */
export const scoreDateForLeave = (date: Date, holidays: Holiday[]): number => {
  let score = 0;

  // Skip weekends and holidays (we don't need to take leave on these days)
  if (isWeekend(date) || isHoliday(date, holidays)) {
    return -1;
  }

  const prevDay = addDays(date, -1);
  const nextDay = addDays(date, 1);
  const prevIsOff = isWeekend(prevDay) || isHoliday(prevDay, holidays) !== undefined;
  const nextIsOff = isWeekend(nextDay) || isHoliday(nextDay, holidays) !== undefined;

  // High score for creating continuous rest periods
  if (prevIsOff && nextIsOff) {
    score += 20; // Sandwiched between off days - excellent choice
  } else if (prevIsOff || nextIsOff) {
    score += 15; // Adjacent to an off day - good choice
  }

  // Bridge opportunities (e.g., Thursday before a Friday holiday)
  if (isBridgeOpportunity(date, holidays)) {
    score += 12;
  }

  // Mondays and Fridays are generally better for extending weekends
  if (isMonday(date) || isFriday(date)) {
    score += 8;
  }

  // If continuous rest is not possible (no adjacent off days), prioritize Thu/Fri over Mon/Tue
  if (!prevIsOff && !nextIsOff) {
    const day = date.getDay(); // 0 Sun, 1 Mon, ... 6 Sat
    if (day === 4 || day === 5) score += 2; // Thu/Fri slight boost
    if (day === 1 || day === 2) score -= 2; // Mon/Tue slight penalty
  }

  return score;
};

/**
 * Calculate opportunity score for WFH days (bridge potential)
 * @param date - Date to score
 * @param holidays - Array of holidays
 * @param leaveDates - Array of leave dates
 * @param wfhDates - Array of existing WFH dates
 * @returns Numerical score for WFH opportunity
 */
export const calculateOpportunityScore = (date: Date, holidays: Holiday[], leaveDates: Date[], wfhDates: Date[]): number => {
  let score = 0;
  const dayBefore = addDays(date, -1);
  const dayAfter = addDays(date, 1);
  
  // Check if this creates a bridge between weekends/holidays
  const isBeforeNonWorkday = isWeekend(dayBefore) || isHoliday(dayBefore, holidays) || 
    leaveDates.some(d => d.getTime() === dayBefore.getTime()) || wfhDates.some(d => d.getTime() === dayBefore.getTime());
  const isAfterNonWorkday = isWeekend(dayAfter) || isHoliday(dayAfter, holidays) || 
    leaveDates.some(d => d.getTime() === dayAfter.getTime()) || wfhDates.some(d => d.getTime() === dayAfter.getTime());
  
  // Higher score for bridging days
  if (isBeforeNonWorkday && isAfterNonWorkday) {
    score += 100; // Creates a bridge
  } else if (isBeforeNonWorkday || isAfterNonWorkday) {
    score += 50; // Extends a weekend/holiday
  }
  
  // Bonus for Fridays and Mondays (natural weekend extensions)
  const dayOfWeek = getDay(date);
  if (dayOfWeek === 1) score += 20; // Monday
  if (dayOfWeek === 5) score += 20; // Friday
  
  return score;
};
