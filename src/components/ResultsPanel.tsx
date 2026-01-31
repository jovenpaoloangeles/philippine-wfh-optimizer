
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Share2, Check } from "lucide-react";
import { OptimizedPlan, getFormattedDateRange, exportToCalendar, copyShareableURL } from '../utils/holidayUtils';
import type { Holiday } from '../utils/types';
import { toast } from "sonner";

interface ResultsPanelProps {
  plan: OptimizedPlan | null;
  selectedMonth: string;
  holidays: Holiday[];
  customHolidays: Date[];
  month: number;
  year: number;
  maxWfhPerWeek: number;
  totalLeaves: number;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ plan, selectedMonth, holidays, customHolidays, month, year, maxWfhPerWeek, totalLeaves }) => {
  const [copied, setCopied] = useState(false);
  
  const handleShare = async () => {
    const success = await copyShareableURL(maxWfhPerWeek, totalLeaves, month, year);
    if (success) {
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Failed to copy link");
    }
  };
  // Defensive logging: log the received plan object
  console.log('ResultsPanel received plan:', plan);

  if (!plan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Optimization Results</CardTitle>
          <CardDescription>
            Adjust your preferences and click "Optimize My Schedule" to see recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          No optimization results yet
        </CardContent>
      </Card>
    );
  }

  // Defensive helpers for logging and error catching
  const safeField = (label: string, fn: () => number, fallback: number = 0) => {
    try {
      const value = fn();
      console.log(`ResultsPanel: ${label}:`, value);
      return value;
    } catch (err) {
      console.error(`ResultsPanel ERROR accessing ${label}:`, err);
      return fallback;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimization Results for {selectedMonth}</CardTitle>
        <CardDescription>
          Here's your optimized schedule to maximize time off
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-end gap-2">
          <Button 
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Share'}
          </Button>
          <Button 
            onClick={() => exportToCalendar(holidays, plan, month, year)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Export to Calendar
            <Download className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-primary">
              {safeField('longestStreak', () => plan.longestStreak)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Max Consecutive Days Off
            </div>
          </div>
          
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-secondary">
              {safeField('totalDaysOff', () => plan.totalDaysOff.reduce((sum, period) => sum + period.length, 0))}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Total Days Off
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-green-600">
              {safeField('totalDaysWorkedOnSite', () => {
                const startOfMonth = new Date(plan.year, plan.month, 1);
                const endOfMonth = new Date(plan.year, plan.month + 1, 0);
                
                // Count total weekdays in the month
                let totalWeekdays = 0;
                for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
                  const dayOfWeek = d.getDay();
                  if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Monday-Friday
                    totalWeekdays++;
                  }
                }
                
                // Count holidays that fall on weekdays in this month
                let holidayWeekdays = 0;
                
                // Count regular holidays
                holidays.forEach(holiday => {
                  if (holiday.date.getMonth() === plan.month && holiday.date.getFullYear() === plan.year) {
                    const dayOfWeek = holiday.date.getDay();
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Holiday on weekday
                      holidayWeekdays++;
                    }
                  }
                });
                
                // Count custom holidays
                customHolidays.forEach(customHoliday => {
                  if (customHoliday.getMonth() === plan.month && customHoliday.getFullYear() === plan.year) {
                    const dayOfWeek = customHoliday.getDay();
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Custom holiday on weekday
                      holidayWeekdays++;
                    }
                  }
                });
                
                // Calculate: Total weekdays - (holidays + custom holidays + WFH + leaves)
                const leaveDays = plan.leaveDates.length;
                const wfhDays = plan.wfhDates.length;
                
                return Math.max(0, totalWeekdays - holidayWeekdays - leaveDays - wfhDays);
              })}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Days Worked On Site
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsPanel;
