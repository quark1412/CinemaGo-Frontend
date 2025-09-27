"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeatLayout, SeatType } from "@/types/seat";
import {
  RotateCcw,
  Save,
  Download,
  Upload,
  Grid3X3,
  Trash2,
  Eye,
} from "lucide-react";

interface LayoutControlsProps {
  layout: SeatLayout;
  onLayoutChange: (layout: SeatLayout) => void;
  onSave?: (layout: SeatLayout) => void;
  onPreview?: () => void;
}

export function LayoutControls({
  layout,
  onLayoutChange,
  onSave,
  onPreview,
}: LayoutControlsProps) {
  const [rows, setRows] = useState(layout.rows);
  const [cols, setCols] = useState(layout.cols);

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

  const handleResizeGrid = () => {
    if (rows < 1 || cols < 1 || rows > 15 || cols > 15) {
      alert("Grid size must be between 1x1 and 15x15");
      return;
    }

    const newLayout = createEmptyLayout(rows, cols);

    // Copy existing seats if they fit in the new layout
    for (let r = 0; r < Math.min(layout.rows, rows); r++) {
      for (let c = 0; c < Math.min(layout.cols, cols); c++) {
        if (layout.seats[r] && layout.seats[r][c]) {
          newLayout.seats[r][c] = {
            ...layout.seats[r][c],
            row: r,
            col: c,
          };
        }
      }
    }

    onLayoutChange(newLayout);
  };

  const handleClearLayout = () => {
    if (confirm("Are you sure you want to clear the entire layout?")) {
      const emptyLayout = createEmptyLayout(layout.rows, layout.cols);
      onLayoutChange(emptyLayout);
    }
  };

  const handleExportLayout = () => {
    const dataStr = JSON.stringify(layout, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `seat-layout-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
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
          onLayoutChange(importedLayout);
          setRows(importedLayout.rows);
          setCols(importedLayout.cols);
        } else {
          alert("Invalid layout file format");
        }
      } catch (error) {
        alert("Error reading layout file");
      }
    };
    reader.readAsText(file);

    // Reset the input
    event.target.value = "";
  };

  const getSeatStats = () => {
    let normal = 0,
      vip = 0,
      couple = 0,
      blocked = 0,
      empty = 0;

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
            couple++;
            break;
          case SeatType.BLOCKED:
            blocked++;
            break;
          case SeatType.EMPTY:
            empty++;
            break;
        }
      });
    });

    return {
      normal,
      vip,
      couple,
      blocked,
      empty,
      total: normal + vip + couple,
    };
  };

  const stats = getSeatStats();

  return (
    <div className="space-y-4">
      {/* Grid Size Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Grid3X3 size={20} />
            Grid Size
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rows">Rows</Label>
              <Input
                id="rows"
                type="number"
                min="1"
                max="15"
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cols">Columns</Label>
              <Input
                id="cols"
                type="number"
                min="1"
                max="15"
                value={cols}
                onChange={(e) => setCols(Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>
          <Button onClick={handleResizeGrid} className="w-full">
            <Grid3X3 size={16} />
            Resize Grid ({rows}×{cols})
          </Button>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Layout Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span>🪑 Normal:</span>
              <span className="font-medium">{stats.normal}</span>
            </div>
            <div className="flex justify-between">
              <span>👑 VIP:</span>
              <span className="font-medium">{stats.vip}</span>
            </div>
            <div className="flex justify-between">
              <span>💕 Couple:</span>
              <span className="font-medium">{stats.couple}</span>
            </div>
            <div className="flex justify-between">
              <span>♿ Disabled:</span>
              <span className="font-medium">{stats.disabled}</span>
            </div>
            <div className="flex justify-between">
              <span>🚫 Blocked:</span>
              <span className="font-medium">{stats.blocked}</span>
            </div>
            <div className="flex justify-between">
              <span>⬜ Empty:</span>
              <span className="font-medium">{stats.empty}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold">
              <span>Total Seats:</span>
              <span>{stats.total}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            onClick={onPreview}
            variant="outline"
            className="w-full"
            disabled={!onPreview}
          >
            <Eye size={16} />
            Preview Layout
          </Button>

          <Button
            onClick={() => onSave?.(layout)}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={!onSave}
          >
            <Save size={16} />
            Save Layout
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={handleExportLayout}
              variant="outline"
              className="flex-1"
            >
              <Download size={16} />
              Export
            </Button>

            <label className="flex-1">
              <Button
                variant="outline"
                className="w-full cursor-pointer"
                asChild
              >
                <span>
                  <Upload size={16} />
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
            variant="destructive"
            className="w-full"
          >
            <Trash2 size={16} />
            Clear Layout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
