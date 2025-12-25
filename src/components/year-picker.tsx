"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";

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

interface YearPickerProps {
  selectedDate: dayjs.Dayjs;
  onSelect: (date: Date) => void;
}

export function YearPicker({ selectedDate, onSelect }: YearPickerProps) {
  const selectedYear = selectedDate.year();
  const currentYear = dayjs().year();

  // Generate years around the selected year (20 years range: 10 before, 10 after)
  const years = React.useMemo(() => {
    const startYear = Math.floor(selectedYear / 10) * 10 - 10;
    const yearsList: number[] = [];
    for (let i = startYear; i < startYear + 20; i++) {
      yearsList.push(i);
    }
    return yearsList;
  }, [selectedYear]);

  const handleYearSelect = (year: number) => {
    const newDate = dayjs(`${year}-1-1`);
    onSelect(newDate.toDate());
  };

  const handlePreviousDecade = () => {
    const newYear = Math.floor(selectedYear / 10) * 10 - 20;
    const newDate = dayjs(`${newYear}-1-1`);
    onSelect(newDate.toDate());
  };

  const handleNextDecade = () => {
    const newYear = Math.floor(selectedYear / 10) * 10 + 20;
    const newDate = dayjs(`${newYear}-1-1`);
    onSelect(newDate.toDate());
  };

  const decadeStart = Math.floor(selectedYear / 10) * 10 - 10;
  const decadeEnd = decadeStart + 19;

  return (
    <div className="p-3 w-[280px]">
      {/* Header with month/year and navigation */}
      <div className="flex items-center justify-between mb-4 px-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handlePreviousDecade}
        >
          <span className="sr-only">Previous decade</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7.5 3L4.5 6L7.5 9" />
          </svg>
        </Button>
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-foreground">
            {MONTHS[selectedDate.month()]} {selectedYear}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground"
          >
            <path d="M3 4.5L6 7.5L9 4.5" />
          </svg>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleNextDecade}
        >
          <span className="sr-only">Next decade</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4.5 3L7.5 6L4.5 9" />
          </svg>
        </Button>
      </div>

      {/* Year grid */}
      <div className="grid grid-cols-4 gap-2">
        {years.map((year) => {
          const isSelected = year === selectedYear;
          const isCurrentYear = year === currentYear;
          return (
            <Button
              key={year}
              variant="ghost"
              className={cn(
                "h-10 w-full text-sm font-normal",
                isSelected
                  ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground",
                isCurrentYear && !isSelected && "font-semibold"
              )}
              onClick={() => handleYearSelect(year)}
            >
              {year}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
