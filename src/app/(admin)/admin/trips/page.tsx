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
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">Route</th>
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">Van</th>
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">Driver</th>
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">Departure</th>
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">Seats</th>
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">Status</th>
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">Actions</th>
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
              <tr key={trip.id} className="border-b border-[#f1c44f]/10 hover:bg-[#0a2540]/50 transition-colors">
                <td className="px-6 py-4 text-white font-medium flex items-center gap-2">
                  <MapPin size={16} className="text-[#f1c44f]" />
                  {trip.route}
                </td>
                <td className="px-6 py-4 text-gray-300">{trip.van?.name}</td>
                <td className="px-6 py-4 text-gray-300">{trip.driver?.name}</td>
                <td className="px-6 py-4 text-gray-300 text-xs">
                  {new Date(trip.departureTime).toLocaleString()}
                </td>
                <td className="px-6 py-4 flex items-center gap-2 text-gray-300">
                  <Users size={16} />
                  {trip.seatsReserved}/{trip.seatsAvailable}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={trip.status === "scheduled" ? "default" : "secondary"} className="bg-[#f1c44f]/20 text-[#f1c44f] capitalize">
                    {trip.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400">
                    <Edit size={18} />
                  </button>
                  <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400">
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

      <Card className="bg-[#0a2540] border-[#f1c44f]/20">
        <Suspense fallback={<div className="p-8 text-white">Loading trips...</div>}>
          <TripsTable />
        </Suspense>
      </Card>
    </div>
  );
}
