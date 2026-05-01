import { startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, isSameDay, getISOWeek, isBefore, startOfDay, addDays } from 'date-fns';
import { Holiday, OptimizedPlan, MultiMonthOptimizedPlan } from './types';
import { isHoliday } from './holidayDetection';
import { scoreDateForLeave } from './scoringUtils';
import { calculateConsecutiveDaysOff } from './calculationUtils';

/**
 * Unified Optimization Strategy
 * Uses a single allocation loop to make globally optimal decisions
 */
export const optimizePlanForMonth = (
  month: number,
  year: number,
  maxWfhPerWeek: number,
  totalLeaves: number,
  holidays: Holiday[],
  strategy: "A" | "B" = "A",
  manualWfhDates: Date[] = [],
  carryoverBalance: number = 0
): OptimizedPlan => {
  // Input validation
  if (typeof month !== 'number' || month < 0 || month > 11) {
    throw new Error('Invalid month. Must be a number between 0 and 11.');
  }
  if (typeof year !== 'number' || year < 2020 || year > 2030) {
    throw new Error('Invalid year. Must be a number between 2020 and 2030.');
  }
  if (typeof maxWfhPerWeek !== 'number' || maxWfhPerWeek < 0) {
    throw new Error('Invalid maxWfhPerWeek. Must be a non-negative number.');
  }
  if (typeof totalLeaves !== 'number' || totalLeaves < 0) {
    throw new Error('Invalid totalLeaves. Must be a non-negative number.');
  }

  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // INITIALIZATION: Create candidate workdays (exclude manual WFH dates)
  let candidateWorkdays = allDays.filter(day => 
    !isWeekend(day) && !isHoliday(day, holidays) && !manualWfhDates.some(d => isSameDay(d, day))
  );

  // Initialize resources
  let leavesRemaining = totalLeaves;
  const wfhSlotsRemainingByWeek = new Map<number, number>();
  candidateWorkdays.forEach(day => {
    const week = getISOWeek(day);
    if (!wfhSlotsRemainingByWeek.has(week)) {
      wfhSlotsRemainingByWeek.set(week, maxWfhPerWeek);
    }
  });

  // Initialize tracking arrays - start with manual WFH dates
  const leaveDates: Date[] = [];
  const wfhDates: Date[] = [...manualWfhDates];

  // MAIN ALLOCATION LOOP: Unified resource allocation
  while (leavesRemaining > 0 || Array.from(wfhSlotsRemainingByWeek.values()).some(slots => slots > 0)) {
    if (candidateWorkdays.length === 0) break;

    let bestCandidate: Date | null = null;
    let bestStreakLength = 0;
    let bestScore = -Infinity;

    // Find the best candidate day
    for (const candidate of candidateWorkdays) {
      // Calculate what the longest streak would be if we make this day off
      const potentialStreakLength = calculatePotentialLongestStreak(
        candidate, allDays, holidays, leaveDates, wfhDates
      );

      // Use secondary scoring for tie-breaking
      const secondaryScore = scoreDateForLeave(candidate, holidays);

      // Primary metric: longest consecutive streak
      // Secondary: opportunity score for tie-breaking
      if (potentialStreakLength > bestStreakLength || 
          (potentialStreakLength === bestStreakLength && secondaryScore > bestScore)) {
        bestCandidate = candidate;
        bestStreakLength = potentialStreakLength;
        bestScore = secondaryScore;
      }
    }

    if (!bestCandidate) break;

    // RESOURCE ASSIGNMENT: Prioritize most constrained resource (WFH first)
    const candidateWeek = getISOWeek(bestCandidate);
    const wfhSlotsAvailable = wfhSlotsRemainingByWeek.get(candidateWeek) || 0;

    let resourceAssigned = false;

    // Strategy A: WFH-first (prioritize WFH as it's more constrained)
    if (strategy === "A") {
      if (wfhSlotsAvailable > 0) {
        // Assign as WFH day
        wfhDates.push(bestCandidate);
        wfhSlotsRemainingByWeek.set(candidateWeek, wfhSlotsAvailable - 1);
        resourceAssigned = true;
      } else if (leavesRemaining > 0) {
        // Assign as Leave day
        leaveDates.push(bestCandidate);
        leavesRemaining--;
        resourceAssigned = true;
      }
    } else {
      // Strategy B: Leave-first
      if (leavesRemaining > 0) {
        // Assign as Leave day
        leaveDates.push(bestCandidate);
        leavesRemaining--;
        resourceAssigned = true;
      } else if (wfhSlotsAvailable > 0) {
        // Assign as WFH day
        wfhDates.push(bestCandidate);
        wfhSlotsRemainingByWeek.set(candidateWeek, wfhSlotsAvailable - 1);
        resourceAssigned = true;
      }
    }

    // UPDATE STATE: Remove candidate and continue
    candidateWorkdays = candidateWorkdays.filter(day => !isSameDay(day, bestCandidate!));

    // If we couldn't assign any resource, remove this candidate and continue
    if (!resourceAssigned) {
      continue;
    }
  }

  // Calculate final metrics
  const totalDaysOff = calculateConsecutiveDaysOff(allDays, holidays, leaveDates, wfhDates);
  const longestStreak = totalDaysOff.length > 0 ? Math.max(...totalDaysOff.map(period => period.length)) : 0;

  return {
    month,
    year,
    leaveDates,
    wfhDates,
    manualWfhDates,
    totalDaysOff,
    longestStreak,
    leavesUsed: leaveDates.length,
    leavesRemaining: totalLeaves - leaveDates.length,
    wfhDaysUsed: wfhDates.length,
    strategy
  };
};

