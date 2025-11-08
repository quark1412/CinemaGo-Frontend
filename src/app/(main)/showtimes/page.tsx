"use client";

import { useState } from "react";
import { Showtime } from "@/types/showtime";
import { ShowtimesDataTable } from "./data-table";
import { createShowtimeColumns } from "./columns";
import { ShowtimeDialog } from "./showtime-dialog";
import { GetShowtimesParams } from "@/services/showtimes";
import { getAllShowtimes } from "@/services/showtimes";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ShowtimesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<
    Showtime | undefined
  >();
  const [currentParams, setCurrentParams] = useState<GetShowtimesParams>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["showtimes", currentParams],
    queryFn: () => getAllShowtimes(currentParams),
  });

  const handleCreateClick = () => {
    setEditingShowtime(undefined);
    setDialogOpen(true);
  };

  const handleEditClick = (showtime: Showtime) => {
    setEditingShowtime(showtime);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    // Refetch showtimes
    refetch();
    setDialogOpen(false);
    setEditingShowtime(undefined);
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setCurrentParams({ ...currentParams, page, limit: pageSize });
  };

  const handleSearchChange = (search: string) => {
    setCurrentParams({
      ...currentParams,
      page: 1,
      movieId: search || undefined,
    });
  };

  const columns = createShowtimeColumns({
    onRefresh: () => refetch(),
    onEdit: handleEditClick,
  });

  return (
    <div className="h-full">
      <ShowtimesDataTable
        columns={columns}
        data={data?.data || []}
        onCreateClick={handleCreateClick}
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
        loading={isLoading}
      />

      <ShowtimeDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingShowtime(undefined);
          }
        }}
        movieId={editingShowtime?.movieId}
        showtime={editingShowtime}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
