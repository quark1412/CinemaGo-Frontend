"use client";

import { useState } from "react";

import { FoodDrink } from "@/types/fooddrink";
import { DataTable } from "@/app/(main)/food-drinks/data-table";
import { createColumns } from "./columns";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { FoodDrinkDialog } from "./food-drink-dialog";
import { GetFoodDrinksParams } from "@/services/fooddrinks";
import {
  useFoodDrinks,
  useToggleFoodDrinkAvailability,
} from "@/hooks/use-fooddrinks";
import { useI18n } from "@/contexts/I18nContext";

export default function AllFoodDrinks() {
  const { t } = useI18n();

  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    foodDrink: FoodDrink | null;
    action: "toggle";
  }>({
    open: false,
    foodDrink: null,
    action: "toggle",
  });
  const [foodDrinkDialog, setFoodDrinkDialog] = useState<{
    open: boolean;
    foodDrink: FoodDrink | null;
  }>({
    open: false,
    foodDrink: null,
  });
  const [currentParams, setCurrentParams] = useState<GetFoodDrinksParams>({
    page: 1,
    limit: 10,
  });
  const [filters, setFilters] = useState<{
    isAvailable?: string;
  }>({});

  const { data, isLoading } = useFoodDrinks(currentParams);
  const toggleMutation = useToggleFoodDrinkAvailability();

  const handleEditClick = (foodDrink: FoodDrink) => {
    setFoodDrinkDialog({
      open: true,
      foodDrink,
    });
  };

  const handleCreateClick = () => {
    setFoodDrinkDialog({
      open: true,
      foodDrink: null,
    });
  };

  const handleDialogSuccess = () => {};

  const handleToggleClick = (foodDrink: FoodDrink) => {
    setConfirmationDialog({
      open: true,
      foodDrink,
      action: "toggle",
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmationDialog.foodDrink) return;

    try {
      await toggleMutation.mutateAsync(confirmationDialog.foodDrink.id);
      setConfirmationDialog({
        open: false,
        foodDrink: null,
        action: "toggle",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setCurrentParams({ ...currentParams, page, limit: pageSize });
  };

  const handleSearchChange = (search: string) => {
    setCurrentParams({ ...currentParams, page: 1, search });
  };

  const handleFilterChange = (filterType: string, value: string) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);

    const apiParams: GetFoodDrinksParams = {
      ...currentParams,
      page: 1,
    };

    if (filterType === "isAvailable") {
      apiParams.isAvailable =
        value === "true" ? true : value === "false" ? false : undefined;
    }

    setCurrentParams(apiParams);
  };

  const columns = createColumns({
    onEdit: handleEditClick,
    onToggle: handleToggleClick,
  });

  return (
    <div className="h-full">
      <DataTable
        onCreateClick={handleCreateClick}
        columns={columns}
        data={data?.data || []}
        pagination={
          data?.pagination || {
            totalItems: 0,
            totalPages: 0,
            currentPage: 1,
            pageSize: 10,
            hasNextPage: false,
            hasPrevPage: false,
          }
        }
        onPaginationChange={handlePaginationChange}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        loading={isLoading}
      />

      <ConfirmationDialog
        open={confirmationDialog.open}
        onOpenChange={(open) =>
          setConfirmationDialog((prev) => ({ ...prev, open }))
        }
        title={
          confirmationDialog.foodDrink?.isAvailable
            ? t("foodDrinks.archiveFoodDrink.title")
            : t("foodDrinks.restoreFoodDrink.title")
        }
        description={
          confirmationDialog.foodDrink?.isAvailable
            ? `${t("foodDrinks.archiveFoodDrink.description")} ${
                confirmationDialog.foodDrink?.name
              } ${t("foodDrinks.archiveFoodDrink.confirmText")}`
            : `${t("foodDrinks.archiveFoodDrink.description")} ${
                confirmationDialog.foodDrink?.name
              } ${t("foodDrinks.restoreFoodDrink.confirmText")}`
        }
        confirmText={
          confirmationDialog.foodDrink?.isAvailable
            ? t("foodDrinks.archiveFoodDrink.title")
            : t("foodDrinks.restoreFoodDrink.title")
        }
        variant={
          confirmationDialog.foodDrink?.isAvailable ? "destructive" : "default"
        }
        onConfirm={handleConfirmAction}
        loading={toggleMutation.isPending}
      />

      <FoodDrinkDialog
        open={foodDrinkDialog.open}
        onOpenChange={(open) =>
          setFoodDrinkDialog((prev) => ({ ...prev, open }))
        }
        foodDrink={foodDrinkDialog.foodDrink}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
