import AllMovies from "@/app/(main)/movies/all-movies";

export const metadata = {
  title: "All movies",
  description: "Movie management",
};

export default function MoviePage() {
  return (
    <div>
      <AllMovies />
    </div>
  );
}
