// Re-export types
export type { Holiday, OptimizedPlan } from './types';

// Re-export main functions
export { getPhilippineHolidays } from './philippineHolidays';
export { isHoliday, isBridgeOpportunity } from './holidayDetection';
export { scoreDateForLeave, calculateOpportunityScore } from './scoringUtils';
export { calculateConsecutiveDaysOff, calculatePotentialConsecutiveDaysOff, countWeekendsInMonth } from './calculationUtils';
export { getFormattedDateRange, getMonthName } from './formatUtils';
export { optimizePlanForMonth } from './optimizationEngine';

// Re-export calendar functions
export { generateICS, downloadICS, exportToCalendar, generateICSForPeriod, exportToCalendarForPeriod } from './calendarExport';

// Re-export share functions
export { generateShareableURL, parseShareableURL, copyShareableURL, getShareText } from './shareUtils';

// Re-export holiday descriptions
export { getHolidayDescription, holidayDescriptions } from './holidayDescriptions';
export type { HolidayDescription } from './holidayDescriptions';
