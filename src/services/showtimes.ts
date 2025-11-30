import { Showtime } from "@/types/showtime";
import instance from "@/configs/axiosConfig";

export interface GetShowtimesParams {
  page?: number;
  limit?: number;
  movieId?: string;
  cinemaId?: string;
  isActive?: boolean;
  startTime?: string;
  endTime?: string;
}

export interface ShowtimesResponse {
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  data: Showtime[];
}

export interface CreateShowtimeRequest {
  movieId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  price: number;
  language: string;
  subtitle: boolean;
  format: string;
}

export interface UpdateShowtimeRequest {
  movieId?: string;
  roomId?: string;
  startTime?: string;
  endTime?: string;
  price?: number;
  language?: string;
  subtitle?: boolean;
  format?: string;
}

export const getAllShowtimes = async (
  params?: GetShowtimesParams
): Promise<ShowtimesResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.movieId) queryParams.append("movieId", params.movieId);
    if (params?.cinemaId) queryParams.append("cinemaId", params.cinemaId);
    if (params?.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());
    if (params?.startTime) queryParams.append("startTime", params.startTime);
    if (params?.endTime) queryParams.append("endTime", params.endTime);

    const response = await instance.get(
      `/v1/showtimes/public?${queryParams.toString()}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getShowtimes = async (
  params?: GetShowtimesParams
): Promise<ShowtimesResponse> => {
  return getAllShowtimes(params);
};

export const getShowtimeById = async (id: string) => {
  try {
    const response = await instance.get(`/v1/showtimes/public/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createShowtime = async (
  showtimeData: CreateShowtimeRequest
): Promise<{ data: Showtime }> => {
  try {
    const response = await instance.post("/v1/showtimes", showtimeData);

    if (response.status !== 201 && response.status !== 200) {
      const error = response.data;
      throw new Error(error.message || "Failed to create showtime");
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateShowtime = async (
  id: string,
  showtimeData: UpdateShowtimeRequest
): Promise<{ data: Showtime }> => {
  try {
    const response = await instance.put(`/v1/showtimes/${id}`, showtimeData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const archiveShowtime = async (
  id: string
): Promise<{ message: string }> => {
  try {
    const response = await instance.put(`/v1/showtimes/archive/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const restoreShowtime = async (
  id: string
): Promise<{ message: string }> => {
  try {
    const response = await instance.put(`/v1/showtimes/restore/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBusyRoomIds = async (
  startTime: string,
  endTime: string,
  cinemaId?: string
): Promise<{ data: string[] }> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("startTime", startTime);
    queryParams.append("endTime", endTime);
    if (cinemaId) queryParams.append("cinemaId", cinemaId);

    const response = await instance.get(
      `/v1/showtimes/public/get-busy-rooms?${queryParams.toString()}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
