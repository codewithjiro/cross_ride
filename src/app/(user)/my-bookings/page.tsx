import { Suspense } from "react";
import { db } from "~/server/db";
import { bookings } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { MapPin, Calendar, Users, Trash2 } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

// Force dynamic rendering (no static prerendering)
export const dynamic = "force-dynamic";

async function MyBookingsTable() {
  const { userId } = await auth();
  if (!userId) return null;

  const userBookings = await db.query.bookings.findMany({
    where: eq(bookings.userId, userId),
    with: {
      trip: {
        with: {
          van: true,
          driver: true,
        },
      },
    },
    orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
  });

  return (
    <div className="space-y-4">
      {userBookings.length === 0 ? (
        <Card className="bg-[#0a2540] border-[#f1c44f]/20 p-6">
          <p className="text-gray-400">No bookings yet. Start exploring available trips!</p>
        </Card>
      ) : (
        userBookings.map((booking) => (
          <Card key={booking.id} className="bg-[#0a2540] border-[#f1c44f]/20 p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <MapPin className="text-[#f1c44f] mt-1" size={20} />
                  <div>
                    <h3 className="text-xl font-bold text-white">{booking.trip?.route}</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Driver: {booking.trip?.driver?.name || "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 ml-8">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar size={16} />
                    {new Date(booking.trip?.departureTime || "").toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Users size={16} />
                    {booking.seatsBooked} seat{booking.seatsBooked !== 1 ? "s" : ""} booked
                  </div>
                </div>

                <div className="mt-4 ml-8">
                  <p className="text-sm text-gray-400">
                    Van: {booking.trip?.van?.name} ({booking.trip?.van?.plateNumber})
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Booked on {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <Badge
                  className={`capitalize ${
                    booking.status === "approved"
                      ? "bg-green-500/20 text-green-400"
                      : booking.status === "pending"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {booking.status}
                </Badge>
                {booking.status === "pending" && (
                  <Button variant="ghost" className="gap-2 text-red-400 hover:text-red-300">
                    <Trash2 size={16} />
                    Cancel
                  </Button>
                )}
                {booking.status !== "pending" && (
                  <p className="text-xs text-gray-500">No action available</p>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

export default function MyBookings() {
  return (
    <div className="min-h-screen bg-[#071d3a] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">My Bookings</h1>
          <p className="text-gray-400 mt-2">View and manage all your transportation bookings</p>
        </div>

        {/* Bookings List */}
        <Suspense fallback={<div className="text-white">Loading bookings...</div>}>
          <MyBookingsTable />
        </Suspense>
      </div>
    </div>
  );
}
