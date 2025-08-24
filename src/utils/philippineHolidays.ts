import { Holiday } from './types';

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

    // Special Non-working Holidays [4, 7]
    // Note: Employees are typically paid 30% extra if worked. [7]
    { date: new Date(2025, 1, 9), name: "Chinese New Year", isSpecial: true }, // February 9 [4, 7]
    { date: new Date(2025, 1, 25), name: "People Power Anniversary", isSpecial: true }, // February 25 [4, 7]
    { date: new Date(2025, 3, 19), name: "Black Saturday", isSpecial: true }, // April 19 [4, 7]
    { date: new Date(2025, 7, 21), name: "Ninoy Aquino Day", isSpecial: true }, // August 21 [4, 7]
    { date: new Date(2025, 10, 1), name: "All Saints' Day", isSpecial: true }, // November 1 [4, 7]
    { date: new Date(2025, 10, 2), name: "All Souls' Day", isSpecial: true }, // November 2 [4, 7]
    { date: new Date(2025, 11, 8), name: "Feast of the Immaculate Conception", isSpecial: true }, // December 8 [4, 7]
    { date: new Date(2025, 11, 24), name: "Christmas Eve", isSpecial: true }, // December 24 [4, 7]
    { date: new Date(2025, 11, 31), name: "New Year's Eve", isSpecial: true }, // December 31 [4, 7]
  ];
};
