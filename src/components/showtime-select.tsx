"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Calendar } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Import Service lấy danh sách Showtimes
// Bạn cần đảm bảo API này trả về cả thông tin Movie (title) bên trong showtime
import { getAllShowtimes } from "@/services/showtimes";

interface ShowtimeSelectProps {
  value?: string;
  onChange: (value: string) => void;
}

export function ShowtimeSelect({ value, onChange }: ShowtimeSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [showtimes, setShowtimes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Fetch danh sách suất chiếu khi mở dropdown
  React.useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        setLoading(true);
        // Gọi API lấy danh sách (có thể thêm param search nếu backend hỗ trợ)
        // Giả sử lấy 50 suất chiếu mới nhất
        const res = await getAllShowtimes({ page: 1, limit: 50 });
        setShowtimes(res.data || []);
      } catch (error) {
        console.error("Failed to load showtimes", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, []);

  // Tìm label của suất chiếu đang chọn (để hiển thị khi đóng dropdown)
  const selectedShowtime = showtimes.find((st) => st.id === value);
  const displayLabel = selectedShowtime
    ? `${selectedShowtime.movie?.title || "Phim ?"} - ${format(
        new Date(selectedShowtime.startTime),
        "HH:mm dd/MM"
      )}`
    : "Tất cả suất chiếu";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between text-left font-normal"
        >
          <span className="truncate">
            {value ? displayLabel : "Tất cả suất chiếu"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Tìm phim hoặc giờ chiếu..." />
          <CommandList>
            <CommandEmpty>
              {loading ? "Đang tải..." : "Không tìm thấy suất chiếu."}
            </CommandEmpty>
            <CommandGroup>
              {/* Option: Tất cả */}
              <CommandItem
                value="all"
                onSelect={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !value ? "opacity-100" : "opacity-0"
                  )}
                />
                Tất cả suất chiếu
              </CommandItem>

              {/* Danh sách suất chiếu từ API */}
              {showtimes.map((st) => {
                // Tạo label hiển thị: "Tên phim - 10:30 20/12"
                const movieName =
                  st.movie?.title || st.movie?.name || "Unknown Movie";
                const timeStr = format(new Date(st.startTime), "HH:mm dd/MM", {
                  locale: vi,
                });
                const label = `${movieName} - ${timeStr}`;

                return (
                  <CommandItem
                    key={st.id}
                    value={st.id + label} // Hack: value của command item nên chứa cả text để search được
                    onSelect={() => {
                      onChange(st.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === st.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{movieName}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {timeStr}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
