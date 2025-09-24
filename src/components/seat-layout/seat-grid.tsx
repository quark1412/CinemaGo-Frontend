"use client";

import { useState, useCallback, useRef } from "react";
import { SeatCell } from "@/components/seat-layout/seat-cell";
import { SeatType, SeatPosition, SeatLayout } from "@/types/seat";
import { cn } from "@/lib/utils";

interface SeatGridProps {
  layout: SeatLayout;
  selectedSeatType: SeatType;
  onLayoutChange: (layout: SeatLayout) => void;
  onSeatSelect?: (seat: SeatPosition) => void;
}

export function SeatGrid({
  layout,
  selectedSeatType,
  onLayoutChange,
  onSeatSelect,
}: SeatGridProps) {
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"paint" | "erase" | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressStarted = useRef(false);

  const getSeatKey = (row: number, col: number) => `${row}-${col}`;

  const updateSeat = useCallback(
    (row: number, col: number, newType: SeatType) => {
      const newLayout = { ...layout };
      const newSeats = layout.seats.map((seatRow) => [...seatRow]);

      // Generate seat number for non-empty seats
      let seatNumber = "";
      if (newType !== SeatType.EMPTY) {
        const rowLetter = String.fromCharCode(65 + row);
        seatNumber = `${rowLetter}${col + 1}`;
      }

      newSeats[row][col] = {
        row,
        col,
        type: newType,
        seatNumber: newType !== SeatType.EMPTY ? seatNumber : undefined,
      };

      newLayout.seats = newSeats;
      onLayoutChange(newLayout);
    },
    [layout, onLayoutChange]
  );

  const createCoupleSeat = useCallback(
    (row: number, col1: number, col2: number) => {
      const newLayout = { ...layout };
      const newSeats = layout.seats.map((seatRow) => [...seatRow]);

      const rowLetter = String.fromCharCode(65 + row);
      const seatNumber1 = `${rowLetter}${col1 + 1}-${col2 + 1}`;

      // Create couple seat pair
      newSeats[row][col1] = {
        row,
        col: col1,
        type: SeatType.COUPLE,
        seatNumber: seatNumber1,
        isCoupleSeat: true,
        coupleWith: col2,
      };

      newSeats[row][col2] = {
        row,
        col: col2,
        type: SeatType.COUPLE,
        seatNumber: seatNumber1,
        isCoupleSeat: true,
        coupleWith: col1,
      };

      newLayout.seats = newSeats;
      onLayoutChange(newLayout);
    },
    [layout, onLayoutChange]
  );

  const removeCoupleSeat = useCallback(
    (row: number, col: number) => {
      const newLayout = { ...layout };
      const newSeats = layout.seats.map((seatRow) => [...seatRow]);

      const currentSeat = newSeats[row][col];
      if (currentSeat.isCoupleSeat && currentSeat.coupleWith !== undefined) {
        // Remove both seats in the couple
        newSeats[row][col] = {
          row,
          col,
          type: SeatType.EMPTY,
        };

        newSeats[row][currentSeat.coupleWith] = {
          row,
          col: currentSeat.coupleWith,
          type: SeatType.EMPTY,
        };
      } else {
        // Remove single seat
        newSeats[row][col] = {
          row,
          col,
          type: SeatType.EMPTY,
        };
      }

      newLayout.seats = newSeats;
      onLayoutChange(newLayout);
    },
    [layout, onLayoutChange]
  );

  const handleSeatClick = useCallback(
    (seat: SeatPosition) => {
      if (selectedSeatType === SeatType.COUPLE) {
        // For couple seats, we need special handling
        if (seat.type === SeatType.COUPLE && seat.isCoupleSeat) {
          // Remove existing couple seat
          removeCoupleSeat(seat.row, seat.col);
        } else if (seat.type === SeatType.EMPTY) {
          // Try to create couple seat with adjacent seat
          const leftCol = seat.col - 1;
          const rightCol = seat.col + 1;

          // Check left adjacent seat
          if (
            leftCol >= 0 &&
            layout.seats[seat.row][leftCol].type === SeatType.EMPTY
          ) {
            createCoupleSeat(seat.row, leftCol, seat.col);
          }
          // Check right adjacent seat
          else if (
            rightCol < layout.cols &&
            layout.seats[seat.row][rightCol].type === SeatType.EMPTY
          ) {
            createCoupleSeat(seat.row, seat.col, rightCol);
          } else {
            alert(
              "Couple seats require two adjacent empty seats in the same row."
            );
          }
        }
      } else {
        // Regular seat types
        if (selectedSeatType === SeatType.EMPTY) {
          if (seat.isCoupleSeat) {
            removeCoupleSeat(seat.row, seat.col);
          } else {
            updateSeat(seat.row, seat.col, SeatType.EMPTY);
          }
        } else {
          updateSeat(seat.row, seat.col, selectedSeatType);
        }
      }

      onSeatSelect?.(seat);
    },
    [
      selectedSeatType,
      updateSeat,
      removeCoupleSeat,
      createCoupleSeat,
      layout,
      onSeatSelect,
    ]
  );

  const handleMouseDown = useCallback(
    (seat: SeatPosition) => {
      longPressStarted.current = true;

      // Start long press timer for drag mode
      longPressTimer.current = setTimeout(() => {
        if (longPressStarted.current) {
          setIsDragging(true);

          // Determine drag mode based on current seat and selected type
          if (
            seat.type === SeatType.EMPTY &&
            selectedSeatType !== SeatType.EMPTY
          ) {
            setDragMode("paint");
          } else if (
            seat.type !== SeatType.EMPTY &&
            selectedSeatType === SeatType.EMPTY
          ) {
            setDragMode("erase");
          } else {
            setDragMode("paint");
          }

          // Apply the action to the current seat
          handleSeatClick(seat);
        }
      }, 300);
    },
    [selectedSeatType, handleSeatClick]
  );

  const handleMouseEnter = useCallback(
    (seat: SeatPosition) => {
      if (isDragging && dragMode) {
        if (
          dragMode === "paint" &&
          selectedSeatType !== SeatType.EMPTY &&
          selectedSeatType !== SeatType.COUPLE
        ) {
          updateSeat(seat.row, seat.col, selectedSeatType);
        } else if (dragMode === "erase") {
          if (seat.isCoupleSeat) {
            removeCoupleSeat(seat.row, seat.col);
          } else {
            updateSeat(seat.row, seat.col, SeatType.EMPTY);
          }
        }
      }
    },
    [isDragging, dragMode, selectedSeatType, updateSeat, removeCoupleSeat]
  );

  const handleMouseUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    longPressStarted.current = false;
    setIsDragging(false);
    setDragMode(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    longPressStarted.current = false;
    setIsDragging(false);
    setDragMode(null);
  }, []);

  const handleContextMenu = useCallback(
    (seat: SeatPosition, event: React.MouseEvent) => {
      event.preventDefault();
      // Right-click to remove seat
      if (seat.isCoupleSeat) {
        removeCoupleSeat(seat.row, seat.col);
      } else {
        updateSeat(seat.row, seat.col, SeatType.EMPTY);
      }
    },
    [updateSeat, removeCoupleSeat]
  );

  return (
    <div
      className="inline-block p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Screen indicator */}
      <div className="mb-8 text-center">
        <div className="inline-block px-8 py-2 bg-gray-800 text-white rounded-full text-sm font-medium">
          🎬 SCREEN
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

                if (isCoupleSeatLeft) {
                  return (
                    <div
                      key={getSeatKey(rowIndex, colIndex)}
                      className={cn(
                        "h-12 border-2 cursor-pointer transition-all duration-200 select-none",
                        "flex items-center justify-center relative rounded-lg",
                        "bg-pink-500 hover:bg-pink-600 border-pink-600 shadow-md"
                      )}
                      style={{ width: "6.25rem" }}
                      onClick={() => handleSeatClick(seat)}
                      onContextMenu={(e) => handleContextMenu(seat, e)}
                      onMouseDown={() => handleMouseDown(seat)}
                      onMouseEnter={() => handleMouseEnter(seat)}
                      title={`${seat.seatNumber} - Couple Seat`}
                    >
                      <div className="flex flex-col items-center justify-center h-full text-xs">
                        <div className="flex gap-2">
                          <span className="text-lg">💕</span>
                          <span className="text-lg">💕</span>
                        </div>
                        <span className="text-white font-bold text-[10px] leading-none">
                          {seat.seatNumber}
                        </span>
                        <span className="text-white text-[8px] leading-none">
                          COUPLE
                        </span>
                      </div>
                    </div>
                  );
                }

                // Regular seat rendering
                return (
                  <div key={getSeatKey(rowIndex, colIndex)}>
                    <SeatCell
                      seat={seat}
                      isSelected={selectedSeats.has(
                        getSeatKey(rowIndex, colIndex)
                      )}
                      onClick={() => handleSeatClick(seat)}
                      onContextMenu={handleContextMenu}
                      className="transition-transform hover:scale-105"
                      onMouseDown={() => handleMouseDown(seat)}
                      onMouseEnter={() => handleMouseEnter(seat)}
                    />
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

      {/* Instructions */}
      <div className="mt-4 text-xs text-gray-600 text-center space-y-1">
        <p>
          💡 <strong>Single click:</strong> Place selected seat type
        </p>
        <p>
          💡 <strong>Long press + drag:</strong> Paint multiple seats
        </p>
        <p>
          💡 <strong>Right click:</strong> Remove seat
        </p>
        <p>
          💡 <strong>Couple seats:</strong> Automatically merge 2 adjacent seats
        </p>
      </div>
    </div>
  );
}
