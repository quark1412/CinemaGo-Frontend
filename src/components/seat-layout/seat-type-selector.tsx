"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeatType, SEAT_LABELS } from "@/types/seat";
import { Armchair, Crown, Sofa, X } from "lucide-react";

interface SeatTypeSelectorProps {
  selectedType: SeatType;
  onTypeSelect: (type: SeatType) => void;
}

export function SeatTypeSelector({
  selectedType,
  onTypeSelect,
}: SeatTypeSelectorProps) {
  const seatTypes = [
    SeatType.NORMAL,
    SeatType.VIP,
    SeatType.COUPLE,
    SeatType.BLOCKED,
  ];

  const getSeatIcon = (type: SeatType) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case SeatType.NORMAL:
        return <Armchair className={iconClass} />;
      case SeatType.VIP:
        return <Crown className={iconClass} />;
      case SeatType.COUPLE:
        return <Sofa className={iconClass} />;
      case SeatType.BLOCKED:
        return <X className={iconClass} />;
      default:
        return null;
    }
  };

  const getSeatButtonStyle = (type: SeatType, isSelected: boolean) => {
    const baseStyle =
      "justify-start gap-3 h-11 font-medium transition-all border-2";

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
        default:
          return `${baseStyle} bg-white hover:bg-gray-50 text-gray-700 border-gray-200`;
      }
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Seat Types</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Right-click on any seat to remove it
        </p>
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
              {getSeatIcon(type)}
              <span className="font-semibold text-sm">{SEAT_LABELS[type]}</span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
