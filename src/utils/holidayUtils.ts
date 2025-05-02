import { addDays, format, isSameDay, isWeekend } from 'date-fns';

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
  const dayOfWeek = date.getDay();
  if (dayOfWeek !== 1 && dayOfWeek !== 5) return false;
  
  // Check if the adjacent weekend connects to a holiday
  if (dayOfWeek === 5) {
    // Friday - check if Monday is a holiday
    const monday = addDays(date, 3);
    return holidays.some(h => isSameDay(h.date, monday));
  } else {
    // Monday - check if Friday is a holiday
    const friday = addDays(date, -3);
    return holidays.some(h => isSameDay(h.date, friday));
  }
};

export const optimizePlanForMonth = (
  month: number,
  year: number, 
  maxWfhPerWeek: number, 
  totalLeaves: number,
  holidays: Holiday[]
): OptimizedPlan => {
  // Simple optimization algorithm for demo purposes
  // In a real app, this would be much more sophisticated
  
  const leaveDates: Date[] = [];
  const wfhDates: Date[] = [];
  
  // Find long weekends and bridge holidays
  for (let d = 1; d <= 31; d++) {
    const currentDate = new Date(year, month, d);
    
    // Stop if we move to the next month
    if (currentDate.getMonth() !== month) break;
    
    // Skip weekends and holidays
    if (isWeekend(currentDate) || isHoliday(currentDate, holidays)) continue;
    
    // Check if this is a good candidate for leave (next to a holiday)
    let isGoodLeaveDay = false;
    
    // Check day before and after
    const dayBefore = addDays(currentDate, -1);
    const dayAfter = addDays(currentDate, 1);
    
    if (isHoliday(dayBefore, holidays) || isHoliday(dayAfter, holidays)) {
      isGoodLeaveDay = true;
    }
    
    // Bridge days (in between holidays/weekends)
    if (!isGoodLeaveDay) {
      const twoDaysBefore = addDays(currentDate, -2);
      const twoDaysAfter = addDays(currentDate, 2);
      
      if ((isHoliday(dayBefore, holidays) || isWeekend(dayBefore)) && 
          (isHoliday(dayAfter, holidays) || isWeekend(dayAfter))) {
        isGoodLeaveDay = true;
      }
    }
    
    // Apply leave if it's a good day and we have leaves left
    if (isGoodLeaveDay && leaveDates.length < totalLeaves) {
      leaveDates.push(currentDate);
    } 
    // Otherwise, consider for WFH
    else if (leaveDates.length < totalLeaves) {
      // Check if we haven't used too many WFH days this week
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday of this week
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Sunday of this week
      
      const wfhDaysThisWeek = wfhDates.filter(date => 
        date >= weekStart && date <= weekEnd
      ).length;
      
      if (wfhDaysThisWeek < maxWfhPerWeek) {
        wfhDates.push(currentDate);
      }
    }
  }
  
  // Calculate metrics
  const weekendAndHolidayCount = getPhilippineHolidays().filter(h => 
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
  // Find the longest streak of consecutive days off
  let maxStreak = 0;
  let currentStreak = 0;
  
  // Check each day of the month
  for (let d = 1; d <= 31; d++) {
    const currentDate = new Date(year, month, d);
    
    // Stop if we move to the next month
    if (currentDate.getMonth() !== month) break;
    
    // Is this a day off? (weekend, holiday, leave, or WFH)
    const isDayOff = isWeekend(currentDate) || 
                     isHoliday(currentDate, holidays) !== undefined ||
                     leaveDates.some(date => isSameDay(date, currentDate)) ||
                     wfhDates.some(date => isSameDay(date, currentDate));
    
    if (isDayOff) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return maxStreak;
};

const countWeekendsInMonth = (month: number, year: number): number => {
  let count = 0;
  const lastDay = new Date(year, month + 1, 0).getDate(); // Last day of month
  
  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, month, d);
    if (isWeekend(date)) count++;
  }
  
  return count;
};

export const getFormattedDateRange = (dates: Date[]): string => {
  if (dates.length === 0) return "None";
  
  return dates.map(date => format(date, "MMM d, yyyy")).join(", ");
};

export const getMonthName = (month: number): string => {
  return new Date(2025, month, 1).toLocaleString('default', { month: 'long' });
};
