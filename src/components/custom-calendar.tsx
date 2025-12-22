"use client";

import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import isBetweenPlugin from "dayjs/plugin/isBetween";
import { styled, Theme } from "@mui/material/styles";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import type { PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import "dayjs/locale/vi";

dayjs.extend(isBetweenPlugin);

interface CustomPickersDayProps extends PickersDayProps {
  isSelected?: boolean;
  isHovered?: boolean;
}

const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop: string) => {
    const excludedProps = [
      "isSelected",
      "isHovered",
      "isPickerDisabled",
      "isPickerReadOnly",
      "isPickerValueEmpty",
      "isPickerOpen",
      "pickerVariant",
      "pickerOrientation",
      "isDaySelected",
      "isDayDisabled",
      "isDayCurrent",
      "isDayOutsideMonth",
      "isDayStartOfWeek",
      "isDayEndOfWeek",
    ];
    return !excludedProps.includes(prop);
  },
})<CustomPickersDayProps>(
  ({
    theme,
    isSelected,
    isHovered,
    day,
  }: CustomPickersDayProps & { theme?: Theme; day: Dayjs }) => ({
    borderRadius: 0,
    ...(isSelected && {
      backgroundColor: "#0A0A0A",
      color: "#FFF",
      "&:hover, &:focus": {
        backgroundColor: "#5A5A5A",
      },
    }),
    ...(isHovered && {
      backgroundColor: "#5A5A5A",
      color: "#FFF",
      "&:hover, &:focus": {
        backgroundColor: "#0A0A0A",
      },
    }),
    ...(day.day() === 1 && {
      borderTopLeftRadius: "8px",
      borderBottomLeftRadius: "8px",
    }),
    ...(day.day() === 0 && {
      borderTopRightRadius: "8px",
      borderBottomRightRadius: "8px",
    }),
  })
);

const isInSameWeek = (dayA: Dayjs, dayB: Dayjs | null): boolean => {
  if (dayB == null) {
    return false;
  }
  return dayA.isSame(dayB, "week");
};

function Day(
  props: PickersDayProps & {
    selectedDay?: Dayjs | null;
    hoveredDay?: Dayjs | null;
  }
) {
  const { day, selectedDay, hoveredDay, ...other } = props;

  return (
    <CustomPickersDay
      {...other}
      day={day}
      sx={{ px: 2.5 }}
      disableMargin
      selected={false}
      isSelected={isInSameWeek(day as Dayjs, selectedDay ?? null)}
      isHovered={isInSameWeek(day as Dayjs, hoveredDay ?? null)}
    />
  );
}

export type TimeOption = "week" | "month" | "year";

export interface CustomCalendarProps {
  value: Dayjs | null;
  timeOption: TimeOption;
  onDateChange: (newValue: Dayjs | null) => void;
  className?: string;
}

export function CustomCalendar({
  value,
  timeOption,
  onDateChange,
  className,
}: CustomCalendarProps) {
  const [hoveredDay, setHoveredDay] = useState<Dayjs | null>(null);

  const handleDateChange = (newValue: Dayjs | null) => {
    onDateChange(newValue);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <div
        className={`flex h-[300px] absolute flex-row border border-[#0A0A0A] overflow-hidden z-[2] bg-white ${
          className || ""
        }`}
      >
        {timeOption === "week" && (
          <div className="h-[300px] w-[300px] rounded-lg bg-white z-[2]">
            <DateCalendar
              dayOfWeekFormatter={(weekday: Dayjs) =>
                `${weekday.format("dd")}.`
              }
              className="w-[300px] h-[300px]"
              value={value}
              onChange={handleDateChange}
              showDaysOutsideCurrentMonth
              slots={{ day: Day }}
              slotProps={{
                day: (ownerState: any) => {
                  const {
                    isPickerDisabled,
                    isPickerReadOnly,
                    isPickerValueEmpty,
                    isPickerOpen,
                    pickerVariant,
                    pickerOrientation,
                    isDaySelected,
                    isDayDisabled,
                    isDayCurrent,
                    isDayOutsideMonth,
                    isDayStartOfWeek,
                    isDayEndOfWeek,
                    ...validProps
                  } = ownerState;

                  return {
                    ...validProps,
                    selectedDay: value,
                    hoveredDay,
                    onPointerEnter: () => {
                      setHoveredDay(ownerState.day as Dayjs);
                    },
                    onPointerLeave: () => setHoveredDay(null),
                  } as PickersDayProps & {
                    selectedDay?: Dayjs | null;
                    hoveredDay?: Dayjs | null;
                  };
                },
              }}
            />
          </div>
        )}
        {timeOption === "month" && (
          <div className="h-[300px] max-h-[300px] w-[300px] rounded-lg bg-white z-[2]">
            <DateCalendar
              value={value}
              views={["month", "year"]}
              openTo="month"
              onMonthChange={handleDateChange}
            />
          </div>
        )}
        {timeOption === "year" && (
          <div className="h-[300px] max-h-[300px] w-[300px] rounded-lg bg-white z-[2]">
            <DateCalendar
              value={value}
              views={["year"]}
              openTo="year"
              onChange={handleDateChange}
            />
          </div>
        )}
      </div>
    </LocalizationProvider>
  );
}

export default CustomCalendar;
