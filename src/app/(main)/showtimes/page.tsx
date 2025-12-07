"use client";

import { useState, useMemo } from "react";
import { Showtime } from "@/types/showtime";
import { ShowtimesDataTable } from "./data-table";
import { createShowtimeColumns } from "./columns";
import { ShowtimeDialog } from "./showtime-dialog";
import { GetShowtimesParams } from "@/services/showtimes";
import { getAllShowtimes } from "@/services/showtimes";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRooms } from "@/hooks/use-rooms";
import { useMovies } from "@/hooks/use-movies";
import { useI18n } from "@/contexts/I18nContext";
import { useCinemas } from "@/hooks/use-cinemas";

export default function ShowtimesPage() {
  const { t } = useI18n();
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

  // Fetch rooms for filter and display
  const { data: roomsData } = useRooms({ limit: undefined, isActive: true });

  // Fetch movies for display
  const { data: moviesData } = useMovies({ limit: undefined, isActive: true });

  const { data: cinemasData } = useCinemas({
    limit: undefined,
    isActive: true,
  });

  // Create lookup maps
  const movieMap = useMemo(() => {
    const map = new Map<string, string>();
    if (moviesData?.data) {
      moviesData.data.forEach((movie) => {
        map.set(movie.id, movie.title);
      });
    }
    return map;
  }, [moviesData]);

  const roomCinemaMap = useMemo(() => {
    const map = new Map<string, { roomName: string; cinemaName: string }>();
    if (roomsData?.data) {
      roomsData.data.forEach((room) => {
        const cinemaName =
          cinemasData?.data?.find((cinema) => cinema.id === room.cinemaId)
            ?.name || "";
        map.set(room.id, {
          roomName: room.name,
          cinemaName,
        });
      });
    }
    return map;
  }, [roomsData]);

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

  const handleMovieChange = (movieId: string | "all") => {
    setCurrentParams((prev) => {
      const next: GetShowtimesParams = { ...prev, page: 1 };
      if (movieId === "all") {
        delete next.movieId;
      } else {
        next.movieId = movieId;
      }
      return next;
    });
  };

  const handleCinemaChange = (cinemaId: string | "all") => {
    setCurrentParams((prev) => {
      const next: GetShowtimesParams = { ...prev, page: 1 };
      if (cinemaId === "all") {
        delete next.cinemaId;
      } else {
        next.cinemaId = cinemaId;
      }
      return next;
    });
  };

  const handleActiveStatusChange = (status: string | "all") => {
    setCurrentParams((prev) => {
      const next: GetShowtimesParams = { ...prev, page: 1 };
      if (status === "all") {
        delete next.isActive;
      } else {
        next.isActive = status === "true";
      }
      return next;
    });
  };

  // Group and sort data by movie, then by cinema
  const groupedData = useMemo(() => {
    const showtimes = data?.data || [];
    if (showtimes.length === 0) return [];

    // Create a map to store cinema IDs for each room
    const cinemaIdMap = new Map<string, string>();
    if (roomsData?.data && cinemasData?.data) {
      roomsData.data.forEach((room) => {
        const cinema = cinemasData.data.find((c) => c.id === room.cinemaId);
        if (cinema) {
          cinemaIdMap.set(room.id, cinema.id);
        }
      });
    }

    // Sort by movieId first, then by cinemaId
    const sorted = [...showtimes].sort((a, b) => {
      const cinemaA = cinemaIdMap.get(a.roomId) || "";
      const cinemaB = cinemaIdMap.get(b.roomId) || "";

      if (a.movieId !== b.movieId) {
        return a.movieId.localeCompare(b.movieId);
      }
      return cinemaA.localeCompare(cinemaB);
    });

    // Calculate rowSpan for movie and cinema columns
    const result = sorted.map((showtime, index) => {
      const cinemaId = cinemaIdMap.get(showtime.roomId) || "";

      // Calculate movie rowSpan
      let movieRowSpan = 0; // 0: don't show, > 0: show with rowSpan
      const isFirstMovieRow =
        index === 0 || sorted[index - 1].movieId !== showtime.movieId;

      if (isFirstMovieRow) {
        // Count how many rows have the same movieId
        let count = 1;
        for (let i = index + 1; i < sorted.length; i++) {
          if (sorted[i].movieId === showtime.movieId) {
            count++;
          } else {
            break;
          }
        }
        movieRowSpan = count;
      }

      // Calculate cinema rowSpan
      let cinemaRowSpan = 0; // 0: don't show, > 0: show with rowSpan
      const isFirstCinemaRow =
        isFirstMovieRow ||
        (index > 0 &&
          sorted[index - 1].movieId === showtime.movieId &&
          (cinemaIdMap.get(sorted[index - 1].roomId) || "") !== cinemaId);

      if (isFirstCinemaRow) {
        // Count how many rows have the same cinemaId within the same movie group
        let count = 1;
        for (let i = index + 1; i < sorted.length; i++) {
          if (
            sorted[i].movieId === showtime.movieId &&
            (cinemaIdMap.get(sorted[i].roomId) || "") === cinemaId
          ) {
            count++;
          } else {
            break;
          }
        }
        cinemaRowSpan = count;
      }

      // Create a group identifier
      // Same group: same movie + same cinema
      const groupId = `${showtime.movieId}_${cinemaId}`;

      return {
        ...showtime,
        _movieRowSpan: movieRowSpan,
        _cinemaRowSpan: cinemaRowSpan,
        _cinemaId: cinemaId,
        _groupId: groupId,
      };
    });

    return result;
  }, [data?.data, roomsData, cinemasData]);

  const columns = createShowtimeColumns({
    onRefresh: () => refetch(),
    onEdit: handleEditClick,
    movieMap,
    roomCinemaMap,
  });

  return (
    <div className="h-full">
      <ShowtimesDataTable
        columns={columns}
        data={groupedData}
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
        onMovieChange={handleMovieChange}
        onCinemaChange={handleCinemaChange}
        onActiveStatusChange={handleActiveStatusChange}
        movies={moviesData?.data || []}
        cinemas={cinemasData?.data || []}
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