/**
 * Calculate the potential longest consecutive streak if we make a specific day off
 */
function calculatePotentialLongestStreak(
  candidateDate: Date,
  allDays: Date[],
  holidays: Holiday[],
  leaveDates: Date[],
  wfhDates: Date[]
): number {
  // Create a temporary array with the candidate day added
  const tempLeaveDates = [...leaveDates, candidateDate];
  
  // Calculate consecutive days off with this potential addition
  const potentialDaysOff = calculateConsecutiveDaysOff(allDays, holidays, tempLeaveDates, wfhDates);
  
  // Return the length of the longest streak
  return potentialDaysOff.length > 0 ? Math.max(...potentialDaysOff.map(period => period.length)) : 0;
}

/**
 * Multi-Month Optimization Strategy
 * Optimizes leave and WFH allocation across multiple months starting from today
 * Only considers dates from today onwards for optimization
 */
export const optimizePlanForPeriod = (
  startDate: Date,
  endDate: Date,
  maxWfhPerWeek: number,
  totalLeaves: number,
  holidays: Holiday[],
  strategy: "A" | "B" = "A",
  manualWfhDates: Date[] = [],
  maxLeavesPerMonth: number = Infinity
): MultiMonthOptimizedPlan => {
  // Input validation
  if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
    throw new Error('Invalid dates. Must be Date objects.');
  }
  if (isBefore(endDate, startDate)) {
    throw new Error('End date must be after start date.');
  }
  if (typeof maxWfhPerWeek !== 'number' || maxWfhPerWeek < 0) {
    throw new Error('Invalid maxWfhPerWeek. Must be a non-negative number.');
  }
  if (typeof totalLeaves !== 'number' || totalLeaves < 0) {
    throw new Error('Invalid totalLeaves. Must be a non-negative number.');
  }

  const today = startOfDay(new Date());
  const effectiveStartDate = isBefore(startDate, today) ? today : startDate;

  // Get all days in the optimization period
  const allDays = eachDayOfInterval({ start: effectiveStartDate, end: endDate });

  // INITIALIZATION: Create candidate workdays (exclude manual WFH dates and past dates)
  let candidateWorkdays = allDays.filter(day => {
    // Skip weekends and holidays
    if (isWeekend(day) || isHoliday(day, holidays)) return false;
    // Skip manual WFH dates
    if (manualWfhDates.some(d => isSameDay(d, day))) return false;
    // Skip dates before today
    if (isBefore(day, today)) return false;
    return true;
  });

  // Initialize resources
  let leavesRemaining = totalLeaves;
  const wfhSlotsRemainingByWeek = new Map<number, number>();
  candidateWorkdays.forEach(day => {
    const week = getISOWeek(day);
    if (!wfhSlotsRemainingByWeek.has(week)) {
      wfhSlotsRemainingByWeek.set(week, maxWfhPerWeek);
    }
  });

  // Initialize tracking arrays - start with manual WFH dates within the period
  const manualWfhInPeriod = manualWfhDates.filter(d => 
    !isBefore(d, effectiveStartDate) && !isBefore(endDate, d)
  );
  const leaveDates: Date[] = [];
  const wfhDates: Date[] = [...manualWfhInPeriod];

  // MAIN ALLOCATION LOOP: Unified resource allocation
  while (leavesRemaining > 0 || Array.from(wfhSlotsRemainingByWeek.values()).some(slots => slots > 0)) {
    if (candidateWorkdays.length === 0) break;

    let bestCandidate: Date | null = null;
    let bestStreakLength = 0;
    let bestScore = -Infinity;

    // Find the best candidate day
    for (const candidate of candidateWorkdays) {
      // Calculate what the longest streak would be if we make this day off
      const potentialStreakLength = calculatePotentialLongestStreakForPeriod(
        candidate, allDays, holidays, leaveDates, wfhDates
      );

      // Use secondary scoring for tie-breaking
      const secondaryScore = scoreDateForLeave(candidate, holidays);

      // Primary metric: longest consecutive streak
      // Secondary: opportunity score for tie-breaking
      if (potentialStreakLength > bestStreakLength || 
          (potentialStreakLength === bestStreakLength && secondaryScore > bestScore)) {
        bestCandidate = candidate;
        bestStreakLength = potentialStreakLength;
        bestScore = secondaryScore;
      }
    }

    if (!bestCandidate) break;

    // RESOURCE ASSIGNMENT: Prioritize most constrained resource (WFH first)
    const candidateWeek = getISOWeek(bestCandidate);
    const wfhSlotsAvailable = wfhSlotsRemainingByWeek.get(candidateWeek) || 0;

    // Check per-month leave cap
    const candidateMonth = bestCandidate.getMonth();
    const candidateYear = bestCandidate.getFullYear();
    const leavesInMonth = leaveDates.filter(d => d.getMonth() === candidateMonth && d.getFullYear() === candidateYear).length;
    const canUseLeave = leavesRemaining > 0 && leavesInMonth < maxLeavesPerMonth;

    let resourceAssigned = false;

    // Strategy A: WFH-first (prioritize WFH as it's more constrained)
    if (strategy === "A") {
      if (wfhSlotsAvailable > 0) {
        wfhDates.push(bestCandidate);
        wfhSlotsRemainingByWeek.set(candidateWeek, wfhSlotsAvailable - 1);
        resourceAssigned = true;
      } else if (canUseLeave) {
        leaveDates.push(bestCandidate);
        leavesRemaining--;
        resourceAssigned = true;
      }
    } else {
      // Strategy B: Leave-first
      if (canUseLeave) {
        leaveDates.push(bestCandidate);
        leavesRemaining--;
        resourceAssigned = true;
      } else if (wfhSlotsAvailable > 0) {
        wfhDates.push(bestCandidate);
        wfhSlotsRemainingByWeek.set(candidateWeek, wfhSlotsAvailable - 1);
        resourceAssigned = true;
      }
    }

    // UPDATE STATE: Remove candidate and continue
    candidateWorkdays = candidateWorkdays.filter(day => !isSameDay(day, bestCandidate!));

    // If we couldn't assign any resource, remove this candidate and continue
    if (!resourceAssigned) {
      continue;
    }
  }

  // Calculate final metrics
  const totalDaysOff = calculateConsecutiveDaysOff(allDays, holidays, leaveDates, wfhDates);
  const longestStreak = totalDaysOff.length > 0 ? Math.max(...totalDaysOff.map(period => period.length)) : 0;

  // Build month breakdown
  const monthBreakdown: { month: number; year: number; leaveDates: Date[]; wfhDates: Date[] }[] = [];
  const monthsInPeriod = new Map<string, { month: number; year: number }>();
  
  allDays.forEach(day => {
    const key = `${day.getFullYear()}-${day.getMonth()}`;
    if (!monthsInPeriod.has(key)) {
      monthsInPeriod.set(key, { month: day.getMonth(), year: day.getFullYear() });
    }
  });

  monthsInPeriod.forEach(({ month, year }) => {
    const monthStart = startOfMonth(new Date(year, month));
    const monthEnd = endOfMonth(monthStart);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    monthBreakdown.push({
      month,
      year,
      leaveDates: leaveDates.filter(d => 
        monthDays.some(md => isSameDay(md, d))
      ),
      wfhDates: wfhDates.filter(d => 
        monthDays.some(md => isSameDay(md, d))
      )
    });
  });

  return {
    startDate: effectiveStartDate,
    endDate,
    leaveDates,
    wfhDates,
    manualWfhDates: manualWfhInPeriod,
    totalDaysOff,
    longestStreak,
    leavesUsed: leaveDates.length,
    leavesRemaining: totalLeaves - leaveDates.length,
    wfhDaysUsed: wfhDates.length,
    strategy,
    monthBreakdown
  };
};

/**
 * Calculate the potential longest consecutive streak across the period if we make a specific day off
 */
function calculatePotentialLongestStreakForPeriod(
  candidateDate: Date,
  allDays: Date[],
  holidays: Holiday[],
  leaveDates: Date[],
  wfhDates: Date[]
): number {
  // Create a temporary array with the candidate day added
  const tempLeaveDates = [...leaveDates, candidateDate];
  
  // Calculate consecutive days off with this potential addition
  const potentialDaysOff = calculateConsecutiveDaysOff(allDays, holidays, tempLeaveDates, wfhDates);
  
  // Return the length of the longest streak
  return potentialDaysOff.length > 0 ? Math.max(...potentialDaysOff.map(period => period.length)) : 0;
}
