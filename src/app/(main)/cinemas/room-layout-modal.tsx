"use client";

import { useState, useEffect } from "react";
import { SeatLayout, SeatType } from "@/types/seat";
import { SeatGrid } from "@/components/seat-layout/seat-grid";
import { SeatTypeSelector } from "@/components/seat-layout/seat-type-selector";
import { LayoutControls } from "@/components/seat-layout/layout-controls";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Download, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { MAX_ROWS, MAX_COLS } from "@/lib/constants";

interface RoomLayoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomName: string;
  onSave: (layout: SeatLayout) => void;
  initialLayout?: SeatLayout;
}

export function RoomLayoutModal({
  open,
  onOpenChange,
  roomName,
  onSave,
  initialLayout,
}: RoomLayoutModalProps) {
  const [selectedSeatType, setSelectedSeatType] = useState<SeatType>(
    SeatType.NORMAL
  );
  const [layout, setLayout] = useState<SeatLayout>({
    rows: MAX_ROWS,
    cols: MAX_COLS,
    seats: [],
  });

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

    if (initialLayout) {
      setLayout(initialLayout);
    } else {
      const emptyLayout = createEmptyLayout(MAX_ROWS, MAX_COLS);
      setLayout(emptyLayout);
    }
  }, [initialLayout, open]);

  const handleLayoutChange = (newLayout: SeatLayout) => {
    setLayout(newLayout);
  };

  const handleSave = () => {
    onSave(layout);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleExportLayout = () => {
    const dataStr = JSON.stringify(layout, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `${roomName || "layout"}.json`;

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
        if (
          importedLayout.rows &&
          importedLayout.cols &&
          importedLayout.seats
        ) {
          setLayout(importedLayout);
          toast.success("Layout imported successfully!");
        } else {
          toast.error("Invalid layout file format");
        }
      } catch (error) {
        toast.error("Invalid layout file");
      }
    };
    reader.readAsText(file);

    event.target.value = "";
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="min-w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Room Layout: {roomName}</DialogTitle>
          <DialogDescription>
            Design the seat layout for this room. Click on seats to place them,
            or use drag to paint multiple seats.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Controls Row */}
          <div className="flex gap-4 items-stretch">
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
              />
            </div>

            <div className="flex-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
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
                      onClick={handleClearLayout}
                      variant="outline"
                      className="w-full h-10 font-medium text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear Layout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Seat Layout Designer */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-center overflow-x-auto">
                <SeatGrid
                  layout={layout}
                  selectedSeatType={selectedSeatType}
                  onLayoutChange={handleLayoutChange}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Layout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
