export interface Holiday {
  date: Date;
  name: string;
  isSpecial: boolean;
}

export interface LeaveDetail {
  date: Date;
  type: "full";
}

export interface OptimizedPlan {
  month: number;
  year: number;
  leaveDates: Date[];
  wfhDates: Date[];
  totalDaysOff: { start: Date; end: Date; length: number }[];
  longestStreak: number;
  leavesUsed: number;
  leavesRemaining: number;
  wfhDaysUsed: number;
  strategy: "A" | "B";
}
