
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const MAX_LEAVES = 30;
export const MAX_WFH_PER_WEEK = 5;
export const MAX_OPTIMIZATION_MONTHS = 12;

interface ControlPanelProps {
  maxWfhPerWeek: number;
  setMaxWfhPerWeek: (value: number) => void;
  totalLeaves: number;
  setTotalLeaves: (value: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  optimizationMonths: number;
  setOptimizationMonths: (months: number) => void;
  maxLeavesPerMonth: number;
  setMaxLeavesPerMonth: (value: number) => void;
  strategy: "A" | "B";
  setStrategy: (strategy: "A" | "B") => void;
  onOptimize: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  maxWfhPerWeek,
  setMaxWfhPerWeek,
  totalLeaves,
  setTotalLeaves,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  optimizationMonths,
  setOptimizationMonths,
  maxLeavesPerMonth,
  setMaxLeavesPerMonth,
  strategy,
  setStrategy,
  onOptimize
}) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 2 + i); // 2 years back, 7 years forward

  const validateInputs = (): boolean => {
    const errors: string[] = [];

    if (maxWfhPerWeek < 0 || maxWfhPerWeek > MAX_WFH_PER_WEEK) {
      errors.push(`WFH days per week must be between 0 and ${MAX_WFH_PER_WEEK}`);
    }

    if (totalLeaves < 0 || totalLeaves > MAX_LEAVES) {
      errors.push(`Leave credits must be between 0 and ${MAX_LEAVES}`);
    }

    if (selectedMonth < 0 || selectedMonth > 11) {
      errors.push("Please select a valid month");
    }

    if (selectedYear < currentYear - 2 || selectedYear > currentYear + 7) {
      errors.push("Please select a valid year");
    }

    if (optimizationMonths < 1 || optimizationMonths > MAX_OPTIMIZATION_MONTHS) {
      errors.push(`Optimization range must be between 1 and ${MAX_OPTIMIZATION_MONTHS} months`);
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleOptimize = async () => {
    if (!validateInputs()) return;

    setIsOptimizing(true);
    try {
      await onOptimize();
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleLeavesChange = (value: number) => {
    if (value >= 0 && value <= MAX_LEAVES) {
      setTotalLeaves(value);
      setValidationErrors(prev => prev.filter(err => !err.includes("Leave credits")));
      // Auto-optimize when leave credits change
      if (validateInputs()) {
        onOptimize();
      }
    }
  };

  const handleWfhChange = (value: number) => {
    setMaxWfhPerWeek(value);
    // Auto-optimize when WFH days change
    if (validateInputs()) {
      onOptimize();
    }
  };

  const handleMonthChange = (value: string) => {
    setSelectedMonth(parseInt(value));
    if (validateInputs()) {
      onOptimize();
    }
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(parseInt(value));
    if (validateInputs()) {
      onOptimize();
    }
  };

  const handleOptimizationMonthsChange = (value: number) => {
    setOptimizationMonths(value);
    if (validateInputs()) {
      onOptimize();
    }
  };

  const handleStrategyChange = (value: string) => {
    setStrategy(value as "A" | "B");
    if (validateInputs()) {
      onOptimize();
    }
  };

  const handleMaxLeavesPerMonthChange = (value: number) => {
    setMaxLeavesPerMonth(value);
    if (validateInputs()) {
      onOptimize();
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Optimization Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="wfh-slider">Max WFH Days Per Week</Label>
            <span className="text-lg font-medium text-primary">{maxWfhPerWeek}</span>
          </div>
          <Slider 
            id="wfh-slider"
            min={0} 
            max={5} 
            step={1} 
            value={[maxWfhPerWeek]}
            onValueChange={(value) => handleWfhChange(value[0])}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="leaves-slider">Available Leave Credits</Label>
            <span className="text-lg font-medium text-primary">{totalLeaves}</span>
          </div>
          <Slider
            id="leaves-slider"
            min={0}
            max={MAX_LEAVES}
            step={1} 
            value={[totalLeaves]}
            onValueChange={(value) => handleLeavesChange(value[0])}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="month-select">Month</Label>
            <Select
              value={selectedMonth.toString()}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger id="month-select">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={month} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="year-select">Year</Label>
            <Select
              value={selectedYear.toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger id="year-select">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="range-slider">Optimization Range</Label>
            <span className="text-sm font-medium text-primary">{optimizationMonths} months</span>
          </div>
          <Slider 
            id="range-slider"
            min={1} 
            max={6} 
            step={1} 
            value={[optimizationMonths]}
            onValueChange={(value) => handleOptimizationMonthsChange(value[0])}
          />
          <p className="text-xs text-muted-foreground">
            Optimize schedule across {optimizationMonths} month{optimizationMonths > 1 ? 's' : ''} starting from today
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="leaves-per-month-slider">Max Leaves Per Month</Label>
            <span className="text-sm font-medium text-primary">{maxLeavesPerMonth === MAX_LEAVES ? 'No limit' : maxLeavesPerMonth}</span>
          </div>
          <Slider
            id="leaves-per-month-slider"
            min={1}
            max={MAX_LEAVES}
            step={1}
            value={[Math.min(maxLeavesPerMonth, MAX_LEAVES)]}
            onValueChange={(value) => handleMaxLeavesPerMonthChange(value[0])}
          />
          <p className="text-xs text-muted-foreground">
            {maxLeavesPerMonth >= MAX_LEAVES
              ? 'No per-month limit on leave allocation'
              : `At most ${maxLeavesPerMonth} leave{maxLeavesPerMonth > 1 ? 's' : ''} per month`}
          </p>
        </div>

        <div className="space-y-2">
          <Label>Optimization Strategy</Label>
          <Select value={strategy} onValueChange={handleStrategyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">Strategy A: WFH First</SelectItem>
              <SelectItem value="B">Strategy B: Leave First</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {strategy === "A"
              ? "Prioritizes WFH days (more constrained) before using leave credits"
              : "Prioritizes leave credits before using WFH days"}
          </p>
        </div>

        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              <ul className="list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        <Button 
          className="w-full bg-primary hover:bg-primary/90" 
          onClick={handleOptimize}
          disabled={isOptimizing || validationErrors.length > 0}
        >
          {isOptimizing ? "Optimizing..." : "Optimize My Schedule"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;
