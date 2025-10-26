import { Movie } from "@/types/movie";
import instance from "@/configs/axiosConfig";

export interface GetMoviesParams {
  page?: number;
  limit?: number;
  search?: string;
  rating?: number;
  genreQuery?: string;
  isActive?: boolean;
  status?: string;
}

export interface MoviesResponse {
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  data: Movie[];
}

export const getAllMovies = async (
  params?: GetMoviesParams
): Promise<MoviesResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.rating) queryParams.append("rating", params.rating.toString());
    if (params?.genreQuery) queryParams.append("genreQuery", params.genreQuery);
    if (params?.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());
    if (params?.status) queryParams.append("status", params.status);

    const response = await instance.get(
      `/movies/public?${queryParams.toString()}`,
      {
        requiresAuth: true,
      } as any
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getMovieById = async (id: string) => {
  try {
    const response = await instance.get(`/movies/public/${id}`, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const createMovie = async (movieData: {
  title: string;
  description: string;
  duration: number;
  genres: string[];
  thumbnail: File;
  trailer: File;
}) => {
  try {
    const formData = new FormData();

    formData.append("title", movieData.title);
    formData.append("description", movieData.description);
    formData.append("duration", movieData.duration.toString());
    formData.append("releaseDate", new Date().toISOString());
    formData.append("genresIds", movieData.genres.join(","));

    formData.append("thumbnail", movieData.thumbnail);
    formData.append("trailer", movieData.trailer);

    const response = await instance.post("/movies", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      requiresAuth: true,
    } as any);

    if (response.status !== 201 && response.status !== 200) {
      const error = response.data;
      throw new Error(error.message || "Failed to create movie");
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};
export const updateMovie = async (
  id: string,
  movieData: {
    title: string;
    description: string;
    duration: number;
    releaseDate: string;
    genresIds: string;
    thumbnail?: File;
    trailer?: File;
  }
): Promise<{ data: Movie }> => {
  try {
    const formData = new FormData();

    formData.append("title", movieData.title);
    formData.append("description", movieData.description);
    formData.append("duration", movieData.duration.toString());
    formData.append("releaseDate", movieData.releaseDate);
    formData.append("genresIds", movieData.genresIds);

    if (movieData.thumbnail) {
      formData.append("thumbnail", movieData.thumbnail);
    }
    if (movieData.trailer) {
      formData.append("trailer", movieData.trailer);
    }

    const response = await instance.put(`/movies/${id}`, formData, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const archiveMovie = async (
  id: string
): Promise<{ message: string }> => {
  try {
    const response = await instance.put(`/movies/archive/${id}`, {}, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const restoreMovie = async (
  id: string
): Promise<{ message: string }> => {
  try {
    const response = await instance.put(`/movies/restore/${id}`, {}, {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};
