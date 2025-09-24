"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SeatGrid } from "@/components/seat-layout/seat-grid";
import { SeatTypeSelector } from "@/components/seat-layout/seat-type-selector";
import { LayoutControls } from "@/components/seat-layout/layout-controls";
import { SeatType, SeatLayout, RoomConfig } from "@/types/seat";
import { ArrowLeft, Settings, Eye, Save } from "lucide-react";
import Link from "next/link";

export default function SeatLayoutDesigner() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const cinemaId = searchParams.get("cinemaId");

  const [selectedSeatType, setSelectedSeatType] = useState<SeatType>(
    SeatType.NORMAL
  );
  const [layout, setLayout] = useState<SeatLayout>({
    rows: 10,
    cols: 15,
    seats: [],
  });

  const [roomConfig, setRoomConfig] = useState<RoomConfig>({
    name: "",
    cinemaId: cinemaId || "",
    seatLayout: layout,
    vipPrice: 50000,
    couplePrice: 80000,
    disabledPrice: 30000,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize empty layout
  useEffect(() => {
    const createEmptyLayout = (rows: number, cols: number): SeatLayout => {
      const seats = Array.from({ length: rows }, (_, rowIndex) =>
        Array.from({ length: cols }, (_, colIndex) => ({
          row: rowIndex,
          col: colIndex,
          type: SeatType.EMPTY,
        }))
      );
      return { rows, cols, seats };
    };

    const initialLayout = createEmptyLayout(10, 15);
    setLayout(initialLayout);
    setRoomConfig((prev) => ({ ...prev, seatLayout: initialLayout }));
  }, []);

  // Load existing room data if editing
  useEffect(() => {
    if (roomId) {
    }
  }, [roomId]);

  const handleLayoutChange = (newLayout: SeatLayout) => {
    setLayout(newLayout);
    setRoomConfig((prev) => ({ ...prev, seatLayout: newLayout }));
  };

  const handleSaveLayout = async (layoutToSave: SeatLayout) => {
    if (!roomConfig.name.trim()) {
      alert("Please enter a room name");
      return;
    }

    setIsLoading(true);
    try {
      // Save room layout
      //   console.log("Saving room config:", roomConfig);
      //   await new Promise((resolve) => setTimeout(resolve, 1000));
      //   alert("Room layout saved successfully!");
    } catch (error) {
      console.error("Error saving room:", error);
      alert("Error saving room layout");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(!showPreview);
  };

  const getSeatStats = () => {
    let normal = 0,
      vip = 0,
      couple = 0,
      disabled = 0;

    const processedCoupleSeats = new Set<string>();

    layout.seats.forEach((row) => {
      row.forEach((seat) => {
        switch (seat.type) {
          case SeatType.NORMAL:
            normal++;
            break;
          case SeatType.VIP:
            vip++;
            break;
          case SeatType.COUPLE:
            if (seat.isCoupleSeat && seat.coupleWith !== undefined) {
              const seatKey = `${seat.row}-${Math.min(
                seat.col,
                seat.coupleWith
              )}`;
              if (!processedCoupleSeats.has(seatKey)) {
                couple++;
                processedCoupleSeats.add(seatKey);
              }
            } else {
              couple++;
            }
            break;
          case SeatType.DISABLED:
            disabled++;
            break;
        }
      });
    });

    return {
      normal,
      vip,
      couple,
      disabled,
      total: normal + vip + couple + disabled,
    };
  };

  const stats = getSeatStats();

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/rooms">
            <Button variant="outline" size="sm">
              <ArrowLeft size={16} />
              Back to Rooms
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {roomId ? "Edit Room Layout" : "Create Room Layout"}
            </h1>
            <p className="text-gray-600 mt-1">
              Design your cinema room with different seat types and arrangements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handlePreview}
            variant="outline"
            className={showPreview ? "bg-blue-50" : ""}
          >
            <Eye size={16} />
            {showPreview ? "Hide Preview" : "Preview"}
          </Button>

          <Button
            onClick={() => handleSaveLayout(layout)}
            disabled={isLoading || !roomConfig.name.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save size={16} />
            {isLoading ? "Saving..." : "Save Room"}
          </Button>
        </div>
      </div>

      {/* Room Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={20} />
            Room Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="roomName">Room Name *</Label>
              <Input
                id="roomName"
                placeholder="e.g., Theater 1, IMAX Hall"
                value={roomConfig.name}
                onChange={(e) =>
                  setRoomConfig((prev) => ({ ...prev, name: e.target.value }))
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="vipPrice">VIP Seat Price (VND)</Label>
              <Input
                id="vipPrice"
                type="number"
                placeholder="50000"
                value={roomConfig.vipPrice}
                onChange={(e) =>
                  setRoomConfig((prev) => ({
                    ...prev,
                    vipPrice: Number(e.target.value),
                  }))
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="couplePrice">Couple Seat Price (VND)</Label>
              <Input
                id="couplePrice"
                type="number"
                placeholder="80000"
                value={roomConfig.couplePrice}
                onChange={(e) =>
                  setRoomConfig((prev) => ({
                    ...prev,
                    couplePrice: Number(e.target.value),
                  }))
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="disabledPrice">Disabled Access Price (VND)</Label>
              <Input
                id="disabledPrice"
                type="number"
                placeholder="30000"
                value={roomConfig.disabledPrice || 0}
                onChange={(e) =>
                  setRoomConfig((prev) => ({
                    ...prev,
                    disabledPrice: Number(e.target.value),
                  }))
                }
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Designer */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Sidebar - Controls */}
        <div className="xl:col-span-1 space-y-6">
          <SeatTypeSelector
            selectedType={selectedSeatType}
            onTypeSelect={setSelectedSeatType}
          />

          <LayoutControls
            layout={layout}
            onLayoutChange={handleLayoutChange}
            onSave={handleSaveLayout}
            onPreview={handlePreview}
          />
        </div>

        {/* Main Content - Seat Grid */}
        <div className="xl:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Seat Layout Designer</span>
                <div className="text-sm font-normal text-gray-600">
                  Total: {stats.total} seats ({stats.normal} Normal, {stats.vip}{" "}
                  VIP, {stats.couple} Couple, {stats.disabled} Disabled)
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <SeatGrid
                layout={layout}
                selectedSeatType={selectedSeatType}
                onLayoutChange={handleLayoutChange}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Layout Preview</h2>
                <Button onClick={() => setShowPreview(false)} variant="outline">
                  Close
                </Button>
              </div>

              <div className="bg-gray-100 p-6 rounded-lg">
                <SeatGrid
                  layout={layout}
                  selectedSeatType={SeatType.EMPTY}
                  onLayoutChange={() => {}}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Normal ({stats.normal})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span>VIP ({stats.vip})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-pink-500 rounded"></div>
                  <span>Couple ({stats.couple})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Disabled ({stats.disabled})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
