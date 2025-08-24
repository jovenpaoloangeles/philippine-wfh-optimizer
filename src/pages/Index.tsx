
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import HolidayCalendar from '@/components/HolidayCalendar';
import ControlPanel from '@/components/ControlPanel';
import ResultsPanel from '@/components/ResultsPanel';
import HolidayInfo from '@/components/HolidayInfo';
import ThemeToggle from '@/components/ThemeToggle';
import { getPhilippineHolidays, optimizePlanForMonth, getMonthName, OptimizedPlan } from '@/utils/holidayUtils';

import { isSameDay, isWeekend } from "date-fns";
import { isHoliday } from "../utils/holidayUtils";

const Index = () => {
  // Current date for default values
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // State for controls
  const [maxWfhPerWeek, setMaxWfhPerWeek] = useState<number>(2);
  const [totalLeaves, setTotalLeaves] = useState<number>(5);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // Current month
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // State for holidays and optimization results
  const [holidays, setHolidays] = useState(getPhilippineHolidays());
  const [customHolidays, setCustomHolidays] = useState<Date[]>([]);
  const [optimizedPlan, setOptimizedPlan] = useState<OptimizedPlan | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // State for user-used leave dates
  const [userLeaveDates, setUserLeaveDates] = useState<Date[]>([]);

  // Combine Philippine holidays with custom holidays
  const getAllHolidays = () => {
    const customHolidayObjects = customHolidays.map(date => ({
      date,
      name: "Custom Holiday",
      isSpecial: true
    }));
    return [...holidays, ...customHolidayObjects];
  };

  // Run optimization
  const handleOptimize = async (customLeaveDates?: Date[]) => {
    setIsOptimizing(true);
    try {
      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const plan = optimizePlanForMonth(
        selectedMonth,
        selectedYear,
        maxWfhPerWeek,
        totalLeaves,
        getAllHolidays()
      );
      
      setOptimizedPlan(plan);
      if (customLeaveDates) {
        setUserLeaveDates(customLeaveDates);
      }
      toast.success(`Schedule optimized for ${getMonthName(selectedMonth)} ${selectedYear}`);
    } catch (error) {
      console.error("Optimization failed:", error);
      toast.error("Failed to optimize schedule. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Initialize with example optimization
  useEffect(() => {
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

  // Auto-reoptimize when custom holidays change
  useEffect(() => {
    if (optimizedPlan) {
      handleOptimize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customHolidays]);

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
              onDateClick={handleDateClick}
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
              onOptimize={handleOptimize}
            />
          </div>
        </div>
        
        <div className="mb-6">
          <ResultsPanel
            plan={optimizedPlan}
            selectedMonth={getMonthName(selectedMonth)}
          />
        </div>
        
        <footer className="mt-10 text-center text-sm text-muted-foreground">
  <p>Philippine Holiday Optimizer | Data based on 2025 Philippine holidays</p>
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
