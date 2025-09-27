import CinemaDetails from "@/app/(main)/cinemas/[id]/cinema-details";

export const metadata = {
  title: "Cinema Details",
  description: "Cinema details and room management",
};

export default function CinemaDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <CinemaDetails cinemaId={params.id} />
    </div>
  );
}
