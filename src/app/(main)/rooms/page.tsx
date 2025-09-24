"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  Grid3X3,
  Users,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockRooms = [
  {
    id: "1",
    name: "Theater 1",
    cinema: "CGV Vincom",
    totalSeats: 120,
    normalSeats: 80,
    vipSeats: 30,
    coupleSeats: 10,
    isActive: true,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "IMAX Hall",
    cinema: "CGV Landmark",
    totalSeats: 200,
    normalSeats: 150,
    vipSeats: 40,
    coupleSeats: 10,
    isActive: true,
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    name: "Theater 3",
    cinema: "CGV Vincom",
    totalSeats: 80,
    normalSeats: 60,
    vipSeats: 15,
    coupleSeats: 5,
    isActive: false,
    createdAt: "2024-01-05",
  },
];

export default function RoomsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rooms] = useState(mockRooms);

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.cinema.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteRoom = (roomId: string) => {
    if (confirm("Are you sure you want to delete this room?")) {
      console.log("Deleting room:", roomId);
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Cinema Rooms</h1>
          <p className="text-gray-600 mt-1">
            Manage your cinema rooms and seat layouts
          </p>
        </div>

        <Link href="/rooms/layout-designer">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus size={16} />
            Create New Room
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <Input
                placeholder="Search rooms or cinemas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{room.name}</CardTitle>
                <Badge variant={room.isActive ? "default" : "secondary"}>
                  {room.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin size={14} className="mr-1" />
                {room.cinema}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Seat Statistics */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Seats:</span>
                  <span className="font-semibold">{room.totalSeats}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Normal:</span>
                  <span className="font-medium">{room.normalSeats}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">VIP:</span>
                  <span className="font-medium text-yellow-600">
                    {room.vipSeats}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Couple:</span>
                  <span className="font-medium text-pink-600">
                    {room.coupleSeats}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <Link
                  href={`/rooms/layout-designer?roomId=${room.id}`}
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit size={14} />
                    Edit Layout
                  </Button>
                </Link>

                <Button variant="outline" size="sm">
                  <Eye size={14} />
                  Preview
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteRoom(room.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredRooms.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Grid3X3 size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No rooms found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? "No rooms match your search criteria."
                : "Get started by creating your first cinema room."}
            </p>
            <Link href="/rooms/layout-designer">
              <Button>
                <Plus size={16} />
                Create Your First Room
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Statistics Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} />
            Overview Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {rooms.length}
              </div>
              <div className="text-sm text-gray-600">Total Rooms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {rooms.filter((r) => r.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Rooms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {rooms.reduce((sum, room) => sum + room.totalSeats, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Seats</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {rooms.reduce((sum, room) => sum + room.vipSeats, 0)}
              </div>
              <div className="text-sm text-gray-600">VIP Seats</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
