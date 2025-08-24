
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OptimizedPlan, getFormattedDateRange } from '@/utils/holidayUtils';

interface ResultsPanelProps {
  plan: OptimizedPlan | null;
  selectedMonth: string;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ plan, selectedMonth }) => {
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
  const safeField = (label: string, fn: () => any, fallback: any = '—') => {
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
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-primary">
              {safeField('consecutiveDaysOff', () => plan.consecutiveDaysOff)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Max Consecutive Days Off
            </div>
          </div>
          
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-secondary">
              {safeField('totalDaysOff', () => plan.totalDaysOff)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Total Days Off
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsPanel;
