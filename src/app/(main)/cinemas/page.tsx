import AllCinemas from "@/app/(main)/cinemas/all-cinemas";

export const metadata = {
  title: "All cinemas",
  description: "Cinema management",
};

export default function CinemasPage() {
  return (
    <div>
      <AllCinemas />
    </div>
  );
}
