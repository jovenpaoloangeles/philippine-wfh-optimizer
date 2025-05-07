import { addDays, format, isSameDay, isWeekend, startOfMonth, endOfMonth, eachDayOfInterval, isFriday, isMonday, getWeek } from 'date-fns';

export interface Holiday {
  date: Date;
  name: string;
  isSpecial: boolean;
}

export interface OptimizedPlan {
  leaveDates: Date[];
  wfhDates: Date[];
  consecutiveDaysOff: number;
  regularLeavesUsed: number;
  totalDaysOff: number;
}

// Define the Holiday type (assuming it's defined elsewhere, e.g., in a types file)
// interface Holiday {
//  date: Date;
//  name: string;
//  isSpecial: boolean; // false for Regular, true for Special Non-working
// }

// Philippine holidays for 2025
// Based on Proclamation No. 727, s. 2024 and other relevant proclamations
export const getPhilippineHolidays = (): Holiday[] => {
  return [
    // Regular Holidays [4, 7]
    // Note: Employees are typically paid 100% even if unworked, and 200% if worked. [7]
    { date: new Date(2025, 0, 1), name: "New Year's Day", isSpecial: false }, // January 1 [4, 7]
    { date: new Date(2025, 3, 9), name: "Araw ng Kagitingan", isSpecial: false }, // April 9 [4, 7]
    { date: new Date(2025, 3, 17), name: "Maundy Thursday", isSpecial: false }, // April 17 [4, 7]
    { date: new Date(2025, 3, 18), name: "Good Friday", isSpecial: false }, // April 18 [4, 7]
    { date: new Date(2025, 4, 1), name: "Labor Day", isSpecial: false }, // May 1 [4, 7]
    { date: new Date(2025, 5, 12), name: "Independence Day", isSpecial: false }, // June 12 [4, 7]
    { date: new Date(2025, 7, 25), name: "National Heroes Day", isSpecial: false }, // Last Monday of August [4, 7]
    { date: new Date(2025, 10, 30), name: "Bonifacio Day", isSpecial: false }, // November 30 (Actual day) [4, 7]
    // Note: Observance of Bonifacio Day might be moved. Proclamation 727 lists Nov 30 (Sunday). Check for potential updates closer to the date.
    { date: new Date(2025, 11, 25), name: "Christmas Day", isSpecial: false }, // December 25 [4, 7]
    { date: new Date(2025, 11, 30), name: "Rizal Day", isSpecial: false }, // December 30 [4, 7]

    // Special Non-working Days [4, 5, 7]
    // Note: Employees are typically paid 130% if worked, "no work, no pay" applies if unworked, unless there's a favorable company policy. [7]
    { date: new Date(2025, 0, 29), name: "Chinese New Year", isSpecial: true }, // January 29 [4, 5]
    // Note: EDSA People Power Revolution Anniversary (Feb 25) was declared a Special Working Day for 2025 [4, 7]
    // { date: new Date(2025, 1, 25), name: "EDSA People Power Revolution Anniversary", isSpecial: true }, // February 25 - Now a Special WORKING day [4]
    { date: new Date(2025, 3, 19), name: "Black Saturday", isSpecial: true }, // April 19 [4, 5]
    { date: new Date(2025, 7, 21), name: "Ninoy Aquino Day", isSpecial: true }, // August 21 [4, 5]
    { date: new Date(2025, 9, 31), name: "All Saints' Day Eve", isSpecial: true }, // October 31 (Additional Special Non-working day) [4, 5]
    { date: new Date(2025, 10, 1), name: "All Saints' Day", isSpecial: true }, // November 1 [4, 5]
    { date: new Date(2025, 11, 8), name: "Feast of the Immaculate Conception of Mary", isSpecial: true }, // December 8 [4, 5]
    { date: new Date(2025, 11, 24), name: "Christmas Eve", isSpecial: true }, // December 24 (Additional Special Non-working day) [4, 5]
    { date: new Date(2025, 11, 31), name: "Last Day of the Year", isSpecial: true }, // December 31 [4, 5]

    // Islamic Holidays - Dates are tentative and subject to official proclamation [4, 6]
    // The National Commission on Muslim Filipinos (NCMF) recommends the dates based on the Islamic calendar. [4]
    { date: new Date(2025, 3, 1), name: "Eid'l Fitr", isSpecial: false }, // Tentative: April 1 [3, 6] or May 31 [2] - Marked as Regular Holiday in some lists [3, 6] but needs final proclamation
    { date: new Date(2025, 4, 12), name: "Election Day", isSpecial: true }, // Tentative: April 1 [3, 6] or May 31 [2] - Marked as Regular Holiday in some lists [3, 6] but needs final proclamation
    { date: new Date(2025, 5, 6), name: "Eid'l Adha", isSpecial: false }, // Tentative: June 6 [2, 8] - Marked as Regular Holiday but needs final proclamation

    // Other Special Non-working Days declared via separate proclamations
    { date: new Date(2025, 6, 27), name: "Iglesia ni Cristo Founding Anniversary", isSpecial: true }, // July 27 (Declared by Proclamation No. 729) [3, 4]
  ];
};

export const isHoliday = (date: Date, holidays: Holiday[]): Holiday | undefined => {
  return holidays.find(holiday => isSameDay(holiday.date, date));
};

