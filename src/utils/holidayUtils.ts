
import { addDays, format, isSameDay, isWeekend, startOfMonth, endOfMonth, eachDayOfInterval, isFriday, isMonday } from 'date-fns';

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

// Philippine holidays for 2025
export const getPhilippineHolidays = (): Holiday[] => {
  return [
    // Regular Holidays
    { date: new Date(2025, 0, 1), name: "New Year's Day", isSpecial: false },
    { date: new Date(2025, 3, 9), name: "Day of Valor", isSpecial: false },
    { date: new Date(2025, 3, 17), name: "Maundy Thursday", isSpecial: false },
    { date: new Date(2025, 3, 18), name: "Good Friday", isSpecial: false },
    { date: new Date(2025, 4, 1), name: "Labor Day", isSpecial: false },
    { date: new Date(2025, 5, 12), name: "Independence Day", isSpecial: false },
    { date: new Date(2025, 10, 30), name: "Bonifacio Day", isSpecial: false },
    { date: new Date(2025, 11, 25), name: "Christmas Day", isSpecial: false },
    { date: new Date(2025, 11, 30), name: "Rizal Day", isSpecial: false },
    
    // Special Non-working Holidays
    { date: new Date(2025, 1, 25), name: "EDSA People Power Revolution", isSpecial: true },
    { date: new Date(2025, 3, 19), name: "Black Saturday", isSpecial: true },
    { date: new Date(2025, 3, 21), name: "Eid al-Fitr", isSpecial: true },
    { date: new Date(2025, 7, 21), name: "Ninoy Aquino Day", isSpecial: true },
    { date: new Date(2025, 10, 1), name: "All Saints' Day", isSpecial: true },
    { date: new Date(2025, 10, 2), name: "All Souls' Day", isSpecial: true },
    { date: new Date(2025, 11, 8), name: "Feast of the Immaculate Conception", isSpecial: true },
    { date: new Date(2025, 11, 24), name: "Christmas Eve", isSpecial: true },
    { date: new Date(2025, 11, 31), name: "New Year's Eve", isSpecial: true },
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
  
  // Group remaining workdays by week
  const weekMap = new Map<number, Date[]>();
  
  scoredDates
    .filter(item => !leaveDates.some(leaveDate => isSameDay(leaveDate, item.date)))
    .forEach(item => {
      const date = item.date;
      // Get week number (simple calculation - week 1 starts on the 1st)
      const weekNum = Math.floor((date.getDate() - 1) / 7);
      
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
