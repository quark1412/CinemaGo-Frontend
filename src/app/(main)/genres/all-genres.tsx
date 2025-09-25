"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Genre } from "@/types/genre";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import { GenreDialog } from "./genre-dialog";
import {
  getAllGenres,
  archiveGenre,
  restoreGenre,
  GetGenresParams,
} from "@/services/genres";

export default function AllGenres() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [currentParams, setCurrentParams] = useState<GetGenresParams>({
    page: 1,
    limit: 10,
  });

  const fetchGenres = async (params?: GetGenresParams) => {
    try {
      setLoading(true);
      const finalParams = { ...currentParams, ...params };
      setCurrentParams(finalParams);
      const response = await getAllGenres(finalParams);
      setGenres(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error("Failed to fetch genres");
      console.error("Error fetching genres:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const handleCreateClick = () => {
    setEditingGenre(null);
    setDialogOpen(true);
  };

  const handleEditClick = (genre: Genre) => {
    setEditingGenre(genre);
    setDialogOpen(true);
  };

  const handleArchiveClick = async (genre: Genre) => {
    try {
      await archiveGenre(genre.id);
      toast.success("Genre archived successfully!");
      fetchGenres();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to archive genre";
      toast.error(message);
    }
  };

  const handleRestoreClick = async (genre: Genre) => {
    try {
      await restoreGenre(genre.id);
      toast.success("Genre restored successfully!");
      fetchGenres();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to restore genre";
      toast.error(message);
    }
  };

  const handleDialogSuccess = () => {
    fetchGenres();
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    fetchGenres({ page, limit: pageSize });
  };

  const handleSearchChange = (search: string) => {
    fetchGenres({ page: 1, limit: currentParams.limit, search });
  };

  const columns = createColumns({
    onEdit: handleEditClick,
    onArchive: handleArchiveClick,
    onRestore: handleRestoreClick,
  });

  return (
    <div className="h-full">
      <DataTable
        columns={columns}
        data={genres}
        onCreateClick={handleCreateClick}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        onSearchChange={handleSearchChange}
        loading={loading}
      />

      <GenreDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        genre={editingGenre}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
