
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const years = [2025, 2026, 2027, 2028, 2029];
  
  return (
    <Card>
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
          <Label htmlFor="leaves-input">Available Leave Credits</Label>
          <div className="flex">
            <Input
              id="leaves-input"
              type="number"
              min={0}
              value={totalLeaves}
              onChange={(e) => setTotalLeaves(parseInt(e.target.value) || 0)}
              className="w-full"
            />
          </div>
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
        
        <Button 
          className="w-full bg-ph-blue hover:bg-ph-blue/90" 
          onClick={onOptimize}
        >
          Optimize My Schedule
        </Button>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;
