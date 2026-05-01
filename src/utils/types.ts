export interface Holiday {
  date: Date;
  name: string;
  isSpecial: boolean;
}

export interface OptimizedPlan {
  month: number;
  year: number;
  leaveDates: Date[];
  wfhDates: Date[];
  manualWfhDates: Date[];
  totalDaysOff: { start: Date; end: Date; length: number }[];
  longestStreak: number;
  leavesUsed: number;
  leavesRemaining: number;
  wfhDaysUsed: number;
  strategy: "A" | "B";
}

export interface MultiMonthOptimizedPlan {
  startDate: Date;
  endDate: Date;
  leaveDates: Date[];
  wfhDates: Date[];
  manualWfhDates: Date[];
  totalDaysOff: { start: Date; end: Date; length: number }[];
  longestStreak: number;
  leavesUsed: number;
  leavesRemaining: number;
  wfhDaysUsed: number;
  strategy: "A" | "B";
  monthBreakdown: {
    month: number;
    year: number;
    leaveDates: Date[];
    wfhDates: Date[];
  }[];
}
