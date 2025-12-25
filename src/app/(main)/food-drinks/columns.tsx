"use client";

import { FoodDrink } from "@/types/fooddrink";
import { ColumnDef } from "@tanstack/react-table";
import {
  Clipboard,
  Eye,
  MoreHorizontal,
  Pencil,
  Power,
  PowerOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useI18n } from "@/contexts/I18nContext";

interface ColumnProps {
  onEdit: (foodDrink: FoodDrink) => void;
  onToggle: (foodDrink: FoodDrink) => void;
}

export const createColumns = ({
  onEdit,
  onToggle,
}: ColumnProps): ColumnDef<FoodDrink>[] => {
  const { t } = useI18n();

  return [
    {
      accessorKey: "image",
      header: () => <div className="font-bold">{t("foodDrinks.image")}</div>,
      cell: ({ row }) => {
        return (
          <div className="w-16 h-16 relative rounded-md overflow-hidden shrink-0">
            <Image
              src={row.original.image}
              alt={row.original.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("foodDrinks.name")} />
      ),
      cell: ({ row }) => {
        return (
          <div className="text-xs text-wrap font-medium">
            {row.original.name}
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: () => <div className="font-bold">{t("foodDrinks.type")}</div>,
      cell: ({ row }) => {
        const type = row.original.type;
        const getTypeVariant = (type: string) => {
          switch (type) {
            case "SNACK":
              return "default";
            case "DRINK":
              return "secondary";
            case "COMBO":
              return "outline";
            default:
              return "outline";
          }
        };
        return (
          <Badge variant={getTypeVariant(type)}>
            {t(`foodDrinks.filterFoodDrink.${type}`)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("foodDrinks.price")} />
      ),
      cell: ({ row }) => {
        return (
          <div className="text-xs font-medium">
            {formatPrice(row.original.price)}
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: () => <div className="font-bold">{t("foodDrinks.desc")}</div>,
      cell: ({ row }) => {
        return (
          <div className="max-w-60 text-wrap text-xs">
            {row.original.description}
          </div>
        );
      },
    },
    {
      accessorKey: "isAvailable",
      header: () => (
        <div className="font-bold">{t("foodDrinks.availability")}</div>
      ),
      cell: ({ row }) => {
        const isAvailable = row.original.isAvailable;
        return (
          <Badge variant={isAvailable ? "default" : "secondary"}>
            {isAvailable
              ? t("foodDrinks.filterFoodDrink.available")
              : t("foodDrinks.filterFoodDrink.unavailable")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("foodDrinks.created")}
        />
      ),
      cell: ({ row }) => {
        return (
          <div className="text-xs">{formatDate(row.original.createdAt)}</div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const foodDrink = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only text-xs">Actions</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onEdit(foodDrink)}
              >
                <Pencil className="text-primary" />
                <span className="text-xs">{t("foodDrinks.edit")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigator.clipboard.writeText(foodDrink.id)}
              >
                <Clipboard className="text-primary" />
                <span className="text-xs">{t("foodDrinks.copy")}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onToggle(foodDrink)}
              >
                {foodDrink.isAvailable ? (
                  <>
                    <PowerOff className="text-orange-500" />
                    <span className="text-xs text-orange-500">
                      {t("foodDrinks.delete")}
                    </span>
                  </>
                ) : (
                  <>
                    <Power className="text-green-500" />
                    <span className="text-xs text-green-500">
                      {t("foodDrinks.restore")}
                    </span>
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
