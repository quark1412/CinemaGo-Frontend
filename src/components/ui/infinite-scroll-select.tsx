"use client";

import * as React from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface SelectOption {
  value: string;
  label: string;
}

interface InfiniteScrollSelectProps {
  value?: string[];
  onValueChange?: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  options: SelectOption[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSearch?: (search: string) => void;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

export function InfiniteScrollSelect({
  value = [],
  onValueChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  options,
  loading = false,
  hasMore = false,
  onLoadMore,
  onSearch,
  multiple = true,
  disabled = false,
  className,
}: InfiniteScrollSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const selectedOptions = React.useMemo(() => {
    return options.filter((option) => value.includes(option.value));
  }, [options, value]);

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValue = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onValueChange?.(newValue);
    } else {
      onValueChange?.(value.includes(optionValue) ? [] : [optionValue]);
      setOpen(false);
    }
  };

  const handleSearch = (search: string) => {
    setSearchValue(search);
    onSearch?.(search);
  };

  const handleScroll = React.useCallback(() => {
    if (!scrollRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom) {
      onLoadMore?.();
    }
  }, [loading, hasMore, onLoadMore]);

  React.useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedOptions.length === 0
              ? placeholder
              : multiple
              ? `${selectedOptions.length} selected`
              : selectedOptions[0]?.label}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <div className="flex flex-col">
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div ref={scrollRef} className="max-h-64 overflow-y-auto">
            {options.length === 0 && !loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No options found.
              </div>
            ) : (
              <div className="p-1">
                {options.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                      "focus:bg-accent focus:text-accent-foreground"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(option.value)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {option.label}
                  </div>
                ))}
                {loading && (options.length === 0 || hasMore) && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="ml-2 text-sm">
                      {options.length > 0 ? "Loading more..." : "Loading..."}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
