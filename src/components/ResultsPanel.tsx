
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OptimizedPlan, getFormattedDateRange } from '@/utils/holidayUtils';

interface ResultsPanelProps {
  plan: OptimizedPlan | null;
  selectedMonth: string;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ plan, selectedMonth }) => {
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimization Results for {selectedMonth}</CardTitle>
        <CardDescription>
          Here's your optimized schedule to maximize time off
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-ph-blue">
              {plan.consecutiveDaysOff}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Max Consecutive Days Off
            </div>
          </div>
          
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-ph-red">
              {plan.totalDaysOff}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Total Days Off
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <h4 className="font-medium">Recommended Leave Dates ({plan.regularLeavesUsed})</h4>
            <p className="text-sm text-muted-foreground">
              {getFormattedDateRange(plan.leaveDates)}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium">Recommended Work From Home Dates ({plan.wfhDates.length})</h4>
            <p className="text-sm text-muted-foreground">
              {getFormattedDateRange(plan.wfhDates)}
            </p>
          </div>
        </div>
        
        <div className="bg-accent/30 rounded-lg p-4 mt-4">
          <h4 className="font-medium text-center">Optimization Summary</h4>
          <p className="text-sm mt-2">
            By taking {plan.regularLeavesUsed} leave days and {plan.wfhDates.length} work from home days strategically, 
            you'll enjoy up to {plan.consecutiveDaysOff} consecutive days away from the office this month, with a total of {plan.totalDaysOff} days off!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsPanel;