export const isLongWeekendCandidate = (date: Date, holidays: Holiday[]): boolean => {
  // Check if the day is Friday or Monday
  if (!isMonday(date) && !isFriday(date)) return false;
  
  // Check if the adjacent weekend connects to a holiday
  if (isFriday(date)) {
    // Friday - check if Monday is a holiday
    const monday = addDays(date, 3);
    return holidays.some(h => isSameDay(h.date, monday)) || isHoliday(monday, holidays) !== undefined;
  } else {
    // Monday - check if Friday is a holiday
    const friday = addDays(date, -3);
    return holidays.some(h => isSameDay(h.date, friday)) || isHoliday(friday, holidays) !== undefined;
  }
};

// Score a date for leave potential
const scoreDateForLeave = (date: Date, holidays: Holiday[]): number => {
  let score = 0;
  
  // Skip weekends and holidays (we don't need to take leave on these days)
  if (isWeekend(date) || isHoliday(date, holidays)) {
    return -1; // Not a candidate for leave
  }
  
  // Check surrounding days (before and after)
  for (let offset = -2; offset <= 2; offset++) {
    if (offset === 0) continue; // Skip the current day
    
    const checkDate = addDays(date, offset);
    
    // Adjacent day is a holiday or weekend
    if (isHoliday(checkDate, holidays) || isWeekend(checkDate)) {
      // Immediate adjacent days (±1) are more valuable
      score += Math.abs(offset) === 1 ? 10 : 5;
    }
  }
  
  // Check for sandwiched days (bridge days)
  const prevDay = addDays(date, -1);
  const nextDay = addDays(date, 1);
  if ((isHoliday(prevDay, holidays) || isWeekend(prevDay)) && 
      (isHoliday(nextDay, holidays) || isWeekend(nextDay))) {
    score += 15; // Bridging two off days is very valuable
  }
  
  // Mondays and Fridays are generally better for extending weekends
  if (isMonday(date) || isFriday(date)) {
    score += 8;
  }
  
  return score;
};

export const optimizePlanForMonth = (
  month: number,
  year: number, 
  maxWfhPerWeek: number, 
  totalLeaves: number,
  holidays: Holiday[]
): OptimizedPlan => {
  const startDate = startOfMonth(new Date(year, month, 1));
  const endDate = endOfMonth(startDate);
  const allDaysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Score each workday for leave potential
  const scoredDates = allDaysInMonth
    .map(date => ({
      date,
      isWorkday: !isWeekend(date) && !isHoliday(date, holidays),
      score: scoreDateForLeave(date, holidays)
    }))
    .filter(item => item.isWorkday);
  
  // Sort by score (highest first)
  scoredDates.sort((a, b) => b.score - a.score);
  
  // Select days for leave (highest scores first, up to totalLeaves)
  const leaveDates = scoredDates
    .slice(0, totalLeaves)
    .map(item => item.date)
    .sort((a, b) => a.getTime() - b.getTime()); // Sort chronologically
  
  // Group remaining workdays by calendar week
  // Use proper week numbering by using ISO week numbers
  const weekMap = new Map<number, Date[]>();
  
  scoredDates
    .filter(item => !leaveDates.some(leaveDate => isSameDay(leaveDate, item.date)))
    .forEach(item => {
      const date = item.date;
      // Use getWeek to get ISO week number for consistent calendar weeks
      const weekNum = getWeek(date);
      
      if (!weekMap.has(weekNum)) {
        weekMap.set(weekNum, []);
      }
      weekMap.get(weekNum)!.push(date);
    });
  
  // For each week, select the best days for WFH up to maxWfhPerWeek
  const wfhDates: Date[] = [];
  
  weekMap.forEach((datesInWeek) => {
    // Sort by score within each week
    datesInWeek.sort((a, b) => 
      scoreDateForLeave(b, holidays) - scoreDateForLeave(a, holidays)
    );
    
    // Take up to maxWfhPerWeek days per week
    const wfhForThisWeek = datesInWeek.slice(0, maxWfhPerWeek);
    wfhDates.push(...wfhForThisWeek);
  });
  
  // Sort WFH dates chronologically
  wfhDates.sort((a, b) => a.getTime() - b.getTime());
  
  // Calculate metrics
  const weekendAndHolidayCount = holidays.filter(h => 
    h.date.getMonth() === month && h.date.getFullYear() === year
  ).length + countWeekendsInMonth(month, year);
  
  return {
    leaveDates,
    wfhDates,
    consecutiveDaysOff: calculateConsecutiveDaysOff(month, year, leaveDates, wfhDates, holidays),
    regularLeavesUsed: leaveDates.length,
    totalDaysOff: leaveDates.length + wfhDates.length + weekendAndHolidayCount
  };
};

const calculateConsecutiveDaysOff = (
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

const countWeekendsInMonth = (month: number, year: number): number => {
  const startDate = startOfMonth(new Date(year, month, 1));
  const endDate = endOfMonth(startDate);
  const allDaysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
  
  return allDaysInMonth.filter(date => isWeekend(date)).length;
};

export const getFormattedDateRange = (dates: Date[]): string => {
  if (dates.length === 0) return "None";
  
  return dates.map(date => format(date, "MMM d, yyyy")).join(", ");
};

export const getMonthName = (month: number): string => {
  return new Date(2025, month, 1).toLocaleString('default', { month: 'long' });
};
