
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
  customHolidays?: Date[];
  onDateClick?: (date: Date) => void;
}

const HolidayCalendar: React.FC<HolidayCalendarProps> = ({
  month,
  year,
  holidays,
  leaveDates,
  wfhDates,
  customHolidays = [],
  onDateClick
}) => {
  try {
    // Validate inputs
    if (typeof month !== 'number' || typeof year !== 'number') {
      return <div>Error: Invalid date parameters</div>;
    }
    
    if (!Array.isArray(holidays)) {
      return <div>Error: Invalid holidays data</div>;
    }
    
    if (!Array.isArray(leaveDates)) {
      return <div>Error: Invalid leave dates data</div>;
    }
    
    if (!Array.isArray(wfhDates)) {
      return <div>Error: Invalid WFH dates data</div>;
    }
    
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
          {days.map((day, dayIndex) => {
            try {
              if (!day || !(day instanceof Date)) {
                return <div key={`invalid-${dayIndex}`} className="h-14 p-1 border rounded-md bg-red-100">Invalid</div>;
              }

              const holiday = isHoliday(day, holidays);
              const isCustomHoliday = customHolidays.some(date => date && isSameDay(date, day));
              const isLeaveDay = leaveDates.some(date => date && isSameDay(date, day));
              const isWfhDay = wfhDates.some(date => date && isSameDay(date, day));
              
              let cellClass = "h-14 p-1 border rounded-md relative cursor-pointer hover:bg-muted/50";
              
              if (holiday) {
                cellClass += " bg-accent/30";
              } else if (isCustomHoliday) {
                cellClass += " bg-orange-500/20 border-orange-500/40";
              } else if (isLeaveDay) {
                cellClass += " bg-secondary/30";
              } else if (isWfhDay) {
                cellClass += " bg-primary/30";
              } else if (isWeekend(day)) {
                cellClass += " bg-muted/30";
              }
              
              return (
                <div
                  key={day.getTime()}
                  className={cellClass}
                  onClick={() => {
                    if (onDateClick) onDateClick(day);
                  }}
                  title={isCustomHoliday ? "Custom Holiday (click to remove)" : "Click to add custom holiday"}
                >
                  <div className="text-right text-sm">{format(day, 'd')}</div>
                  
                  {holiday && holiday.name && (
                    <Badge variant="outline" className={`
                      absolute bottom-1 left-1 right-1 text-xs justify-center
                      ${holiday.isSpecial ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'}
                    `}>
                      {holiday.name.length > 10
                        ? `${holiday.name.substring(0, 10)}...`
                        : holiday.name}
                    </Badge>
                  )}
                  
                  {isCustomHoliday && !holiday && (
                    <Badge className="absolute bottom-1 left-1 right-1 text-xs justify-center bg-orange-500 text-white">
                      Custom
                    </Badge>
                  )}
                  
                  {isLeaveDay && !holiday && !isCustomHoliday && (
                    <Badge className="absolute bottom-1 left-1 right-1 text-xs justify-center bg-secondary text-secondary-foreground">
                      Leave
                    </Badge>
                  )}
                  
                  {isWfhDay && !holiday && !isLeaveDay && !isCustomHoliday && (
                    <Badge className="absolute bottom-1 left-1 right-1 text-xs justify-center bg-primary text-primary-foreground">
                      WFH
                    </Badge>
                  )}
                </div>
              );
            } catch (dayError) {
              return (
                <div key={`error-${dayIndex}`} className="h-14 p-1 border rounded-md bg-red-100">
                  <div className="text-xs text-red-600">Error</div>
                </div>
              );
            }
          })}
        </div>
      </CardContent>
    </Card>
  );
  } catch (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Calendar Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">
            Failed to render calendar. Please try refreshing the page.
          </div>
        </CardContent>
      </Card>
    );
  }
};

export default HolidayCalendar;
