import { Metadata } from "next";

type Props = {
  params: Promise<{ movieId: string }>;
};

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const movieId = (await params).movieId;
  return {
    title: `Movie Details ${movieId}`,
  };
};

export default async function MovieDetails({ params }: Props) {
  const movieId = (await params).movieId;
  return <div>Movie Details {movieId}</div>;
}
