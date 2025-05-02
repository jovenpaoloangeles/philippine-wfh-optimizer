
import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWeekend } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Holiday, isHoliday } from '@/utils/holidayUtils';

interface HolidayCalendarProps {
  month: number;
  year: number;
  holidays: Holiday[];
  leaveDates: Date[];
  wfhDates: Date[];
}

const HolidayCalendar: React.FC<HolidayCalendarProps> = ({ 
  month, 
  year, 
  holidays, 
  leaveDates,
  wfhDates
}) => {
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Day names for header
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Determine offset for the first day of the month
  const firstDayOffset = monthStart.getDay();
  const emptyDays = Array(firstDayOffset).fill(null);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">{format(monthStart, 'MMMM yyyy')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {/* Calendar header with day names */}
          {dayNames.map((day, index) => (
            <div 
              key={day} 
              className={`text-center py-2 font-medium text-sm ${
                index === 0 || index === 6 ? 'text-secondary' : ''
              }`}
            >
              {day}
            </div>
          ))}
          
          {/* Empty cells for offset */}
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="h-14 p-1"></div>
          ))}
          
          {/* Calendar days */}
          {days.map(day => {
            const holiday = isHoliday(day, holidays);
            const isLeaveDay = leaveDates.some(date => isSameDay(date, day));
            const isWfhDay = wfhDates.some(date => isSameDay(date, day));
            
            let cellClass = "h-14 p-1 border rounded-md relative";
            
            if (holiday) {
              cellClass += " bg-accent/30";
            } else if (isLeaveDay) {
              cellClass += " bg-secondary/20";
            } else if (isWfhDay) {
              cellClass += " bg-primary/20";
            } else if (isWeekend(day)) {
              cellClass += " bg-gray-100";
            }
            
            return (
              <div key={day.toString()} className={cellClass}>
                <div className="text-right text-sm">{format(day, 'd')}</div>
                
                {holiday && (
                  <Badge variant="outline" className={`
                    absolute bottom-1 left-1 right-1 text-xs justify-center
                    ${holiday.isSpecial ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'}
                  `}>
                    {holiday.name.length > 10 
                      ? `${holiday.name.substring(0, 10)}...` 
                      : holiday.name}
                  </Badge>
                )}
                
                {isLeaveDay && !holiday && (
                  <Badge className="absolute bottom-1 left-1 right-1 text-xs justify-center bg-secondary text-secondary-foreground">
                    Leave
                  </Badge>
                )}
                
                {isWfhDay && !holiday && !isLeaveDay && (
                  <Badge className="absolute bottom-1 left-1 right-1 text-xs justify-center bg-primary text-primary-foreground">
                    WFH
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default HolidayCalendar;
