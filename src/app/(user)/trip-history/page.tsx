import { Suspense } from "react";
import { db } from "~/server/db";
import { bookings } from "~/server/db/schema";
import { eq, or, and } from "drizzle-orm";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { MapPin, Calendar, Users } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

// Force dynamic rendering (no static prerendering)
export const dynamic = "force-dynamic";

async function TripHistoryTable() {
  const { userId } = await auth();
  if (!userId) return null;

  const pastTrips = await db.query.bookings.findMany({
    where: (bookings, { eq, or, and }) =>
      and(
        eq(bookings.userId, userId),
        or(
          eq(bookings.status, "approved"),
          eq(bookings.status, "cancelled")
        )
      ),
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
      {pastTrips.length === 0 ? (
        <Card className="bg-[#0a2540] border-[#f1c44f]/20 p-6">
          <p className="text-gray-400">No trip history yet.</p>
        </Card>
      ) : (
        pastTrips.map((booking, index) => (
          <Card key={booking.id} className="bg-[#0a2540] border-[#f1c44f]/20 p-6">
            <div className="flex items-start gap-6">
              {/* Timeline marker */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#f1c44f] flex items-center justify-center text-[#071d3a] font-bold text-sm">
                  {index + 1}
                </div>
                {index < pastTrips.length - 1 && (
                  <div className="w-0.5 h-24 bg-[#f1c44f]/20 mt-2" />
                )}
              </div>

              {/* Trip details */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-[#f1c44f]" />
                      <h3 className="text-lg font-bold text-white">{booking.trip?.route}</h3>
                    </div>
                    <p className="text-gray-400 text-sm mt-1 ml-6">
                      Driver: {booking.trip?.driver?.name || "Unknown"}
                    </p>
                  </div>
                  <Badge
                    className={`capitalize ${
                      booking.status === "approved"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {booking.status === "approved" ? "Completed" : booking.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4 ml-6">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar size={14} />
                    {new Date(booking.trip?.departureTime || "").toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Users size={14} />
                    {booking.seatsBooked} seat{booking.seatsBooked !== 1 ? "s" : ""}
                  </div>
                  <div className="text-gray-400 text-sm">
                    Van: {booking.trip?.van?.name}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

export default function TripHistory() {
  return (
    <div className="min-h-screen bg-[#071d3a] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Trip History</h1>
          <p className="text-gray-400 mt-2">View your completed and cancelled trips</p>
        </div>

        {/* Trip History Timeline */}
        <Suspense fallback={<div className="text-white">Loading trip history...</div>}>
          <TripHistoryTable />
        </Suspense>
      </div>
    </div>
  );
}
