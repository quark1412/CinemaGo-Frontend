import { useState, useEffect, useCallback, useRef } from "react";
import { useReviews } from "@/hooks/use-reviews";
import { GetReviewsParams } from "@/services/reviews";

import { getAllUsers } from "@/services/users";
import { getAllMovies } from "@/services/movies";

import { getUserById } from "@/services/users";
import { getMovieById } from "@/services/movies";

import { User } from "@/types/user";
import { Movie } from "@/types/movie";

export type UserMap = Record<string, User>;
export type MovieMap = Record<string, Movie>;

async function fetchAllPages<T extends { id: string }>(
  apiCall: (params: { page: number; limit: number }) => Promise<any>
): Promise<Record<string, T>> {
  let allData: T[] = [];
  let page = 1;
  const limit = 100;
  let hasNextPage = true;

  while (hasNextPage) {
    try {
      const res = await apiCall({ page, limit });
      const items = res.data?.data || res.data || [];
      const pagination = res.data?.pagination || res.pagination;
      allData = [...allData, ...items];
      if (pagination && page < pagination.totalPages) {
        page++;
      } else {
        hasNextPage = false;
      }
    } catch (error) {
      hasNextPage = false;
    }
  }
  return allData.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<string, T>);
}

export function useReviewTable(initialParams: GetReviewsParams) {
  const [params, setParams] = useState<GetReviewsParams>(initialParams);
  const {
    data: reviewData,
    isLoading: isLoadingReviews,
    refetch,
  } = useReviews(params);

  const [userMap, setUserMap] = useState<UserMap>({});
  const [movieMap, setMovieMap] = useState<MovieMap>({});

  const isInitialMapLoaded = useRef(false);
  const [isLoadingMaps, setIsLoadingMaps] = useState(true);

  useEffect(() => {
    const initMaps = async () => {
      try {
        setIsLoadingMaps(true);
        console.log("Fetching ALL users and movies (Initial)...");
        const [users, movies] = await Promise.all([
          fetchAllPages<User>(getAllUsers),
          fetchAllPages<Movie>(getAllMovies),
        ]);
        setUserMap(users);
        setMovieMap(movies);
        isInitialMapLoaded.current = true;
      } catch (error) {
        console.log("Failed to load reference maps", error);
      } finally {
        setIsLoadingMaps(false);
      }
    };
    initMaps();
  }, []);

  useEffect(() => {
    const patchMissingData = async () => {
      if (!isInitialMapLoaded.current || !reviewData?.data) return;

      const reviews = reviewData.data;

      const missingUserIds = Array.from(
        new Set(reviews.map((r) => r.userId).filter((id) => !userMap[id]))
      );

      const missingMovieIds = Array.from(
        new Set(reviews.map((r) => r.movieId).filter((id) => !movieMap[id]))
      );

      if (missingUserIds.length === 0 && missingMovieIds.length === 0) return;

      console.log("Found missing data, patching...", {
        missingUserIds,
        missingMovieIds,
      });

      const [newUsers, newMovies] = await Promise.all([
        Promise.all(
          missingUserIds.map((id) => getUserById(id).catch(() => null))
        ),
        Promise.all(
          missingMovieIds.map((id) => getMovieById(id).catch(() => null))
        ),
      ]);

      if (missingUserIds.length > 0) {
        setUserMap((prev) => {
          const next = { ...prev };
          newUsers.forEach((u: any) => {
            const user = u?.data || u;
            if (user?.id) next[user.id] = user;
          });
          return next;
        });
      }

      if (missingMovieIds.length > 0) {
        setMovieMap((prev) => {
          const next = { ...prev };
          newMovies.forEach((m: any) => {
            const movie = m?.data || m;
            if (movie?.id) next[movie.id] = movie;
          });
          return next;
        });
      }
    };

    patchMissingData();
  }, [reviewData, userMap, movieMap]);

  const handlePaginationChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({ ...prev, page, limit: pageSize }));
    },
    []
  );

  const setMovieFilter = useCallback((movieId?: string) => {
    setParams((prev) => ({ ...prev, page: 1, movieId }));
  }, []);

  const setStatusFilter = useCallback((status?: string) => {
    setParams((prev) => ({ ...prev, page: 1, status }));
  }, []);

  const setVisibilityFilter = useCallback((visibility?: string) => {
    const isActive =
      visibility === "visible"
        ? true
        : visibility === "hidden"
        ? false
        : undefined;
    setParams((prev) => ({ ...prev, page: 1, isActive }));
  }, []);

  return {
    isLoading: isLoadingReviews || isLoadingMaps,
    refresh: refetch,
    reviews: reviewData?.data || [],
    pagination: reviewData?.pagination || {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: 10,
      hasNextPage: false,
      hasPrevPage: false,
    },
    maps: { userMap, movieMap },
    params,
    onPaginationChange: handlePaginationChange,

    setMovieFilter,
    setStatusFilter,
    setVisibilityFilter,
  };
}
