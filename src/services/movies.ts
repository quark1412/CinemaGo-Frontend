import { Movie } from "@/types/movie";

export const getAllMovies = async () => {};
export const getMovieById = async (id: string) => {};
export const createMovie = async (movieData: {
  title: string;
  description: string;
  duration: number;
  genres: string[];
  thumbnail: File;
  trailer: File;
}) => {
  const formData = new FormData();

  // Add text fields
  formData.append("title", movieData.title);
  formData.append("description", movieData.description);
  formData.append("duration", movieData.duration.toString());
  formData.append("releaseDate", new Date().toISOString());
  formData.append("genresIds", movieData.genres.join(","));

  // Add files
  formData.append("thumbnail", movieData.thumbnail);
  formData.append("trailer", movieData.trailer);

  const response = await fetch("/api/movies", {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create movie");
  }

  return response.json();
};
export const updateMovie = async (id: string, movie: Movie) => {};
export const deleteMovie = async (id: string) => {};
