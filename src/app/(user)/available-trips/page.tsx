import { Suspense } from "react";
import Link from "next/link";
import { db } from "~/server/db";
import { trips as tripsTable } from "~/server/db/schema";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { MapPin, Calendar, Users, ArrowRight } from "lucide-react";

// Force dynamic rendering (no static prerendering)
export const dynamic = "force-dynamic";

async function AvailableTripsTable() {
  const availableTrips = await db.query.trips.findMany({
    where: (trips, { eq, gt, and }) =>
      and(
        eq(trips.status, "scheduled"),
        gt(trips.seatsAvailable, 0),
        gt(trips.departureTime, new Date())
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
        <Card className="bg-[#0a2540] border-[#f1c44f]/20 p-6">
          <p className="text-gray-400">No available trips at the moment.</p>
        </Card>
      ) : (
        availableTrips.map((trip) => (
          <Card key={trip.id} className="bg-[#0a2540] border-[#f1c44f]/20 p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <MapPin className="text-[#f1c44f] mt-1" size={20} />
                  <div>
                    <h3 className="text-xl font-bold text-white">{trip.route}</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Driver: {trip.driver?.name || "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 ml-8">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar size={16} />
                    {new Date(trip.departureTime).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Users size={16} />
                    {trip.seatsAvailable}/{trip.seatsAvailable + trip.seatsReserved} seats available
                  </div>
                </div>

                <div className="mt-4 ml-8">
                  <p className="text-sm text-gray-400">
                    Van: {trip.van?.name} ({trip.van?.plateNumber})
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <Badge className="bg-green-500/20 text-green-400">Available</Badge>
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Available Trips</h1>
          <p className="text-gray-400 mt-2">Browse and book upcoming transportation services</p>
        </div>

        {/* Trips List */}
        <Suspense fallback={<div className="text-white">Loading trips...</div>}>
          <AvailableTripsTable />
        </Suspense>
      </div>
    </div>
  );
}
