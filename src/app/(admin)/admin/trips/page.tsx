import { Suspense } from "react";
import { db } from "~/server/db";
import { trips } from "~/server/db/schema";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

// Force dynamic rendering (no static prerendering)
export const dynamic = "force-dynamic";
import { Badge } from "~/components/ui/badge";
import { Plus, Edit, Trash2, MapPin, Users } from "lucide-react";

async function TripsTable() {
  const allTrips = await db.query.trips.findMany({
    with: {
      van: true,
      driver: true,
    },
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#f1c44f]/20 bg-[#0a2540]">
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Route
            </th>
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Van
            </th>
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Driver
            </th>
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Departure
            </th>
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Seats
            </th>
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Status
            </th>
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {allTrips.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                No trips scheduled yet.
              </td>
            </tr>
          ) : (
            allTrips.map((trip) => (
              <tr
                key={trip.id}
                className="border-b border-[#f1c44f]/10 transition-colors hover:bg-[#0a2540]/50"
              >
                <td className="flex items-center gap-2 px-6 py-4 font-medium text-white">
                  <MapPin size={16} className="text-[#f1c44f]" />
                  {trip.route}
                </td>
                <td className="px-6 py-4 text-gray-300">{trip.van?.name}</td>
                <td className="px-6 py-4 text-gray-300">{trip.driver?.name}</td>
                <td className="px-6 py-4 text-xs text-gray-300">
                  {new Date(trip.departureTime).toLocaleString("en-US", {
                    month: "numeric",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </td>
                <td className="flex items-center gap-2 px-6 py-4 text-gray-300">
                  <Users size={16} />
                  {trip.seatsReserved}/{trip.seatsAvailable}
                </td>
                <td className="px-6 py-4">
                  <Badge
                    variant={
                      trip.status === "scheduled" ? "default" : "secondary"
                    }
                    className="bg-[#f1c44f]/20 text-[#f1c44f] capitalize"
                  >
                    {trip.status}
                  </Badge>
                </td>
                <td className="flex gap-2 px-6 py-4">
                  <button className="rounded-lg p-2 text-blue-400 transition-colors hover:bg-blue-500/20">
                    <Edit size={18} />
                  </button>
                  <button className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/20">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function TripsPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Trips</h1>
          <p className="text-gray-400">Schedule and manage transport routes</p>
        </div>
        <Button className="gap-2 bg-[#f1c44f] text-[#071d3a] hover:bg-[#f1c44f]/90">
          <Plus size={20} />
          Schedule Trip
        </Button>
      </div>

      <Card className="border-[#f1c44f]/20 bg-[#0a2540]">
        <Suspense
          fallback={<div className="p-8 text-white">Loading trips...</div>}
        >
          <TripsTable />
        </Suspense>
      </Card>
    </div>
  );
}
