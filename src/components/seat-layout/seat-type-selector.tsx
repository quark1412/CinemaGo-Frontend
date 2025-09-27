"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeatType, SEAT_COLORS, SEAT_LABELS } from "@/types/seat";
import { cn } from "@/lib/utils";

interface SeatTypeSelectorProps {
  selectedType: SeatType;
  onTypeSelect: (type: SeatType) => void;
}

export function SeatTypeSelector({
  selectedType,
  onTypeSelect,
}: SeatTypeSelectorProps) {
  const seatTypes = [
    SeatType.EMPTY,
    SeatType.NORMAL,
    SeatType.VIP,
    SeatType.COUPLE,
    SeatType.BLOCKED,
  ];

  const getSeatIcon = (type: SeatType) => {
    switch (type) {
      case SeatType.NORMAL:
        return "🪑";
      case SeatType.VIP:
        return "⭐";
      case SeatType.COUPLE:
        return "💑";
      case SeatType.BLOCKED:
        return "❌";
      case SeatType.EMPTY:
        return "⚪";
      default:
        return "";
    }
  };

  const getSeatButtonStyle = (type: SeatType, isSelected: boolean) => {
    const baseStyle =
      "justify-start gap-3 h-12 font-medium transition-all border-2";

    if (isSelected) {
      switch (type) {
        case SeatType.NORMAL:
          return `${baseStyle} bg-blue-600 hover:bg-blue-700 text-white border-blue-600`;
        case SeatType.VIP:
          return `${baseStyle} bg-amber-600 hover:bg-amber-700 text-white border-amber-600`;
        case SeatType.COUPLE:
          return `${baseStyle} bg-pink-600 hover:bg-pink-700 text-white border-pink-600`;
        case SeatType.BLOCKED:
          return `${baseStyle} bg-red-600 hover:bg-red-700 text-white border-red-600`;
        case SeatType.EMPTY:
          return `${baseStyle} bg-gray-600 hover:bg-gray-700 text-white border-gray-600`;
        default:
          return `${baseStyle} bg-primary hover:bg-primary/90 text-white border-primary`;
      }
    } else {
      switch (type) {
        case SeatType.NORMAL:
          return `${baseStyle} bg-white hover:bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300`;
        case SeatType.VIP:
          return `${baseStyle} bg-white hover:bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300`;
        case SeatType.COUPLE:
          return `${baseStyle} bg-white hover:bg-pink-50 text-pink-700 border-pink-200 hover:border-pink-300`;
        case SeatType.BLOCKED:
          return `${baseStyle} bg-white hover:bg-red-50 text-red-700 border-red-200 hover:border-red-300`;
        case SeatType.EMPTY:
          return `${baseStyle} bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300`;
        default:
          return `${baseStyle} bg-white hover:bg-gray-50 text-gray-700 border-gray-200`;
      }
    }
  };

  const getSeatIconStyle = (type: SeatType, isSelected: boolean) => {
    const baseStyle =
      "w-8 h-8 rounded-lg border-2 flex items-center justify-center text-lg font-semibold";

    if (isSelected) {
      return `${baseStyle} bg-white/20 border-white/30 text-white`;
    } else {
      switch (type) {
        case SeatType.NORMAL:
          return `${baseStyle} bg-blue-100 border-blue-200 text-blue-600`;
        case SeatType.VIP:
          return `${baseStyle} bg-amber-100 border-amber-200 text-amber-600`;
        case SeatType.COUPLE:
          return `${baseStyle} bg-pink-100 border-pink-200 text-pink-600`;
        case SeatType.BLOCKED:
          return `${baseStyle} bg-red-100 border-red-200 text-red-600`;
        case SeatType.EMPTY:
          return `${baseStyle} bg-gray-100 border-gray-200 text-gray-600`;
        default:
          return `${baseStyle} bg-gray-100 border-gray-200 text-gray-600`;
      }
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Seat Types</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 grid grid-cols-2 gap-3">
        {seatTypes.map((type) => {
          const isSelected = selectedType === type;
          return (
            <Button
              key={type}
              variant="outline"
              className={getSeatButtonStyle(type, isSelected)}
              onClick={() => onTypeSelect(type)}
            >
              <div className={getSeatIconStyle(type, isSelected)}>
                {getSeatIcon(type)}
              </div>
              <span className="font-semibold">{SEAT_LABELS[type]}</span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
