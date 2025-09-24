import { Movie } from "@/types/movie";
import instance from "@/configs/axiosConfig";

export const getAllMovies = async () => {
  try {
    const response = await instance.get("/movies", {
      requiresAuth: true,
    } as any);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getMovieById = async (id: string) => {
  try {
    const response = await instance.get(`/movies/${id}`, {
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
      requiresAuth: true,
    } as any);

    if (response.status !== 200) {
      const error = await response.data;
      throw new Error(error.message || "Failed to create movie");
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};
export const updateMovie = async (id: string, movie: Movie) => {};
export const deleteMovie = async (id: string) => {};
