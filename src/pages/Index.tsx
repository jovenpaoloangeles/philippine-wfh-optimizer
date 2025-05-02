
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import HolidayCalendar from '@/components/HolidayCalendar';
import ControlPanel from '@/components/ControlPanel';
import ResultsPanel from '@/components/ResultsPanel';
import HolidayInfo from '@/components/HolidayInfo';
import { getPhilippineHolidays, optimizePlanForMonth, getMonthName, OptimizedPlan } from '@/utils/holidayUtils';

const Index = () => {
  // Current date for default values
  const currentDate = new Date();
  const currentYear = 2025; // Using 2025 as the starting point
  
  // State for controls
  const [maxWfhPerWeek, setMaxWfhPerWeek] = useState<number>(2);
  const [totalLeaves, setTotalLeaves] = useState<number>(5);
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // January
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  
  // State for holidays and optimization results
  const [holidays, setHolidays] = useState(getPhilippineHolidays());
  const [optimizedPlan, setOptimizedPlan] = useState<OptimizedPlan | null>(null);
  
  // Run optimization
  const handleOptimize = () => {
    const plan = optimizePlanForMonth(
      selectedMonth,
      selectedYear,
      maxWfhPerWeek,
      totalLeaves,
      holidays
    );
    
    setOptimizedPlan(plan);
    toast.success(`Schedule optimized for ${getMonthName(selectedMonth)} ${selectedYear}`);
  };
  
  // Initialize with example optimization
  useEffect(() => {
    handleOptimize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <HolidayInfo />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <HolidayCalendar
              month={selectedMonth}
              year={selectedYear}
              holidays={holidays}
              leaveDates={optimizedPlan?.leaveDates || []}
              wfhDates={optimizedPlan?.wfhDates || []}
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
        </footer>
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
