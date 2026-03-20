import { Suspense } from "react";
import Link from "next/link";
import { db } from "~/server/db";
import { trips as tripsTable, bookings } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "~/lib/auth";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { MapPin, Calendar, Users, ArrowRight } from "lucide-react";

// Force dynamic rendering (no static prerendering)
export const dynamic = "force-dynamic";

async function AvailableTripsTable() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Get all trips with pending bookings to exclude them
  const tripsWithPending = await db
    .select({ tripId: bookings.tripId })
    .from(bookings)
    .where(eq(bookings.status, "pending"));

  const pendingTripIds = tripsWithPending.map((b) => b.tripId);

  // Get current user's bookings to exclude
  const userBookings = await db
    .select({ tripId: bookings.tripId })
    .from(bookings)
    .where(eq(bookings.userId, user.id));

  const userBookedTripIds = userBookings.map((b) => b.tripId);

  const availableTrips = await db.query.trips.findMany({
    where: (trips, { eq, gt, and, notInArray }) =>
      and(
        eq(trips.status, "scheduled"),
        gt(trips.seatsAvailable, 0),
        gt(trips.departureTime, new Date()),
        pendingTripIds.length > 0
          ? notInArray(trips.id, pendingTripIds)
          : undefined,
        userBookedTripIds.length > 0
          ? notInArray(trips.id, userBookedTripIds)
          : undefined,
      ),
    with: {
      van: true,
      driver: true,
    },
    orderBy: (trips, { asc }) => [asc(trips.departureTime)],
  });

  return (
    <div className="space-y-4">
      {availableTrips.length === 0 ? (
        <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
          <p className="text-gray-400">No available trips at the moment.</p>
        </Card>
      ) : (
        availableTrips.map((trip) => (
          <Card key={trip.id} className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 text-[#f1c44f]" size={20} />
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {trip.route}
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Driver: {trip.driver?.name || "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 ml-8 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar size={16} />
                    {new Date(trip.departureTime).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users size={16} />
                    {trip.seatsAvailable}/
                    {trip.seatsAvailable + trip.seatsReserved} seats available
                  </div>
                </div>

                <div className="mt-4 ml-8">
                  <p className="text-sm text-gray-400">
                    Van: {trip.van?.name} ({trip.van?.plateNumber})
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <Badge className="bg-green-500/20 text-green-400">
                  Available
                </Badge>
                <Link href={`/available-trips/${trip.id}`}>
                  <Button className="gap-2 bg-[#f1c44f] text-[#071d3a] hover:bg-[#f1c44f]/90">
                    Book Now
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

export default function AvailableTrips() {
  return (
    <div className="min-h-screen bg-[#071d3a] p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Available Trips</h1>
          <p className="mt-2 text-gray-400">
            Browse and book upcoming transportation services
          </p>
        </div>

        {/* Trips List */}
        <Suspense fallback={<div className="text-white">Loading trips...</div>}>
          <AvailableTripsTable />
        </Suspense>
      </div>
    </div>
  );
}
