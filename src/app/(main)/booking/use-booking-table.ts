import { useState, useEffect, useRef, useCallback } from "react";
import { useBookings } from "@/hooks/use-bookings";
import { MyBookingParams } from "@/types/booking";
import { getUserById } from "@/services/users";
import { getShowtimeById } from "@/services/showtimes";
import { getMovieById } from "@/services/movies";
import { getCinemaById, getRoomById } from "@/services/cinemas";
import type { User } from "@/types/user";
import type { Showtime } from "@/types/showtime";
import type { Movie } from "@/types/movie";
import type { Room, Cinema } from "@/types/cinema";

export type UserMap = Record<string, User>;
export type ShowTimeMap = Record<string, Showtime>;
export type MovieMap = Record<string, Movie>;
export type RoomMap = Record<string, Room>;
export type CinemaMap = Record<string, Cinema>;

export function useBookingTable(initialParams: MyBookingParams) {
  const [params, setParams] = useState<MyBookingParams>(initialParams);
  const { data, isLoading, refetch } = useBookings(params);

  const [userMap, setUserMap] = useState<UserMap>({});
  const [showTimeMap, setShowTimeMap] = useState<ShowTimeMap>({});
  const [movieMap, setMovieMap] = useState<MovieMap>({});
  const [roomMap, setRoomMap] = useState<RoomMap>({});
  const [cinemaMap, setCinemaMap] = useState<CinemaMap>({});

  const cache = useRef({
    users: {} as UserMap,
    showTimes: {} as ShowTimeMap,
    movies: {} as MovieMap,
    rooms: {} as RoomMap,
    cinemas: {} as CinemaMap,
  });

  useEffect(() => {
    const fetchRelatedData = async () => {
      if (!data?.data || data.data.length === 0) {
        console.log(" No bookings found or data format wrong:", data);
        return;
      }

      console.log("Start fetching details for", data.data.length, "bookings");
      const bookingList = data.data;

      const missingUserIds = Array.from(
        new Set(
          bookingList
            .map((b) => b.userId)
            .filter((id): id is string => !!id && !cache.current.users[id])
        )
      );

      const missingShowTimeIds = Array.from(
        new Set(
          bookingList
            .map((b) => b.showtimeId)
            .filter((id) => id && !cache.current.showTimes[id])
        )
      );

      console.log(" Missing IDs:", {
        users: missingUserIds,
        showtimes: missingShowTimeIds,
      });

      if (missingUserIds.length > 0 || missingShowTimeIds.length > 0) {
        const [newUsersResults, newShowTimesResults] = await Promise.all([
          Promise.all(
            missingUserIds.map((id) =>
              getUserById(id)
                .then((res) => ({ id, data: res, success: true }))
                .catch((err) => ({ id, err, success: false }))
            )
          ),
          Promise.all(
            missingShowTimeIds.map((id) =>
              getShowtimeById(id)
                .then((res) => ({ id, data: res, success: true }))
                .catch((err) => ({ id, err, success: false }))
            )
          ),
        ]);

        newUsersResults.forEach((res: any) => {
          if (res.success) {
            const userObj = res.data?.data || res.data;

            if (userObj && userObj.id) {
              cache.current.users[userObj.id] = userObj;
            } else {
              console.warn("User data structure weird:", res.data);
            }
          } else {
            console.error(`Failed to fetch User ${res.id}`, res.err);
          }
        });

        newShowTimesResults.forEach((res: any) => {
          if (res.success) {
            const stObj = res.data?.data || res.data;
            if (stObj && stObj.id) {
              cache.current.showTimes[stObj.id] = stObj;
            } else {
              console.warn("Showtime data structure weird:", res.data);
            }
          } else {
            console.error(`Failed to fetch Showtime ${res.id}`, res.err);
          }
        });
      }

      const currentShowTimeIds = Array.from(
        new Set(bookingList.map((b) => b.showtimeId))
      );
      const relatedShowTimes = currentShowTimeIds
        .map((id) => cache.current.showTimes[id])
        .filter(Boolean);

      const missingMovieIds = new Set<string>();
      const missingRoomIds = new Set<string>();
      const missingCinemaIds = new Set<string>();

      relatedShowTimes.forEach((st) => {
        if (st.movieId && !cache.current.movies[st.movieId])
          missingMovieIds.add(st.movieId);
        if (st.roomId && !cache.current.rooms[st.roomId])
          missingRoomIds.add(st.roomId);
        if (st.cinemaId && !cache.current.cinemas[st.cinemaId])
          missingCinemaIds.add(st.cinemaId);
      });

      console.log(" Missing 2nd Level:", {
        movies: Array.from(missingMovieIds),
        rooms: Array.from(missingRoomIds),
        cinemas: Array.from(missingCinemaIds),
      });

      if (
        missingMovieIds.size > 0 ||
        missingRoomIds.size > 0 ||
        missingCinemaIds.size > 0
      ) {
        const [movieRes, roomRes, cinemaRes] = await Promise.all([
          Promise.all(
            Array.from(missingMovieIds).map((id) =>
              getMovieById(id).catch((e) => console.error("Err Movie", id, e))
            )
          ),
          Promise.all(
            Array.from(missingRoomIds).map((id) =>
              getRoomById(id).catch((e) => console.error("Err Room", id, e))
            )
          ),
          Promise.all(
            Array.from(missingCinemaIds).map((id) =>
              getCinemaById(id).catch((e) => console.error("Err Cinema", id, e))
            )
          ),
        ]);

        movieRes.forEach((res: Movie) => {
          const item = res;
          if (item?.id) cache.current.movies[item.id] = item;
        });
        roomRes.forEach((res: any) => {
          const item = res?.data || res;
          if (item?.id) cache.current.rooms[item.id] = item;
        });
        cinemaRes.forEach((res: any) => {
          const item = res?.data || res;
          if (item?.id) cache.current.cinemas[item.id] = item;
        });
      }

      console.log("Final Cache:", cache.current);

      setUserMap({ ...cache.current.users });
      setShowTimeMap({ ...cache.current.showTimes });
      setMovieMap({ ...cache.current.movies });
      setRoomMap({ ...cache.current.rooms });
      setCinemaMap({ ...cache.current.cinemas });
    };

    fetchRelatedData();
  }, [data?.data]);

  const setParamValue = useCallback(
    (key: keyof MyBookingParams, value: any) => {
      setParams((prev) => ({ ...prev, page: 1, [key]: value }));
    },
    []
  );

  const handlePaginationChange = useCallback(
    (page: number, pageSize: number) => {
      setParams((prev) => ({ ...prev, page, limit: pageSize }));
    },
    []
  );

  return {
    bookings: data?.data || [],
    pagination: data?.pagination || {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: 10,
      hasNextPage: false,
      hasPrevPage: false,
    },
    isLoading,
    refresh: refetch,
    maps: {
      userMap,
      showTimeMap,
      movieMap,
      roomMap,
      cinemaMap,
    },
    params,
    setType: (val: string) =>
      setParamValue("type", val === "all" ? undefined : val),
    setShowtime: (val: string) => setParamValue("showtimeId", val || undefined),
    onPaginationChange: handlePaginationChange,
  };
}
