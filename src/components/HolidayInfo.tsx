
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const HolidayInfo: React.FC = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Philippine Holiday Optimizer</CardTitle>
        <CardDescription>
          Plan your leaves and work-from-home days strategically around Philippine holidays
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Maximize your time off by planning leaves and work-from-home days around weekends and holidays. 
          This tool helps you identify the best days to request leave or WFH to create extended breaks.
        </p>
        
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">How it works:</h3>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>Our algorithm identifies optimal days for leave and WFH requests</li>
            <li>Days adjacent to holidays and weekends get priority</li>
            <li>"Bridge days" between holidays/weekends are highly recommended</li>
            <li>Mondays and Fridays are prioritized for extending weekends</li>
          </ul>
        </div>
        
        <Separator className="my-4" />
        
        <h3 className="text-sm font-medium mb-2">Legend:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-secondary">Regular Holiday</Badge>
            <span className="text-xs text-muted-foreground">(Paid)</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-accent text-accent-foreground">Special Holiday</Badge>
            <span className="text-xs text-muted-foreground">(Optional)</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-secondary">Leave</Badge>
            <span className="text-xs text-muted-foreground">(Recommended)</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary">WFH</Badge>
            <span className="text-xs text-muted-foreground">(Strategic)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-100 rounded"></div>
            <span className="text-sm">Weekend</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HolidayInfo;
