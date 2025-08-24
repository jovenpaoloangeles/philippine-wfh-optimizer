import { addDays, format, isSameDay, isWeekend, startOfMonth, endOfMonth, eachDayOfInterval, isFriday, isMonday, getISOWeek } from 'date-fns';

export interface Holiday {
  date: Date;
  name: string;
  isSpecial: boolean;
}

export interface LeaveDetail {
  date: Date;
  type: "full";
}

export interface OptimizedPlan {
  // Deprecated: leaveDates kept for backward compatibility. Prefer leaveDetails.
  leaveDates: Date[];
  leaveDetails: LeaveDetail[]; // Only "full" leaves supported
  wfhDates: Date[];
  consecutiveDaysOff: number;
  regularLeavesUsed: number;
  totalDaysOff: number;
  strategyUsed: "A" | "B";
  carryoverBalance: number; // Carryover is settable and used in calculations
}

// Define the Holiday type (assuming it's defined elsewhere, e.g., in a types file)
// interface Holiday {
//  date: Date;
//  name: string;
//  isSpecial: boolean; // false for Regular, true for Special Non-working
// }

/**
 * Get Philippine holidays for 2025
 * Based on Proclamation No. 727, s. 2024 and other relevant proclamations
 * @returns Array of Holiday objects with date, name, and special status
 */
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

