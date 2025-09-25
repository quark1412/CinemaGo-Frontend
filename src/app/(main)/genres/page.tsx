import AllGenres from "@/app/(main)/genres/all-genres";

export const metadata = {
  title: "All genres",
  description: "Genre management",
};

export default function GenresPage() {
  return (
    <div>
      <AllGenres />
    </div>
  );
}
