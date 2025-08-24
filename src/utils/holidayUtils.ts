// Re-export types
export type { Holiday, LeaveDetail, OptimizedPlan } from './types';

// Re-export main functions
export { getPhilippineHolidays } from './philippineHolidays';
export { isHoliday, isBridgeOpportunity } from './holidayDetection';
export { scoreDateForLeave, calculateOpportunityScore } from './scoringUtils';
export { calculateConsecutiveDaysOff, calculatePotentialConsecutiveDaysOff, countWeekendsInMonth } from './calculationUtils';
export { getFormattedDateRange, getMonthName } from './formatUtils';
export { optimizePlanForMonth } from './optimizationEngine';