/**
 * Check if a given date is a holiday
 * @param date - The date to check
 * @param holidays - Array of holidays to check against
 * @returns Holiday object if date is a holiday, undefined otherwise
 */
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
  const prevIsOff = !!isHoliday(prevDay, holidays) || isWeekend(prevDay);
  const nextIsOff = !!isHoliday(nextDay, holidays) || isWeekend(nextDay);
  if (prevIsOff && nextIsOff) {
    score += 15; // Bridging two off days is very valuable
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
 * Optimize leave and WFH schedule for a given month
 * @param month - Month index (0-11)
 * @param year - Year (e.g., 2025)
 * @param maxWfhPerWeek - Maximum WFH days per week (0-5)
 * @param totalLeaves - Available leave credits
 * @param holidays - Array of holidays to consider
 * @param strategy - Optimization strategy ("A" or "B")
 * @param carryoverBalance - Additional leave credits from previous period
 * @returns Optimized plan with leave dates, WFH dates, and statistics
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
    throw new Error('Invalid month parameter');
  }
  if (typeof year !== 'number' || year < 2020 || year > 2030) {
    throw new Error('Invalid year parameter');
  }
  if (typeof maxWfhPerWeek !== 'number' || maxWfhPerWeek < 0 || maxWfhPerWeek > 5) {
    throw new Error('Invalid maxWfhPerWeek parameter');
  }
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
  
  // Strategy selection and leave allocation
  const availableLeaves = totalLeaves + (carryoverBalance || 0);
  const leaveDetails: LeaveDetail[] = [];
  let leavesConsumed = 0;

  // Helper to check if a date is already chosen for leave
  const isSelectedForLeave = (d: Date) => leaveDetails.some(ld => isSameDay(ld.date, d));

  if (strategy === "A") {
    // Strategy A: maximize consecutive rest days by using highest-score full-day leaves
    const fullSlots = Math.floor(availableLeaves);
    for (const item of scoredDates.slice(0, fullSlots)) {
      leaveDetails.push({ date: item.date, type: "full" });
      leavesConsumed += 1;
    }
  } else {
    // Strategy B: minimize leave usage while extending weekends
    // Only use a full-day leave if it increases the longest consecutive days off
    let improved = true;
    while (improved && leavesConsumed + 1 <= availableLeaves) {
      improved = false;
      const currentStreak = calculateConsecutiveDaysOff(
        month,
        year,
        leaveDetails.map(ld => ld.date),
        [],
        holidays
      );
      let bestItem: { date: Date; score: number } | null = null;
      let bestImprovement = 0;
      for (const item of scoredDates) {
        if (isSelectedForLeave(item.date)) continue;
        const potentialStreak = calculateConsecutiveDaysOff(
          month,
          year,
          [...leaveDetails.map(ld => ld.date), item.date],
          [],
          holidays
        );
        const improvement = potentialStreak - currentStreak;
        if (
          improvement > bestImprovement ||
          (improvement === bestImprovement && (!bestItem || item.score > bestItem.score))
        ) {
          bestItem = { date: item.date, score: item.score };
          bestImprovement = improvement;
        }
      }
      if (bestItem && bestImprovement > 0) {
        leaveDetails.push({ date: bestItem.date, type: "full" });
        leavesConsumed += 1;
        improved = true;
      } else {
        break;
      }
    }
    // No half-day allocation: only full-day leaves are supported
  }

  // Derive legacy leaveDates (full-day only) for backward compatibility
  const leaveDates = leaveDetails
    .map(ld => ld.date)
    .sort((a, b) => a.getTime() - b.getTime());

  // New WFH selection logic focused on maximizing consecutive days
  const wfhDates: Date[] = [];
  const potentialWfhDays = scoredDates
    .filter(item => !leaveDates.some(leaveDate => isSameDay(leaveDate, item.date)) && !leaveDetails.some(ld => isSameDay(ld.date, item.date)))
    .map(item => item.date);

  const weeklyWfhCount = new Map<number, number>(); // weekNum -> count

  // Initialize weekly WFH count for all weeks
  potentialWfhDays.forEach(date => {
    const weekNum = getISOWeek(date);
    if (!weeklyWfhCount.has(weekNum)) {
      weeklyWfhCount.set(weekNum, 0);
    }
  });

  // Check for upcoming holidays and weekends to identify potential multi-day streak opportunities
  const identifyMultiDayOpportunities = () => {
    // Get all non-workdays (weekends or holidays)
    const nonWorkDays = allDaysInMonth.filter(date => 
      isWeekend(date) || isHoliday(date, holidays) !== undefined || leaveDates.some(d => isSameDay(d, date))
    ).map(date => date.getTime());

    // Find consecutive sequences of non-workdays
    const nonWorkDaySequences: Date[][] = [];
    let currentSequence: Date[] = [];

    for (let i = 0; i < allDaysInMonth.length; i++) {
      const date = allDaysInMonth[i];
      if (nonWorkDays.includes(date.getTime())) {
        currentSequence.push(date);
      } else if (currentSequence.length > 0) {
        nonWorkDaySequences.push([...currentSequence]);
        currentSequence = [];
      }
    }
    // Add the last sequence if it exists
    if (currentSequence.length > 0) {
      nonWorkDaySequences.push(currentSequence);
    }

    // Identify workdays adjacent to these sequences that could be used for WFH
    const opportunityDays = new Map<number, number>(); // Date time -> priority score

    for (const sequence of nonWorkDaySequences) {
      if (sequence.length >= 3) { // Only consider long weekend or holiday sequences
        // Check day before sequence
        const dayBefore = addDays(sequence[0], -1);
        if (!isWeekend(dayBefore) && !isHoliday(dayBefore, holidays) && 
            !leaveDates.some(d => isSameDay(d, dayBefore)) &&
            month === dayBefore.getMonth()) {
          // Score is higher for longer sequences that this would extend
          opportunityDays.set(dayBefore.getTime(), sequence.length * 2);
        }

        // Check day after sequence
        const dayAfter = addDays(sequence[sequence.length - 1], 1);
        if (!isWeekend(dayAfter) && !isHoliday(dayAfter, holidays) && 
            !leaveDates.some(d => isSameDay(d, dayAfter)) &&
            month === dayAfter.getMonth()) {
          opportunityDays.set(dayAfter.getTime(), sequence.length * 2);
        }

        // Check for 2-day extension opportunity (e.g., after a 3-day weekend)
        if (sequence.length >= 3) {
          const twoDaysAfter = addDays(sequence[sequence.length - 1], 2);
          if (!isWeekend(twoDaysAfter) && !isHoliday(twoDaysAfter, holidays) && 
              !leaveDates.some(d => isSameDay(d, twoDaysAfter)) &&
              month === twoDaysAfter.getMonth()) {
            // Day immediately after sequence already identified as opportunity
            const immediateAfter = addDays(sequence[sequence.length - 1], 1);
            if (!isWeekend(immediateAfter) && !isHoliday(immediateAfter, holidays) && 
                !leaveDates.some(d => isSameDay(d, immediateAfter))) {
              // Extended sequence opportunity (worth more than individual days)
              opportunityDays.set(immediateAfter.getTime(), (sequence.length + 1) * 2);
              opportunityDays.set(twoDaysAfter.getTime(), (sequence.length + 1) * 2); 
            }
          }

          // Also check two days before
          const twoDaysBefore = addDays(sequence[0], -2);
          if (!isWeekend(twoDaysBefore) && !isHoliday(twoDaysBefore, holidays) && 
              !leaveDates.some(d => isSameDay(d, twoDaysBefore)) &&
              month === twoDaysBefore.getMonth()) {
            // Day immediately before sequence already identified as opportunity
            const immediateBefore = addDays(sequence[0], -1);
            if (!isWeekend(immediateBefore) && !isHoliday(immediateBefore, holidays) && 
                !leaveDates.some(d => isSameDay(d, immediateBefore))) {
              // Extended sequence opportunity
              opportunityDays.set(immediateBefore.getTime(), (sequence.length + 1) * 2);
              opportunityDays.set(twoDaysBefore.getTime(), (sequence.length + 1) * 2);
            }
          }
        }
      }
    }

    return opportunityDays;
  };

  // Identify multi-day streak opportunities
  const opportunityDays = identifyMultiDayOpportunities();

  // We'll continue adding WFH days until we can't add any more (due to weekly limits)
  // or until adding more doesn't improve consecutive days off
  let stillAddingWfh = true;
  while (stillAddingWfh) {
    stillAddingWfh = false;
    
    // Find the best candidate that creates or extends the longest possible streak
    let bestCandidate: Date | null = null;
    let bestConsecutiveCount = calculateConsecutiveDaysOff(month, year, leaveDates, wfhDates, holidays);
    let bestOpportunityScore = -1;
    
    // First pass: evaluate all candidate days
    for (const candidateDate of potentialWfhDays) {
      // Skip if already selected or max WFH for the week reached
      if (wfhDates.some(d => isSameDay(d, candidateDate))) continue;
      
      const weekNum = getISOWeek(candidateDate);
      if ((weeklyWfhCount.get(weekNum) || 0) >= maxWfhPerWeek) continue;
      
      // Calculate consecutive days if we add this candidate
      const potentialConsecutive = calculatePotentialConsecutiveDaysOff(
        candidateDate, month, year, leaveDates, wfhDates, holidays
      );
      
      const opportunityScore = opportunityDays.get(candidateDate.getTime()) || 0;
      const dateScore = scoreDateForLeave(candidateDate, holidays);
      
      // Decision logic with prioritization:
      // 1. Longest consecutive streak is the primary goal
      // 2. If tied, prioritize recognized multi-day opportunities
      // 3. If still tied, use original score (Monday/Friday preference)
      let makeThisBest = false;
      
      if (potentialConsecutive > bestConsecutiveCount) {
        makeThisBest = true;
      } 
      else if (potentialConsecutive === bestConsecutiveCount) {
        if (opportunityScore > bestOpportunityScore) {
          makeThisBest = true;
        }
        else if (opportunityScore === bestOpportunityScore) {
          // Check if this date extends an existing WFH or off-day
          const dayBefore = addDays(candidateDate, -1);
          const dayAfter = addDays(candidateDate, 1);
          
          const isPartOfExistingStreak = (
            isWeekend(dayBefore) || isHoliday(dayBefore, holidays) || 
            leaveDates.some(d => isSameDay(d, dayBefore)) || wfhDates.some(d => isSameDay(d, dayBefore)) ||
            isWeekend(dayAfter) || isHoliday(dayAfter, holidays) || 
            leaveDates.some(d => isSameDay(d, dayAfter)) || wfhDates.some(d => isSameDay(d, dayAfter))
          );
          
          // Check if best candidate extends a streak
          const bestIsPartOfStreak = bestCandidate ? (
            isWeekend(addDays(bestCandidate, -1)) || isHoliday(addDays(bestCandidate, -1), holidays) ||
            leaveDates.some(d => isSameDay(d, addDays(bestCandidate, -1))) || wfhDates.some(d => isSameDay(d, addDays(bestCandidate, -1))) ||
            isWeekend(addDays(bestCandidate, 1)) || isHoliday(addDays(bestCandidate, 1), holidays) ||
            leaveDates.some(d => isSameDay(d, addDays(bestCandidate, 1))) || wfhDates.some(d => isSameDay(d, addDays(bestCandidate, 1)))
          ) : false;
          
          if (isPartOfExistingStreak && !bestIsPartOfStreak) {
            makeThisBest = true;
          }
          else if ((isPartOfExistingStreak && bestIsPartOfStreak) || (!isPartOfExistingStreak && !bestIsPartOfStreak)) {
            // If both or neither extend a streak, use original score
            if (dateScore > (bestCandidate ? scoreDateForLeave(bestCandidate, holidays) : -1)) {
              makeThisBest = true;
            }
          }
        }
      }
      
      if (makeThisBest) {
        bestCandidate = candidateDate;
        bestConsecutiveCount = potentialConsecutive;
        bestOpportunityScore = opportunityScore;
        stillAddingWfh = true;
      }
    }
    
    // If we found a candidate, add it to our WFH dates
    if (bestCandidate) {
      wfhDates.push(bestCandidate);
      const weekNum = getISOWeek(bestCandidate);
      weeklyWfhCount.set(weekNum, (weeklyWfhCount.get(weekNum) || 0) + 1);
      
      // After adding a WFH day, recalculate opportunity scores as they may have changed
      // For example, extending a sequence means different days become valuable
      // This step is key for handling multi-day extensions like May 13-14 after a holiday
    } else {
      // If no more improvements to consecutive days, but we still have WFH slots,
      // fill remaining slots based on the original score (prefer Mondays/Fridays)
      const weeksWithRemainingSlots = Array.from(weeklyWfhCount.entries())
        .filter(([_, count]) => count < maxWfhPerWeek)
        .map(([weekNum, _]) => weekNum);
      
      if (weeksWithRemainingSlots.length > 0) {
        // Find available days in these weeks and sort by original score
        const remainingCandidates = potentialWfhDays
          .filter(date => {
            if (wfhDates.some(d => isSameDay(d, date))) return false;
            const weekNum = getISOWeek(date);
            return weeksWithRemainingSlots.includes(weekNum);
          })
          .sort((a, b) => scoreDateForLeave(b, holidays) - scoreDateForLeave(a, holidays));
        
        if (remainingCandidates.length > 0) {
          const nextBestDay = remainingCandidates[0];
          wfhDates.push(nextBestDay);
          const weekNum = getISOWeek(nextBestDay);
          weeklyWfhCount.set(weekNum, (weeklyWfhCount.get(weekNum) || 0) + 1);
          stillAddingWfh = true;
        }
      }
    }
  }
  
  // Sort WFH dates chronologically
  wfhDates.sort((a, b) => a.getTime() - b.getTime());
  
 // Correctly calculate metrics to avoid double-counting
 const daysInMonth = eachDayOfInterval({
   start: startOfMonth(new Date(year, month, 1)),
   end: endOfMonth(new Date(year, month, 1)),
  });
 const weekendAndHolidayCount = daysInMonth.filter(day => 
   isWeekend(day) || isHoliday(day, holidays)
  ).length;

  const fullLeavesUsed = leaveDetails.length;
  const regularLeavesUsed = fullLeavesUsed;
  const totalDaysOff = fullLeavesUsed + wfhDates.length + weekendAndHolidayCount;
  const updatedCarryover = Math.max(0, totalLeaves + (carryoverBalance || 0) - regularLeavesUsed);

  return {
    leaveDetails,
    leaveDates,
    wfhDates,
    consecutiveDaysOff: calculateConsecutiveDaysOff(month, year, leaveDates, wfhDates, holidays),
    regularLeavesUsed,
    totalDaysOff,
    strategyUsed: strategy,
    carryoverBalance: updatedCarryover
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

// Calculate what the consecutive days would be if we add a WFH on a specific date
const calculatePotentialConsecutiveDaysOff = (
  date: Date,
  month: number,
  year: number,
  leaveDates: Date[],
  existingWfhDates: Date[],
  holidays: Holiday[]
): number => {
  // Create a temporary WFH list with the new candidate date
  const tempWfhDates = [...existingWfhDates, date];
  
  // Call the normal consecutive days calculator with this temporary list
  return calculateConsecutiveDaysOff(month, year, leaveDates, tempWfhDates, holidays);
};

const countWeekendsInMonth = (month: number, year: number): number => {
  const startDate = startOfMonth(new Date(year, month, 1));
  const endDate = endOfMonth(startDate);
  const allDaysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
  
  return allDaysInMonth.filter(date => isWeekend(date)).length;
};

/**
 * Format dates for display in results
 * @param dates - Array of Date objects
 * @returns Formatted string with comma-separated day numbers
 */
export const getFormattedDateRange = (dates: Date[]): string => {
  if (dates.length === 0) return "None";
  
  return dates.map(date => format(date, "d")).join(", ");
};

/**
 * Get the full name of a month from its index
 * @param month - Month index (0-11)
 * @returns Full month name (e.g., "January")
 */
export const getMonthName = (month: number): string => {
  return new Date(2025, month, 1).toLocaleString('default', { month: 'long' });
};
