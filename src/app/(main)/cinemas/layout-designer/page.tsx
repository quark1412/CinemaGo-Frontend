"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SeatGrid } from "@/components/seat-layout/seat-grid";
import { SeatTypeSelector } from "@/components/seat-layout/seat-type-selector";
import { LayoutControls } from "@/components/seat-layout/layout-controls";
import { SeatType, SeatLayout, SeatPosition } from "@/types/seat";
import { Cinema } from "@/types/cinema";
import { Eye, Save, Download, Upload, Trash2, X } from "lucide-react";
import {
  createRoom,
  getCinemaById,
  getRoomById,
  updateRoom,
} from "@/services/cinemas";
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
    cols: 10,
    seats: [],
  });

  const [roomNameInput, setRoomNameInput] = useState<string>(roomName || "");

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
  }, []);

  useEffect(() => {
    const fetchRoomLayout = async () => {
      if (!roomId) return;

      setIsLoading(true);
      try {
        const response = await getRoomById(roomId);
        const room = response.data;

        // Set room name
        setRoomNameInput(room.name);

        // Convert backend seatLayout to frontend format
        if (room.seatLayout && Array.isArray(room.seatLayout)) {
          console.log(room.seatLayout);
          // Find max row and col to determine grid size
          let maxRow = 0;
          let maxCol = 0;

          room.seatLayout.forEach((seat: any) => {
            const rowIndex = seat.row.charCodeAt(0) - 65;
            const colIndex = seat.col - 1;

            if (rowIndex > maxRow) maxRow = rowIndex;
            if (colIndex > maxCol) maxCol = colIndex;
          });

          // Create empty layout
          const rows = maxRow + 1;
          const cols = maxCol + 1;
          const seats: SeatPosition[][] = Array.from(
            { length: rows },
            (_, rowIndex) =>
              Array.from({ length: cols }, (_, colIndex) => ({
                row: rowIndex,
                col: colIndex,
                type: SeatType.EMPTY,
              }))
          );

          // First pass: Fill in all seats
          room.seatLayout.forEach((seat: any) => {
            const rowIndex = seat.row.charCodeAt(0) - 65;
            const colIndex = seat.col - 1;

            if (rowIndex < rows && colIndex < cols) {
              const seatNumber = `${seat.row}${seat.col}`;
              seats[rowIndex][colIndex] = {
                row: rowIndex,
                col: colIndex,
                type: seat.type as SeatType,
                seatNumber: seatNumber,
              };
            }
          });

          // Second pass: Detect and pair couple seats
          for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
            for (let colIndex = 0; colIndex < cols - 1; colIndex++) {
              const currentSeat = seats[rowIndex][colIndex];
              const nextSeat = seats[rowIndex][colIndex + 1];

              // Check if this is the start of a couple seat pair
              if (
                currentSeat.type === SeatType.COUPLE &&
                nextSeat.type === SeatType.COUPLE &&
                !currentSeat.isCoupleSeat &&
                !nextSeat.isCoupleSeat
              ) {
                const rowLetter = String.fromCharCode(65 + rowIndex);
                const coupleSeatNumber = `${rowLetter}${colIndex + 1}-${
                  colIndex + 2
                }`;

                // Update both seats with couple properties
                seats[rowIndex][colIndex] = {
                  ...currentSeat,
                  seatNumber: coupleSeatNumber,
                  isCoupleSeat: true,
                  coupleWith: colIndex + 1,
                };

                seats[rowIndex][colIndex + 1] = {
                  ...nextSeat,
                  seatNumber: coupleSeatNumber,
                  isCoupleSeat: true,
                  coupleWith: colIndex,
                };
              }
            }
          }

          setLayout({ rows, cols, seats });
        }
      } catch (error: any) {
        console.error("Error fetching room:", error);
        const message =
          error.response?.data?.message || "Error loading room layout";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomLayout();
  }, [roomId]);

  const handleLayoutChange = (newLayout: SeatLayout) => {
    setLayout(newLayout);
  };

  const handleSaveLayout = async (layoutToSave: SeatLayout) => {
    if (!roomNameInput.trim()) {
      toast.error("Please enter a room name");
      return;
    }

    if (!cinemaId && !roomId) {
      toast.error("Cinema information is required");
      return;
    }

    setIsLoading(true);
    try {
      const seatLayoutData = layoutToSave.seats
        .map((row, rowIndex) =>
          row.map((seat, colIndex) => ({
            row: String.fromCharCode(65 + rowIndex),
            col: colIndex + 1,
            type: seat.type,
          }))
        )
        .flat()
        .filter((seat) => seat.type !== SeatType.EMPTY);

      const roomData = {
        name: roomNameInput,
        cinemaId: cinemaId || undefined,
        seatLayout: seatLayoutData,
        vipPrice: parseInt(vipPrice || "0") || 0,
        couplePrice: parseInt(couplePrice || "0") || 0,
      };

      if (roomId) {
        // Update existing room
        await updateRoom(roomId, roomData);
        toast.success("Room layout updated successfully!");
      } else {
        // Create new room
        if (!cinemaId) {
          toast.error("Cinema information is required");
          return;
        }
        await createRoom({ ...roomData, cinemaId });
        toast.success("Room layout created successfully!");
      }

      if (cinemaId) {
        router.push(`/cinemas/${cinemaId}`);
      } else {
        router.push("/cinemas");
      }
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

  const handleExportLayout = () => {
    const dataStr = JSON.stringify(layout, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `${roomNameInput || "layout"}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast.success("Layout exported successfully!");
  };

  const handleImportLayout = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedLayout = JSON.parse(e.target?.result as string);
        setLayout(importedLayout);
        toast.success("Layout imported successfully!");
      } catch (error) {
        toast.error("Invalid layout file");
      }
    };
    reader.readAsText(file);
  };

  const handleClearLayout = () => {
    const emptyLayout = {
      rows: layout.rows,
      cols: layout.cols,
      seats: Array.from({ length: layout.rows }, (_, rowIndex) =>
        Array.from({ length: layout.cols }, (_, colIndex) => ({
          row: rowIndex,
          col: colIndex,
          type: SeatType.EMPTY,
        }))
      ),
    };
    setLayout(emptyLayout);
    toast.success("Layout cleared successfully!");
  };

  const handleCancelEdit = () => {
    if (cinemaId) {
      router.push(`/cinemas/${cinemaId}`);
    } else {
      router.push("/cinemas");
    }
  };

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/cinemas">All cinemas</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {cinemaId && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/cinemas/${cinemaId}`}>Cinema Details</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>
              {roomId ? "Edit room layout" : "Create room layout"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-8 flex flex-col gap-6 bg-background px-6 py-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            {roomId ? "Edit Room Layout" : "Room Layout Designer"}
          </h1>
        </div>

        {/* Controls Row */}
        <div className="flex gap-6 items-stretch">
          <div className="flex-1">
            <SeatTypeSelector
              selectedType={selectedSeatType}
              onTypeSelect={setSelectedSeatType}
            />
          </div>

          <div className="flex-1">
            <LayoutControls
              layout={layout}
              onLayoutChange={handleLayoutChange}
              onSave={handleSaveLayout}
              onPreview={handlePreview}
            />
          </div>

          <div className="flex-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={handlePreview}
                    variant="outline"
                    className={`w-full h-10 font-medium border-2 transition-all ${
                      showPreview
                        ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                        : "hover:bg-gray-50 border-gray-200"
                    }`}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {showPreview ? "Hide Preview" : "Preview Layout"}
                  </Button>
                </div>

                {/* Secondary Actions */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Manage Layout
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleExportLayout}
                      variant="outline"
                      className="h-10 font-medium hover:bg-gray-50 border-gray-200"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>

                    <label className="cursor-pointer">
                      <Button
                        variant="outline"
                        className="w-full h-10 font-medium hover:bg-gray-50 border-gray-200"
                        asChild
                      >
                        <span>
                          <Upload className="mr-2 h-4 w-4" />
                          Import
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportLayout}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <Button
                    onClick={() => handleSaveLayout(layout)}
                    disabled={
                      isLoading ||
                      !roomNameInput.trim() ||
                      (!cinemaId && !roomId)
                    }
                    className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm"
                    size="lg"
                  >
                    <Save className="mr-2 h-5 w-5" />
                    {isLoading
                      ? "Saving..."
                      : roomId
                      ? "Update Layout"
                      : "Save Layout"}
                  </Button>

                  <Button
                    onClick={handleClearLayout}
                    variant="outline"
                    className="w-full h-10 font-medium text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Layout
                  </Button>

                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="w-full h-10 font-medium text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Seat Layout Designer Row */}
        <div className="w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seat Layout Designer</CardTitle>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
