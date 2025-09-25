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
      `/genres/public?${queryParams.toString()}`,
      {
        requiresAuth: true,
      } as any
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getGenreById = async (id: string): Promise<{ data: Genre }> => {
  try {
    const response = await instance.get(`/genres/public/${id}`, {
      requiresAuth: true,
    } as any);
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
    const response = await instance.post("/genres", genreData, {
      requiresAuth: true,
    } as any);
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
    const response = await instance.put(`/genres/${id}`, genreData, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const archiveGenre = async (
  id: string
): Promise<{ message: string }> => {
  try {
    const response = await instance.put(`/genres/archive/${id}`, {}, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const restoreGenre = async (
  id: string
): Promise<{ message: string }> => {
  try {
    const response = await instance.put(`/genres/restore/${id}`, {}, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};
