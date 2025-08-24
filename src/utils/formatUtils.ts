import { format } from 'date-fns';

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
