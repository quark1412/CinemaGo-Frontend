import AllRooms from "@/app/(main)/rooms/all-rooms";

export const metadata = {
  title: "All rooms",
  description: "Room management",
};

export default function RoomsPage() {
  return (
    <div>
      <AllRooms />
    </div>
  );
}
