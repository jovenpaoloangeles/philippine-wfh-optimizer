import { format } from 'date-fns';
import type { OptimizedPlan } from './types';
import { MAX_LEAVES, MAX_WFH_PER_WEEK } from '../components/ControlPanel';

/**
 * Generate a shareable URL with current configuration
 * @param maxWfhPerWeek Maximum WFH days per week
 * @param totalLeaves Total leave credits
 * @param selectedMonth Selected month (0-11)
 * @param selectedYear Selected year
 * @returns Shareable URL string
 */
export const generateShareableURL = (
  maxWfhPerWeek: number,
  totalLeaves: number,
  selectedMonth: number,
  selectedYear: number
): string => {
  const params = new URLSearchParams({
    wfh: maxWfhPerWeek.toString(),
    leaves: totalLeaves.toString(),
    month: selectedMonth.toString(),
    year: selectedYear.toString()
  });
  
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?${params.toString()}`;
};

/**
 * Parse URL parameters and return configuration
 * @returns Parsed configuration or null if no params
 */
export const parseShareableURL = (): {
  maxWfhPerWeek?: number;
  totalLeaves?: number;
  selectedMonth?: number;
  selectedYear?: number;
} | null => {
  const params = new URLSearchParams(window.location.search);
  
  if (params.toString() === '') return null;
  
  const config: {
    maxWfhPerWeek?: number;
    totalLeaves?: number;
    selectedMonth?: number;
    selectedYear?: number;
  } = {};
  
  if (params.has('wfh')) {
    const wfh = parseInt(params.get('wfh')!);
    if (!isNaN(wfh) && wfh >= 0 && wfh <= MAX_WFH_PER_WEEK) {
      config.maxWfhPerWeek = wfh;
    }
  }
  
  if (params.has('leaves')) {
    const leaves = parseInt(params.get('leaves')!);
    if (!isNaN(leaves) && leaves >= 0 && leaves <= MAX_LEAVES) {
      config.totalLeaves = leaves;
    }
  }
  
  if (params.has('month')) {
    const month = parseInt(params.get('month')!);
    if (!isNaN(month) && month >= 0 && month <= 11) {
      config.selectedMonth = month;
    }
  }
  
  if (params.has('year')) {
    const year = parseInt(params.get('year')!);
    if (!isNaN(year) && year >= 2025 && year <= 2030) {
      config.selectedYear = year;
    }
  }
  
  return Object.keys(config).length > 0 ? config : null;
};

/**
 * Copy shareable URL to clipboard
 * @param maxWfhPerWeek Maximum WFH days per week
 * @param totalLeaves Total leave credits
 * @param selectedMonth Selected month (0-11)
 * @param selectedYear Selected year
 * @returns Promise that resolves when URL is copied
 */
export const copyShareableURL = async (
  maxWfhPerWeek: number,
  totalLeaves: number,
  selectedMonth: number,
  selectedYear: number
): Promise<boolean> => {
  try {
    const url = generateShareableURL(maxWfhPerWeek, totalLeaves, selectedMonth, selectedYear);
    await navigator.clipboard.writeText(url);
    return true;
  } catch (err) {
    console.error('Failed to copy URL:', err);
    return false;
  }
};

/**
 * Get a descriptive text for sharing
 * @param selectedMonth Selected month (0-11)
 * @param selectedYear Selected year
 * @param plan Optimized plan results
 * @returns Descriptive text for sharing
 */
export const getShareText = (
  selectedMonth: number,
  selectedYear: number,
  plan: OptimizedPlan | null
): string => {
  const monthName = format(new Date(selectedYear, selectedMonth, 1), 'MMMM yyyy');
  
  if (!plan) {
    return `Check out my Philippine Holiday schedule for ${monthName}!`;
  }
  
  return `I optimized my schedule for ${monthName} and got ${plan.longestStreak} consecutive days off! 🎉`;
};
