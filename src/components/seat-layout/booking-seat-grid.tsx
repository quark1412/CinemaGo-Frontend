"use client";

import { SeatLayout, SeatPosition, SeatType } from "@/types/seat";
import { cn } from "@/lib/utils";
import { Sofa, Armchair, Crown, X } from "lucide-react";

type SeatStatus = "available" | "booked" | "held" | "selected";

interface BookingSeatGridProps {
  layout: SeatLayout;
  bookedSeatNumbers: Set<string>;
  heldSeatNumbers: Set<string>;
  selectedSeatNumbers?: Set<string>;
  onSeatClick: (seat: SeatPosition) => void;
}

export function BookingSeatGrid({
  layout,
  bookedSeatNumbers,
  heldSeatNumbers,
  selectedSeatNumbers,
  onSeatClick,
}: BookingSeatGridProps) {
  const getSeatStatus = (seat: SeatPosition): SeatStatus => {
    if (!seat.seatNumber) return "available";

    // For couple seats
    if (seat.isCoupleSeat && seat.seatNumber.includes("-")) {
      const [start, end] = seat.seatNumber.split("-");
      const rowLetter = start[0];
      const startNum = parseInt(start.slice(1));
      const endNum = parseInt(end);

      // Check all individual seats in the couple
      for (let num = startNum; num <= endNum; num++) {
        const individualSeatNumber = `${rowLetter}${num}`;
        if (bookedSeatNumbers.has(individualSeatNumber)) return "booked";
        if (heldSeatNumbers.has(individualSeatNumber)) return "held";
        if (selectedSeatNumbers?.has(individualSeatNumber)) return "selected";
      }
    } else {
      // Regular seat
      if (bookedSeatNumbers.has(seat.seatNumber)) return "booked";
      if (heldSeatNumbers.has(seat.seatNumber)) return "held";
      if (selectedSeatNumbers?.has(seat.seatNumber)) return "selected";
    }

    return "available";
  };

  const getSeatStatusClass = (status: SeatStatus, seat: SeatPosition) => {
    if (status === "booked") {
      return "bg-red-100 border-red-500 cursor-not-allowed opacity-75";
    }
    if (status === "held") {
      return "bg-yellow-100 border-yellow-500";
    }
    if (status === "selected") {
      return "bg-blue-100 border-blue-500";
    }
    return "";
  };

  const getDisabledSeatClass = (seat: SeatPosition) => {
    if (seat.type === SeatType.EMPTY || seat.type === SeatType.BLOCKED) {
      return "border-none";
    }
    return "";
  };

  const getSeatIcon = (type: SeatType) => {
    const iconClass = "h-5 w-5 text-gray-800";
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

  return (
    <div className="inline-block p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      {/* Screen indicator */}
      <div className="mb-8 text-center">
        <div className="inline-block px-8 py-2 bg-gray-800 text-white rounded-full text-sm font-medium">
          SCREEN
        </div>
      </div>

      {/* Seat grid */}
      <div className="space-y-1">
        {layout.seats.map((row, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-1">
            {/* Row label */}
            <div className="w-8 h-12 flex items-center justify-center text-sm font-bold text-gray-600 mr-2">
              {String.fromCharCode(65 + rowIndex)}
            </div>

            {/* Seats in row */}
            <div className="flex gap-1">
              {row.map((seat, colIndex) => {
                // Skip rendering the right seat of a couple (it will be rendered as part of the left seat)
                if (
                  seat.isCoupleSeat &&
                  seat.coupleWith !== undefined &&
                  seat.col > seat.coupleWith
                ) {
                  return null;
                }

                // Check if this is a couple seat (left seat)
                const isCoupleSeatLeft =
                  seat.isCoupleSeat &&
                  seat.coupleWith !== undefined &&
                  seat.col < seat.coupleWith;

                const status = getSeatStatus(seat);
                const isDisabled =
                  status === "booked" ||
                  seat.type === SeatType.EMPTY ||
                  seat.type === SeatType.BLOCKED;

                if (isCoupleSeatLeft) {
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={cn(
                        "h-12 cursor-pointer transition-all duration-200 select-none",
                        "flex items-center justify-center relative rounded-lg",
                        "bg-white shadow-md",
                        !isDisabled && "border-2 border-gray-800",
                        getSeatStatusClass(status, seat),
                        getDisabledSeatClass(seat),
                        isDisabled && "cursor-not-allowed opacity-75"
                      )}
                      style={{ width: "6.25rem" }}
                      onClick={() => !isDisabled && onSeatClick(seat)}
                      title={`${seat.seatNumber} - Couple Seat${
                        status !== "available" ? ` (${status})` : ""
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center h-full text-xs">
                        <Sofa className="h-5 w-5 text-gray-800" />
                        <span className="text-gray-800 font-bold text-[10px] leading-none mt-1">
                          {seat.seatNumber}
                        </span>
                        <span className="text-gray-600 text-[8px] leading-none">
                          COUPLE
                        </span>
                      </div>
                    </div>
                  );
                }

                // Regular seat rendering
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={cn(
                      "w-12 h-12 cursor-pointer transition-all duration-200 select-none",
                      "flex items-center justify-center relative rounded-lg",
                      "bg-white shadow-sm hover:shadow-md",
                      !isDisabled && "border-2 border-gray-800",
                      getSeatStatusClass(status, seat),
                      getDisabledSeatClass(seat),
                      isDisabled && "cursor-not-allowed opacity-75"
                    )}
                    onClick={() => !isDisabled && onSeatClick(seat)}
                    title={`${seat.seatNumber || ""} - ${seat.type}${
                      status !== "available" ? ` (${status})` : ""
                    }`}
                  >
                    {seat.type !== SeatType.EMPTY &&
                    seat.type !== SeatType.BLOCKED ? (
                      <div className="flex flex-col items-center justify-center h-full text-xs">
                        {getSeatIcon(seat.type)}
                        {seat.seatNumber && (
                          <span className="text-gray-800 font-bold text-[10px] leading-none mt-1">
                            {seat.seatNumber}
                          </span>
                        )}
                      </div>
                    ) : seat.type === SeatType.BLOCKED ? (
                      <div className="flex flex-col items-center justify-center h-full text-xs">
                        {getSeatIcon(seat.type)}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs font-mono">
                        {String.fromCharCode(65 + seat.row)}
                        {seat.col + 1}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Row label (right side) */}
            <div className="w-8 h-12 flex items-center justify-center text-sm font-bold text-gray-600 ml-2">
              {String.fromCharCode(65 + rowIndex)}
            </div>
          </div>
        ))}
      </div>

      {/* Column numbers */}
      <div className="flex items-center gap-1 mt-2">
        <div className="w-8 mr-2"></div>
        {Array.from({ length: layout.cols }, (_, index) => (
          <div
            key={index}
            className="w-12 h-6 flex items-center justify-center text-xs font-bold text-gray-600"
          >
            {index + 1}
          </div>
        ))}
        <div className="w-8 ml-2"></div>
      </div>
    </div>
  );
}
