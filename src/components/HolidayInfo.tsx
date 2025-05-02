
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
          Maximize your time off by planning leaves and work-from-home days around weekends and holidays. This tool helps you identify the best days to request leave or WFH.
        </p>
        
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2">
            <Badge className="bg-secondary">Regular Holiday</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-accent text-accent-foreground">Special Holiday</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-secondary">Leave</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary">WFH</Badge>
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
