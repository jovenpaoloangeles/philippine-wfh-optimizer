
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import HolidayCalendar from '@/components/HolidayCalendar';
import ControlPanel from '@/components/ControlPanel';
import ResultsPanel from '@/components/ResultsPanel';
import HolidayInfo from '@/components/HolidayInfo';
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Top bar with View on GitHub button */}
      <div className="max-w-7xl mx-auto">

        {/* Display current month and date prominently */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">
            {currentMonthName} {currentDay}, {currentDate.getFullYear()}
          </h1>
        </div>

        <HolidayInfo />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          
          <div className="space-y-6">
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
            
            <ResultsPanel
              plan={optimizedPlan}
              selectedMonth={getMonthName(selectedMonth)}
            />
          </div>
        </div>
        
        <footer className="mt-10 text-center text-sm text-muted-foreground">
  <p>Philippine Holiday Optimizer | Data based on 2025 Philippine holidays</p>
  <div className="mt-2 flex flex-col md:flex-row justify-center items-center gap-2">
    <a
      href="https://github.com/jovenpaoloangeles/cuti-ph-optimizer"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 shadow-sm transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-4 h-4 mr-2"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.238-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.339-2.221-.253-4.555-1.112-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.6 9.6 0 0 1 2.504.337c1.909-1.295 2.748-1.025 2.748-1.025.545 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.339-.012 2.421-.012 2.751 0 .268.18.58.688.482C19.138 20.2 22 16.448 22 12.021 22 6.484 17.523 2 12 2Z"
        />
      </svg>
      View on GitHub
    </a>
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
