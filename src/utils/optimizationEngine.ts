import { startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, isSameDay, getISOWeek } from 'date-fns';
import { Holiday, OptimizedPlan } from './types';
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

  // INITIALIZATION: Create candidate workdays
  let candidateWorkdays = allDays.filter(day => 
    !isWeekend(day) && !isHoliday(day, holidays)
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

  // Initialize tracking arrays
  let leaveDates: Date[] = [];
  let wfhDates: Date[] = [];

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
