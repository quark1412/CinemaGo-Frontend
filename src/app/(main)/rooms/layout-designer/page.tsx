"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { CinemaSelector } from "@/components/cinema-selector";
import { createRoom } from "@/services/cinemas";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

export default function SeatLayoutDesigner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams.get("roomId");
  const cinemaId = searchParams.get("cinemaId");
  const roomName = searchParams.get("roomName");
  const vipPrice = searchParams.get("vipPrice");
  const couplePrice = searchParams.get("couplePrice");

  const [selectedSeatType, setSelectedSeatType] = useState<SeatType>(
    SeatType.NORMAL
  );
  const [layout, setLayout] = useState<SeatLayout>({
    rows: 10,
    cols: 15,
    seats: [],
  });

  const [roomConfig, setRoomConfig] = useState<RoomConfig>({
    name: roomName || "",
    cinemaId: cinemaId || "",
    seatLayout: layout,
    vipPrice: vipPrice ? parseInt(vipPrice) : 0,
    couplePrice: couplePrice ? parseInt(couplePrice) : 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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
      toast.error("Please enter a room name");
      return;
    }

    if (!roomConfig.cinemaId) {
      toast.error("Please select a cinema");
      return;
    }

    setIsLoading(true);
    try {
      const seatLayoutData = layoutToSave.seats
        .map((row, rowIndex) =>
          row.map((seat, colIndex) => ({
            row: String.fromCharCode(65 + rowIndex), // A, B, C, etc.
            col: colIndex + 1,
            type: seat.type,
          }))
        )
        .flat()
        .filter((seat) => seat.type !== SeatType.EMPTY);

      const roomData = {
        name: roomConfig.name,
        cinemaId: roomConfig.cinemaId,
        seatLayout: seatLayoutData,
        vipPrice: roomConfig.vipPrice || 0,
        couplePrice: roomConfig.couplePrice || 0,
      };

      await createRoom(roomData);
      toast.success("Room layout saved successfully!");
      router.push("/rooms");
    } catch (error: any) {
      console.error("Error saving room:", error);
      const message =
        error.response?.data?.message || "Error saving room layout";
      toast.error(message);
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
      couple = 0;

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
        }
      });
    });

    return {
      normal,
      vip,
      couple,
      total: normal + vip + couple,
    };
  };

  const stats = getSeatStats();

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/rooms">All rooms</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {roomId ? "Edit room layout" : "Create room layout"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-8 flex flex-col gap-6 bg-background px-6 py-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              {roomId ? "Edit Room Layout" : "Room Layout Designer"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Design your cinema room with different seat types and arrangements
            </p>
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
              disabled={
                isLoading || !roomConfig.name.trim() || !roomConfig.cinemaId
              }
            >
              <Save size={16} />
              {isLoading ? "Saving..." : "Save Room"}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
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
                <Label htmlFor="cinema">Cinema *</Label>
                <CinemaSelector
                  value={roomConfig.cinemaId ? [roomConfig.cinemaId] : []}
                  onValueChange={(values) =>
                    setRoomConfig((prev) => ({
                      ...prev,
                      cinemaId: values[0] || "",
                    }))
                  }
                  placeholder="Select a cinema"
                  multiple={false}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="vipPrice">VIP Seat Extra Price</Label>
                <Input
                  id="vipPrice"
                  type="number"
                  placeholder="0"
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
                <Label htmlFor="couplePrice">Couple Seat Extra Price</Label>
                <Input
                  id="couplePrice"
                  type="number"
                  placeholder="0"
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
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
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

          <div className="xl:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>Seat Layout Designer</span>
                  <div className="text-sm font-normal text-muted-foreground">
                    Total: {stats.total} seats ({stats.normal} Normal,{" "}
                    {stats.vip} VIP, {stats.couple} Couple)
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
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Layout Preview</h2>
                <Button onClick={() => setShowPreview(false)} variant="outline">
                  Close
                </Button>
              </div>

              <div className="bg-muted p-6 rounded-lg">
                <SeatGrid
                  layout={layout}
                  selectedSeatType={SeatType.EMPTY}
                  onLayoutChange={() => {}}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
