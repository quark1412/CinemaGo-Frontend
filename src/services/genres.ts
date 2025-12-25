import { Genre } from "@/types/genre";
import instance from "@/configs/axiosConfig";

export interface GetGenresParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface GenresResponse {
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  data: Genre[];
}

export const getAllGenres = async (
  params?: GetGenresParams
): Promise<GenresResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());

    const response = await instance.get(
      `/v1/genres/public?${queryParams.toString()}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getGenreById = async (id: string): Promise<{ data: Genre }> => {
  try {
    const response = await instance.get(`/v1/genres/public/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createGenre = async (genreData: {
  name: string;
  description: string;
}): Promise<{ data: Genre }> => {
  try {
    const response = await instance.post("/v1/genres", genreData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateGenre = async (
  id: string,
  genreData: {
    name: string;
    description: string;
  }
): Promise<{ data: Genre }> => {
  try {
    const response = await instance.put(`/v1/genres/${id}`, genreData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const archiveGenre = async (
  id: string
): Promise<{ message: string }> => {
  try {
    const response = await instance.put(`/v1/genres/archive/${id}`, {});
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const restoreGenre = async (
  id: string
): Promise<{ message: string }> => {
  try {
    const response = await instance.put(`/v1/genres/restore/${id}`, {});
    return response.data;
  } catch (error) {
    throw error;
  }
};
