import { Holiday } from './types';

/**
 * Calculate Easter Sunday and related holidays for a given year
 * Uses the Anonymous Gregorian algorithm
 * @param year The year to calculate Easter for
 * @returns Object with Easter-related dates
 */
const calculateEasterHolidays = (year: number) => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  const easter = new Date(year, month - 1, day);
  const maundyThursday = new Date(easter);
  maundyThursday.setDate(easter.getDate() - 3);
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  const blackSaturday = new Date(easter);
  blackSaturday.setDate(easter.getDate() - 1);
  
  return { maundyThursday, goodFriday, blackSaturday };
};

/**
 * Get National Heroes Day (last Monday of August)
 * @param year The year to calculate for
 * @returns Date of National Heroes Day
 */
const getNationalHeroesDay = (year: number): Date => {
  const lastDayOfAugust = new Date(year, 7, 31);
  const dayOfWeek = lastDayOfAugust.getDay();
  const mondayOffset = dayOfWeek === 1 ? 0 : (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
  return new Date(year, 7, 31 + mondayOffset);
};

/**
 * Get Philippine holidays for a specific year
 * @param year The year to get holidays for (defaults to current year)
 * @returns Array of Holiday objects with date, name, and special status
 */
export const getPhilippineHolidays = (year: number = new Date().getFullYear()): Holiday[] => {
  // For now, we have complete data for 2025 and 2026
  // For other years, we'll use the 2026 data as a template
  const is2025 = year === 2025;
  
  if (is2025) {
    return [
      // 2025 Holidays (existing data)
      { date: new Date(2025, 0, 1), name: "New Year's Day", isSpecial: false },
      { date: new Date(2025, 3, 9), name: "Araw ng Kagitingan", isSpecial: false },
      { date: new Date(2025, 3, 17), name: "Maundy Thursday", isSpecial: false },
      { date: new Date(2025, 3, 18), name: "Good Friday", isSpecial: false },
      { date: new Date(2025, 4, 1), name: "Labor Day", isSpecial: false },
      { date: new Date(2025, 5, 12), name: "Independence Day", isSpecial: false },
      { date: new Date(2025, 7, 25), name: "National Heroes Day", isSpecial: false },
      { date: new Date(2025, 10, 30), name: "Bonifacio Day", isSpecial: false },
      { date: new Date(2025, 11, 25), name: "Christmas Day", isSpecial: false },
      { date: new Date(2025, 11, 30), name: "Rizal Day", isSpecial: false },
      { date: new Date(2025, 1, 9), name: "Chinese New Year", isSpecial: true },
      { date: new Date(2025, 1, 25), name: "People Power Anniversary", isSpecial: true },
      { date: new Date(2025, 3, 19), name: "Black Saturday", isSpecial: true },
      { date: new Date(2025, 7, 21), name: "Ninoy Aquino Day", isSpecial: true },
      { date: new Date(2025, 10, 1), name: "All Saints' Day", isSpecial: true },
      { date: new Date(2025, 10, 2), name: "All Souls' Day", isSpecial: true },
      { date: new Date(2025, 11, 8), name: "Feast of the Immaculate Conception", isSpecial: true },
      { date: new Date(2025, 11, 24), name: "Christmas Eve", isSpecial: true },
      { date: new Date(2025, 11, 31), name: "New Year's Eve", isSpecial: true },
    ];
  }
  
  // 2026+ Holidays based on Proclamation No. 1006
  const easterHolidays = calculateEasterHolidays(year);
  const nationalHeroesDay = getNationalHeroesDay(year);
  
  return [
    // Regular Holidays
    { date: new Date(year, 0, 1), name: "New Year's Day", isSpecial: false },
    { date: easterHolidays.maundyThursday, name: "Maundy Thursday", isSpecial: false },
    { date: easterHolidays.goodFriday, name: "Good Friday", isSpecial: false },
    { date: new Date(year, 3, 9), name: "Araw ng Kagitingan", isSpecial: false },
    { date: new Date(year, 4, 1), name: "Labor Day", isSpecial: false },
    { date: new Date(year, 5, 12), name: "Independence Day", isSpecial: false },
    { date: nationalHeroesDay, name: "National Heroes Day", isSpecial: false },
    { date: new Date(year, 10, 30), name: "Bonifacio Day", isSpecial: false },
    { date: new Date(year, 11, 25), name: "Christmas Day", isSpecial: false },
    { date: new Date(year, 11, 30), name: "Rizal Day", isSpecial: false },
    
    // Special Non-working Days
    { date: new Date(year, 7, 21), name: "Ninoy Aquino Day", isSpecial: true },
    { date: new Date(year, 10, 1), name: "All Saints' Day", isSpecial: true },
    { date: new Date(year, 11, 8), name: "Feast of the Immaculate Conception of Mary", isSpecial: true },
    { date: new Date(year, 11, 31), name: "New Year's Eve", isSpecial: true },
    
    // Additional Special Non-working Days
    { date: new Date(year, 1, 17), name: "Chinese New Year", isSpecial: true },
    { date: easterHolidays.blackSaturday, name: "Black Saturday", isSpecial: true },
    { date: new Date(year, 10, 2), name: "All Souls' Day", isSpecial: true },
    { date: new Date(year, 11, 24), name: "Christmas Eve", isSpecial: true },
    
    // Special Working Day (for 2026, regular holiday in other years)
    { date: new Date(year, 1, 25), name: "EDSA People Power Revolution Anniversary", isSpecial: false },
  ];
};
