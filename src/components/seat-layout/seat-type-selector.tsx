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
    SeatType.DISABLED,
    SeatType.BLOCKED,
  ];

  const getSeatIcon = (type: SeatType) => {
    switch (type) {
      case SeatType.NORMAL:
        return "🪑";
      case SeatType.VIP:
        return "👑";
      case SeatType.COUPLE:
        return "💕";
      case SeatType.DISABLED:
        return "♿";
      case SeatType.BLOCKED:
        return "🚫";
      case SeatType.EMPTY:
        return "⬜";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Seat Types</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {seatTypes.map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? "default" : "outline"}
            className={cn(
              "w-full justify-start gap-3 h-12",
              selectedType === type && "bg-purple-600 hover:bg-purple-700"
            )}
            onClick={() => onTypeSelect(type)}
          >
            <div
              className={cn(
                "w-8 h-8 rounded border-2 flex items-center justify-center text-sm",
                SEAT_COLORS[type]
              )}
            >
              {getSeatIcon(type)}
            </div>
            <span className="font-medium">{SEAT_LABELS[type]}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
