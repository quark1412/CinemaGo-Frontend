"use client";

import * as React from "react";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useI18n } from "@/contexts/I18nContext";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectHookReturn<T> {
  items: T[];
  loading: boolean;
  search: (searchTerm: string) => void;
  reset: () => void;
  setFilters?: (filters: Record<string, any>) => void;
}

interface GenericSelectProps<T> {
  value?: string[];
  onValueChange?: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  // Hook and data transformation
  useSelectHook: () => SelectHookReturn<T>;
  getOption: (item: T) => SelectOption;
  // Badge display
  showSelectedBadges?: boolean;
  badgeClassName?: string;
  onRemoveBadge?: (value: string) => void;
  // Search functionality
  showSearch?: boolean;
}

export function GenericSelect<T>({
  value = [],
  onValueChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  multiple = true,
  disabled = false,
  className,
  useSelectHook,
  getOption,
  showSelectedBadges = true,
  badgeClassName,
  onRemoveBadge,
  showSearch = true,
}: GenericSelectProps<T>) {
  const { t } = useI18n();

  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const { items, loading, search } = useSelectHook();

  const options: SelectOption[] = items.map(getOption);

  const selectedOptions = React.useMemo(() => {
    return options.filter((option) => value.includes(option.value));
  }, [options, value]);

  const selectedItems = React.useMemo(() => {
    return items.filter((item) => {
      const option = getOption(item);
      return value.includes(option.value);
    });
  }, [items, value, getOption]);

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

  const handleSearch = (searchTerm: string) => {
    setSearchValue(searchTerm);
    search(searchTerm);
  };

  const handleRemove = (optionValue: string) => {
    const newValue = value.filter((v) => v !== optionValue);
    onValueChange?.(newValue);
    onRemoveBadge?.(optionValue);
  };

  return (
    <div className="space-y-2">
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
                ? `${selectedOptions.length} ${t("common.selected")} `
                : selectedOptions[0]?.label}{" "}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <div className="flex flex-col">
            {showSearch && (
              <div className="flex items-center border-b px-3 py-2">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            )}
            <div className="max-h-64 overflow-y-auto">
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
                  {loading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2 text-sm">Loading...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {showSelectedBadges && selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedItems.map((item) => {
            const option = getOption(item);
            return (
              <Badge
                key={option.value}
                variant="secondary"
                className={cn(
                  "inline-flex items-center gap-1 bg-success/10 text-success text-xs pl-3 pr-2 py-1",
                  badgeClassName
                )}
              >
                {option.label}
                <button
                  type="button"
                  onClick={() => handleRemove(option.value)}
                  className="hover:bg-success/20 rounded-full p-0.5 ml-1"
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
