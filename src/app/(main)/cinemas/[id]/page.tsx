import CinemaDetails from "@/app/(main)/cinemas/[id]/cinema-details";

export const metadata = {
  title: "Cinema Details",
  description: "Cinema details and room management",
};

export default async function CinemaDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <CinemaDetails cinemaId={id} />
    </div>
  );
}
