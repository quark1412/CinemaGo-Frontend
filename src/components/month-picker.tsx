"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";

interface MonthPickerProps {
  selectedDate: dayjs.Dayjs;
  onSelect: (date: Date) => void;
  currentYear: number;
  onYearChange: (year: number) => void;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function MonthPicker({
  selectedDate,
  onSelect,
  currentYear,
  onYearChange,
}: MonthPickerProps) {
  const selectedMonth = selectedDate.month();

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = dayjs(`${currentYear}-${monthIndex + 1}-1`);
    onSelect(newDate.toDate());
  };

  const years = React.useMemo(() => {
    const currentYearNum = dayjs().year();
    const yearsList: number[] = [];
    for (let i = currentYearNum - 10; i <= currentYearNum + 10; i++) {
      yearsList.push(i);
    }
    return yearsList;
  }, []);

  return (
    <div className="p-3 w-[280px]">
      {/* Header with year dropdown */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-foreground">
            {MONTHS[selectedMonth]} {currentYear}
          </span>
          <select
            value={currentYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="bg-transparent border-none outline-none cursor-pointer text-sm font-medium text-foreground appearance-none pr-4 relative"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 4.5L6 7.5L9 4.5'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right center",
              paddingRight: "20px",
            }}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-3 gap-2">
        {MONTHS.map((month, index) => {
          const isSelected = index === selectedMonth;
          return (
            <Button
              key={month}
              variant="ghost"
              className={cn(
                "h-10 w-full text-sm font-normal",
                isSelected
                  ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => handleMonthSelect(index)}
            >
              {month}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
