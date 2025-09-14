import { columns } from "@/app/movies/columns";
import { DataTable } from "@/app/movies/data-table";
import { Movie } from "@/types/Movie";

export const metadata = {
  title: "Movies",
  description: "Movie management",
};

async function getMovies(): Promise<Movie[]> {
  return [
    {
      id: "movie001",
      title: "The Lost Kingdom",
      description:
        "An epic adventure of a prince seeking to reclaim his lost throne in a mystical realm.",
      duration: 142,
      releaseDate: new Date("2025-06-21"),
      rating: 8.6,
      thumbnail: "https://cdn.example.com/thumbnails/the-lost-kingdom.jpg",
      thumbnailPublicId: "movies/the-lost-kingdom-thumbnail",
      trailerUrl: "https://cdn.example.com/trailers/the-lost-kingdom.mp4",
      trailerPublicId: "trailers/the-lost-kingdom-trailer",
      genres: [
        {
          id: "genre001",
          name: "Fantasy",
          description: "Magical worlds, mythical creatures, and epic quests.",
          isActive: true,
          createdAt: new Date("2024-01-10"),
          updatedAt: new Date("2024-11-30"),
          movies: [],
        },
        {
          id: "genre002",
          name: "Adventure",
          description: "Exciting journeys and explorations across vast lands.",
          isActive: true,
          createdAt: new Date("2023-10-05"),
          updatedAt: new Date("2025-01-15"),
          movies: [],
        },
      ],
      isActive: true,
      createdAt: new Date("2025-05-01T10:00:00Z"),
      updatedAt: new Date("2025-09-01T14:30:00Z"),
    },
  ];
}

export default async function MoviePage() {
  const movies = await getMovies();

  return (
    <div className="container mx-auto">
      <h1 className="text-xl font-bold font-mono mb-10">Movies</h1>
      <DataTable columns={columns} data={movies} />
    </div>
  );
}
