
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Share2, Check } from "lucide-react";
import { exportToCalendar, exportToCalendarForPeriod, copyShareableURL } from '../utils/holidayUtils';
import type { Holiday, MultiMonthOptimizedPlan } from '../utils/types';
import { toast } from "sonner";

interface ResultsPanelProps {
  plan: OptimizedPlan | null;
  fullPlan: MultiMonthOptimizedPlan | null;
  selectedMonth: string;
  holidays: Holiday[];
  customHolidays: Date[];
  month: number;
  year: number;
  maxWfhPerWeek: number;
  totalLeaves: number;
  optimizationMonths: number;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ plan, fullPlan, selectedMonth, holidays, customHolidays, month, year, maxWfhPerWeek, totalLeaves, optimizationMonths }) => {
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

  const monthDaysOff = plan.totalDaysOff.reduce((sum, period) => sum + period.length, 0);
  const periodLongestStreak = fullPlan?.longestStreak ?? plan.longestStreak;
  const periodTotalDaysOff = fullPlan?.totalDaysOff.reduce((sum, period) => sum + period.length, 0) ?? monthDaysOff;

  const calculateDaysWorkedOnSite = () => {
    const startOfMonth = new Date(plan.year, plan.month, 1);
    const endOfMonth = new Date(plan.year, plan.month + 1, 0);

    let totalWeekdays = 0;
    for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        totalWeekdays++;
      }
    }

    let holidayWeekdays = 0;

    holidays.forEach(holiday => {
      if (holiday.date.getMonth() === plan.month && holiday.date.getFullYear() === plan.year) {
        const dayOfWeek = holiday.date.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          holidayWeekdays++;
        }
      }
    });

    customHolidays.forEach(customHoliday => {
      if (customHoliday.getMonth() === plan.month && customHoliday.getFullYear() === plan.year) {
        const dayOfWeek = customHoliday.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          holidayWeekdays++;
        }
      }
    });

    const leaveDays = plan.leaveDates.length;
    const wfhDays = plan.wfhDates.length;

    return Math.max(0, totalWeekdays - holidayWeekdays - leaveDays - wfhDays);
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
            Export This Month
            <Download className="h-4 w-4" />
          </Button>
          {fullPlan && (
            <Button
              onClick={() => exportToCalendarForPeriod(holidays, fullPlan)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Full Plan
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-primary">
              {plan.longestStreak}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Max Consecutive Days Off
            </div>
            <div className="text-xs text-muted-foreground">This month</div>
          </div>

          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-secondary">
              {monthDaysOff}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Total Days Off
            </div>
            <div className="text-xs text-muted-foreground">This month</div>
          </div>

          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-green-600">
              {calculateDaysWorkedOnSite()}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Days Worked On Site
            </div>
            <div className="text-xs text-muted-foreground">This month</div>
          </div>
        </div>

        {fullPlan && (
          <div className="mt-2 rounded-lg border p-4">
            <h4 className="text-sm font-medium mb-3">
              Across {optimizationMonths}-month optimization period
            </h4>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{periodLongestStreak}</div>
                <div className="text-xs text-muted-foreground">Longest Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{periodTotalDaysOff}</div>
                <div className="text-xs text-muted-foreground">Total Days Off</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{fullPlan.leavesUsed}</div>
                <div className="text-xs text-muted-foreground">Leaves Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{fullPlan.leavesRemaining}</div>
                <div className="text-xs text-muted-foreground">Leaves Remaining</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultsPanel;
