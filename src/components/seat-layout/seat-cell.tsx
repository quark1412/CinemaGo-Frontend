"use client";

import { cn } from "@/lib/utils";
import { SeatType, SEAT_COLORS, SeatPosition } from "@/types/seat";

interface SeatCellProps {
  seat: SeatPosition;
  isSelected?: boolean;
  onClick?: (seat: SeatPosition) => void;
  onContextMenu?: (seat: SeatPosition, event: React.MouseEvent) => void;
  onMouseDown?: () => void;
  onMouseEnter?: () => void;
  className?: string;
}

export function SeatCell({
  seat,
  isSelected = false,
  onClick,
  onContextMenu,
  onMouseDown,
  onMouseEnter,
  className,
}: SeatCellProps) {
  const handleClick = () => {
    onClick?.(seat);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(seat, e);
  };

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
      default:
        return "";
    }
  };

  const getSeatContent = () => {
    if (seat.type === SeatType.EMPTY) return "";

    return (
      <div className="flex flex-col items-center justify-center h-full text-xs">
        <span className="text-lg">{getSeatIcon(seat.type)}</span>
        {seat.seatNumber && (
          <span className="text-white font-bold text-[10px] leading-none">
            {seat.seatNumber}
          </span>
        )}
        {seat.isCoupleSeat && (
          <span className="text-white text-[8px] leading-none">COUPLE</span>
        )}
      </div>
    );
  };

  const getCoupleSeatStyles = () => {
    if (!seat.isCoupleSeat || seat.coupleWith === undefined) return "";

    // Determine if this is the left or right seat in the couple
    const isLeftSeat = seat.col < seat.coupleWith;

    if (isLeftSeat) {
      return "rounded-r-none border-r-0";
    } else {
      return "rounded-l-none border-l-0";
    }
  };

  return (
    <div
      className={cn(
        "w-12 h-12 border-2 cursor-pointer transition-all duration-200 select-none",
        "flex items-center justify-center relative",
        seat.isCoupleSeat ? "rounded-lg" : "rounded-lg",
        SEAT_COLORS[seat.type],
        isSelected && "ring-2 ring-purple-500 ring-offset-1",
        seat.type !== SeatType.EMPTY && "shadow-sm hover:shadow-md",
        seat.isCoupleSeat && "border-pink-600 shadow-md",
        seat.isCoupleSeat && getCoupleSeatStyles(),
        className
      )}
      onClick={handleClick}
      onContextMenu={handleRightClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      title={`Row ${seat.row + 1}, Col ${seat.col + 1} - ${seat.type}${
        seat.isCoupleSeat ? " (Couple)" : ""
      }`}
    >
      {getSeatContent()}

      {/* Row/Col indicators for empty seats */}
      {seat.type === SeatType.EMPTY && (
        <span className="text-gray-400 text-xs font-mono">
          {String.fromCharCode(65 + seat.row)}
          {seat.col + 1}
        </span>
      )}
    </div>
  );
}
