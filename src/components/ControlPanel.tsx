
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ControlPanelProps {
  maxWfhPerWeek: number;
  setMaxWfhPerWeek: (value: number) => void;
  totalLeaves: number;
  setTotalLeaves: (value: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
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

    if (maxWfhPerWeek < 0 || maxWfhPerWeek > 5) {
      errors.push("WFH days per week must be between 0 and 5");
    }

    if (totalLeaves < 0 || totalLeaves > 50) {
      errors.push("Leave credits must be between 0 and 50");
    }

    if (selectedMonth < 0 || selectedMonth > 11) {
      errors.push("Please select a valid month");
    }

    if (selectedYear < currentYear - 2 || selectedYear > currentYear + 7) {
      errors.push("Please select a valid year");
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
    if (value >= 0 && value <= 50) {
      setTotalLeaves(value);
      setValidationErrors(prev => prev.filter(err => !err.includes("Leave credits")));
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
            onValueChange={(value) => setMaxWfhPerWeek(value[0])}
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
            max={10} 
            step={1} 
            value={[totalLeaves]}
            onValueChange={(value) => setTotalLeaves(value[0])}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="month-select">Month</Label>
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
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
              onValueChange={(value) => setSelectedYear(parseInt(value))}
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
