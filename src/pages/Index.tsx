
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
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

import { isSameDay, isWeekend, addMonths, startOfDay } from "date-fns";
import { parseShareableURL } from '../utils/shareUtils';

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

  // State for holidays and optimization results
  const [holidays, setHolidays] = useState(getPhilippineHolidays(selectedYear));
  const [customHolidays, setCustomHolidays] = useState<Date[]>([]);
  const [optimizedPlan, setOptimizedPlan] = useState<OptimizedPlan | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // State for user-used leave dates
  const [userLeaveDates, setUserLeaveDates] = useState<Date[]>([]);

  // State for manual WFH dates
  const [manualWfhDates, setManualWfhDates] = useState<Date[]>([]);

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
  const handleOptimize = async (customLeaveDates?: Date[]) => {
    setIsOptimizing(true);
    try {
      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const today = startOfDay(new Date());
      const endDate = addMonths(today, optimizationMonths);
      
      const plan = optimizePlanForPeriod(
        today,
        endDate,
        maxWfhPerWeek,
        totalLeaves,
        getAllHolidays(),
        "A",
        manualWfhDates
      );
      
      // Create an OptimizedPlan for the currently displayed month from the multi-month plan
      const currentMonthPlan: OptimizedPlan = {
        month: selectedMonth,
        year: selectedYear,
        leaveDates: plan.leaveDates.filter(d => d.getMonth() === selectedMonth && d.getFullYear() === selectedYear),
        wfhDates: plan.wfhDates.filter(d => d.getMonth() === selectedMonth && d.getFullYear() === selectedYear),
        manualWfhDates: plan.manualWfhDates.filter(d => d.getMonth() === selectedMonth && d.getFullYear() === selectedYear),
        totalDaysOff: plan.totalDaysOff,
        longestStreak: plan.longestStreak,
        leavesUsed: plan.leavesUsed,
        leavesRemaining: plan.leavesRemaining,
        wfhDaysUsed: plan.wfhDaysUsed,
        strategy: plan.strategy
      };
      
      setOptimizedPlan(currentMonthPlan);
      if (customLeaveDates) {
        setUserLeaveDates(customLeaveDates);
      }
      toast.success(`Schedule optimized for next ${optimizationMonths} month${optimizationMonths > 1 ? 's' : ''}`);
    } catch (error) {
      console.error("Optimization failed:", error);
      toast.error("Failed to optimize schedule. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Initialize with example optimization
  useEffect(() => {
    // Parse URL parameters for shared configuration
    const sharedConfig = parseShareableURL();
    if (sharedConfig) {
      if (sharedConfig.maxWfhPerWeek !== undefined) setMaxWfhPerWeek(sharedConfig.maxWfhPerWeek);
      if (sharedConfig.totalLeaves !== undefined) setTotalLeaves(sharedConfig.totalLeaves);
      if (sharedConfig.selectedMonth !== undefined) setSelectedMonth(sharedConfig.selectedMonth);
      if (sharedConfig.selectedYear !== undefined) setSelectedYear(sharedConfig.selectedYear);
    }
    
    handleOptimize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handler for clicking a date in the calendar - now toggles custom holidays
  const handleDateClick = (date: Date) => {
    // Check if this date is already a custom holiday
    const isCustomHoliday = customHolidays.some(d => isSameDay(d, date));
    
    if (isCustomHoliday) {
      // Remove custom holiday
      const updated = customHolidays.filter(d => !isSameDay(d, date));
      setCustomHolidays(updated);
    } else {
      // Add custom holiday (only if it's not a weekend or existing Philippine holiday)
      if (!isWeekend(date) && !isHoliday(date, holidays)) {
        const updated = [...customHolidays, date];
        setCustomHolidays(updated);
      }
    }
  };

  // Handler for double-clicking a date - toggles manual WFH
  const handleDateDoubleClick = (date: Date) => {
    // Check if this date is already a manual WFH date
    const isManualWfh = manualWfhDates.some(d => isSameDay(d, date));
    
    if (isManualWfh) {
      // Remove manual WFH
      const updated = manualWfhDates.filter(d => !isSameDay(d, date));
      setManualWfhDates(updated);
    } else {
      // Add manual WFH (only if it's not a weekend, holiday, or leave day)
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
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>

        {/* Display current month and date prominently */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            {currentMonthName} {currentDay}, {currentDate.getFullYear()}
          </h1>
        </div>

        <HolidayInfo />

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
              onOptimize={handleOptimize}
            />
          </div>
        </div>
        
        <div className="mb-6">
          <ResultsPanel
            plan={optimizedPlan}
            selectedMonth={getMonthName(selectedMonth)}
            holidays={holidays}
            customHolidays={customHolidays}
            month={selectedMonth}
            year={selectedYear}
            maxWfhPerWeek={maxWfhPerWeek}
            totalLeaves={totalLeaves}
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
