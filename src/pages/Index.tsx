
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Undo2 } from 'lucide-react';
import HolidayCalendar from '@/components/HolidayCalendar';
import ControlPanel from '@/components/ControlPanel';
import ResultsPanel from '@/components/ResultsPanel';
import HolidayInfo from '@/components/HolidayInfo';
import ThemeToggle from '@/components/ThemeToggle';
import { getPhilippineHolidays } from '../utils/philippineHolidays';
import { getMonthName } from '../utils/formatUtils';
import { isHoliday } from '../utils/holidayDetection';
import { optimizePlanForMonth, optimizePlanForPeriod } from '../utils/optimizationEngine';
import type { OptimizedPlan, MultiMonthOptimizedPlan } from '../utils/types';

import { isSameDay, isWeekend, addMonths, startOfDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { parseShareableURL } from '../utils/shareUtils';
import { calculateConsecutiveDaysOff } from '../utils/calculationUtils';

const Index = () => {
  // Current date for default values
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // State for controls
  const [maxWfhPerWeek, setMaxWfhPerWeek] = useState<number>(2);
  const [totalLeaves, setTotalLeaves] = useState<number>(5);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // Current month
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [optimizationMonths, setOptimizationMonths] = useState<number>(3); // Default 3 months
  const [maxLeavesPerMonth, setMaxLeavesPerMonth] = useState<number>(30); // Default no limit
  const [strategy, setStrategy] = useState<"A" | "B">("A"); // Default WFH-first

  // State for holidays and optimization results
  const [holidays, setHolidays] = useState(getPhilippineHolidays(selectedYear));
  const [customHolidays, setCustomHolidays] = useState<Date[]>([]);
  const [optimizedPlan, setOptimizedPlan] = useState<OptimizedPlan | null>(null);
  const [fullPlan, setFullPlan] = useState<MultiMonthOptimizedPlan | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // State for user-used leave dates
  const [userLeaveDates, setUserLeaveDates] = useState<Date[]>([]);

  // State for manual WFH dates
  const [manualWfhDates, setManualWfhDates] = useState<Date[]>([]);

  // Undo stack for calendar actions
  const [undoStack, setUndoStack] = useState<{ customHolidays: Date[]; manualWfhDates: Date[] }[]>([]);

  const pushUndo = useCallback(() => {
    setUndoStack(prev => [...prev.slice(-19), { customHolidays: [...customHolidays], manualWfhDates: [...manualWfhDates] }]);
  }, [customHolidays, manualWfhDates]);

  const handleUndo = useCallback(() => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setCustomHolidays(last.customHolidays);
      setManualWfhDates(last.manualWfhDates);
      return prev.slice(0, -1);
    });
  }, []);

  // Combine Philippine holidays with custom holidays
  const getAllHolidays = () => {
    const customHolidayObjects = customHolidays.map(date => ({
      date,
      name: "Custom Holiday",
      isSpecial: true
    }));
    return [...holidays, ...customHolidayObjects];
  };

  // Run optimization using multi-month period
  const handleOptimize = async (customLeaveDates?: Date[], overrideConfig?: {
    maxWfhPerWeek?: number;
    totalLeaves?: number;
    selectedMonth?: number;
    selectedYear?: number;
    optimizationMonths?: number;
  }) => {
    setIsOptimizing(true);
    try {
      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));

      const wfh = overrideConfig?.maxWfhPerWeek ?? maxWfhPerWeek;
      const leaves = overrideConfig?.totalLeaves ?? totalLeaves;
      const months = overrideConfig?.optimizationMonths ?? optimizationMonths;
      const month = overrideConfig?.selectedMonth ?? selectedMonth;
      const year = overrideConfig?.selectedYear ?? selectedYear;

      const today = startOfDay(new Date());
      const endDate = addMonths(today, months);

      const plan = optimizePlanForPeriod(
        today,
        endDate,
        wfh,
        leaves,
        getAllHolidays(),
        strategy,
        manualWfhDates,
        maxLeavesPerMonth
      );
      
      // Store the full multi-month plan
      setFullPlan(plan);

      // Compute month-scoped metrics for the displayed month
      const monthLeaveDates = plan.leaveDates.filter(d => d.getMonth() === month && d.getFullYear() === year);
      const monthWfhDates = plan.wfhDates.filter(d => d.getMonth() === month && d.getFullYear() === year);
      const monthManualWfh = plan.manualWfhDates.filter(d => d.getMonth() === month && d.getFullYear() === year);
      const monthStart = startOfMonth(new Date(year, month));
      const monthEnd = endOfMonth(monthStart);
      const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
      const monthDaysOff = calculateConsecutiveDaysOff(monthDays, getAllHolidays(), monthLeaveDates, [...monthWfhDates, ...monthManualWfh]);
      const monthLongestStreak = monthDaysOff.length > 0 ? Math.max(...monthDaysOff.map(p => p.length)) : 0;

      const currentMonthPlan: OptimizedPlan = {
        month,
        year,
        leaveDates: monthLeaveDates,
        wfhDates: monthWfhDates,
        manualWfhDates: monthManualWfh,
        totalDaysOff: monthDaysOff,
        longestStreak: monthLongestStreak,
        leavesUsed: plan.leavesUsed,
        leavesRemaining: plan.leavesRemaining,
        wfhDaysUsed: plan.wfhDaysUsed,
        strategy: plan.strategy
      };
      
      setOptimizedPlan(currentMonthPlan);
      if (customLeaveDates) {
        setUserLeaveDates(customLeaveDates);
      }
      toast.success(`Schedule optimized for next ${months} month${months > 1 ? 's' : ''}`);
    } catch (error) {
      console.error("Optimization failed:", error);
      toast.error("Failed to optimize schedule. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Initialize with shared config or defaults
  useEffect(() => {
    const sharedConfig = parseShareableURL();
    if (sharedConfig) {
      if (sharedConfig.maxWfhPerWeek !== undefined) setMaxWfhPerWeek(sharedConfig.maxWfhPerWeek);
      if (sharedConfig.totalLeaves !== undefined) setTotalLeaves(sharedConfig.totalLeaves);
      if (sharedConfig.selectedMonth !== undefined) setSelectedMonth(sharedConfig.selectedMonth);
      if (sharedConfig.selectedYear !== undefined) setSelectedYear(sharedConfig.selectedYear);
      handleOptimize(undefined, sharedConfig);
    } else {
      handleOptimize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handler for clicking a date in the calendar - now toggles custom holidays
  const handleDateClick = (date: Date) => {
    pushUndo();
    const isCustomHoliday = customHolidays.some(d => isSameDay(d, date));

    if (isCustomHoliday) {
      const updated = customHolidays.filter(d => !isSameDay(d, date));
      setCustomHolidays(updated);
    } else {
      if (!isWeekend(date) && !isHoliday(date, holidays)) {
        const updated = [...customHolidays, date];
        setCustomHolidays(updated);
      }
    }
  };

  // Handler for double-clicking a date - toggles manual WFH
  const handleDateDoubleClick = (date: Date) => {
    pushUndo();
    const isManualWfh = manualWfhDates.some(d => isSameDay(d, date));

    if (isManualWfh) {
      const updated = manualWfhDates.filter(d => !isSameDay(d, date));
      setManualWfhDates(updated);
    } else {
      if (!isWeekend(date) && !isHoliday(date, holidays)) {
        const updated = [...manualWfhDates, date];
        setManualWfhDates(updated);
      }
    }
  };

  // Auto-reoptimize when custom holidays or manual WFH dates change
  useEffect(() => {
    if (optimizedPlan) {
      handleOptimize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customHolidays, manualWfhDates]);

  // Update holidays when year changes
  useEffect(() => {
    setHolidays(getPhilippineHolidays(selectedYear));
    if (optimizedPlan) {
      handleOptimize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  // Get current month and date string
  const currentMonthName = getMonthName(currentDate.getMonth());
  const currentDay = currentDate.getDate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background p-4 md:p-6">
      {/* Top bar with theme toggle */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end gap-2 mb-4">
          {undoStack.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              className="flex items-center gap-1"
              title="Undo last calendar action"
            >
              <Undo2 className="h-4 w-4" />
              Undo
            </Button>
          )}
          <ThemeToggle />
        </div>

        {/* Display current month and date prominently */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            {currentMonthName} {currentDay}, {currentDate.getFullYear()}
          </h1>
        </div>

        <HolidayInfo />

        {selectedYear !== 2025 && selectedYear !== 2026 && (
          <Alert className="mb-6">
            <AlertDescription>
              Holiday data for {selectedYear} is approximate and based on the 2026 template. Actual holidays may differ once the government issues the official proclamation.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <HolidayCalendar
              month={selectedMonth}
              year={selectedYear}
              holidays={getAllHolidays()}
              leaveDates={[
                ...(Array.isArray(userLeaveDates) ? userLeaveDates : []),
                ...(optimizedPlan?.leaveDates || [])
              ]}
              wfhDates={optimizedPlan?.wfhDates || []}
              customHolidays={customHolidays}
              manualWfhDates={manualWfhDates}
              onDateClick={handleDateClick}
              onDateDoubleClick={handleDateDoubleClick}
            />
          </div>
          
          <div>
            <ControlPanel
              maxWfhPerWeek={maxWfhPerWeek}
              setMaxWfhPerWeek={setMaxWfhPerWeek}
              totalLeaves={totalLeaves}
              setTotalLeaves={setTotalLeaves}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              optimizationMonths={optimizationMonths}
              setOptimizationMonths={setOptimizationMonths}
              maxLeavesPerMonth={maxLeavesPerMonth}
              setMaxLeavesPerMonth={setMaxLeavesPerMonth}
              strategy={strategy}
              setStrategy={setStrategy}
              onOptimize={handleOptimize}
            />
          </div>
        </div>
        
        <div className="mb-6">
          <ResultsPanel
            plan={optimizedPlan}
            fullPlan={fullPlan}
            selectedMonth={getMonthName(selectedMonth)}
            holidays={holidays}
            customHolidays={customHolidays}
            month={selectedMonth}
            year={selectedYear}
            maxWfhPerWeek={maxWfhPerWeek}
            totalLeaves={totalLeaves}
            optimizationMonths={optimizationMonths}
          />
        </div>
        
        <footer className="mt-10 text-center text-sm text-muted-foreground">
  <p>Philippine Holiday Optimizer | Data based on 2026 Philippine holidays</p>
  <div className="mt-2 flex flex-col md:flex-row justify-center items-center gap-2">
    <span>
      Built with <span role="img" aria-label="love">❤️</span> by <a
        href="https://github.com/jovenpaoloangeles"
        className="underline hover:text-primary transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >Joven Angeles</a>
    </span>
  </div>
</footer>
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
