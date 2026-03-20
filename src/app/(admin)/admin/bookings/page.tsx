import { Suspense } from "react";
import { db } from "~/server/db";
import { bookings } from "~/server/db/schema";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

// Force dynamic rendering (no static prerendering)
export const dynamic = "force-dynamic";
import { Badge } from "~/components/ui/badge";
import { Check, X, MapPin, Users } from "lucide-react";

async function BookingsTable() {
  const allBookings = await db.query.bookings.findMany({
    with: {
      user: true,
      trip: {
        with: {
          van: true,
          driver: true,
        },
      },
    },
    orderBy: (bookings, { desc }) => [desc(bookings.id)],
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#f1c44f]/20 bg-[#0a2540]">
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">Passenger</th>
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">Route</th>
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">Van</th>
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">Seats</th>
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">Status</th>
            <th className="px-6 py-3 text-left text-[#f1c44f] font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {allBookings.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                No bookings yet.
              </td>
            </tr>
          ) : (
            allBookings.map((booking) => (
              <tr key={booking.id} className="border-b border-[#f1c44f]/10 hover:bg-[#0a2540]/50 transition-colors">
                <td className="px-6 py-4 text-white font-medium">
                  {booking.user?.firstName} {booking.user?.lastName}
                </td>
                <td className="px-6 py-4 text-gray-300 flex items-center gap-2">
                  <MapPin size={16} className="text-[#f1c44f]" />
                  {booking.trip?.route}
                </td>
                <td className="px-6 py-4 text-gray-300">{booking.trip?.van?.name}</td>
                <td className="px-6 py-4 flex items-center gap-2 text-gray-300">
                  <Users size={16} />
                  {booking.seatsBooked}
                </td>
                <td className="px-6 py-4">
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
                </td>
                <td className="px-6 py-4">
                  {booking.status === "pending" && (
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-green-500/20 rounded-lg transition-colors text-green-400" title="Approve">
                        <Check size={18} />
                      </button>
                      <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400" title="Reject">
                        <X size={18} />
                      </button>
                    </div>
                  )}
                  {booking.status !== "pending" && (
                    <span className="text-gray-500 text-xs">No action</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Bookings</h1>
        <p className="text-gray-400">Review and approve passenger bookings</p>
      </div>

      <Card className="bg-[#0a2540] border-[#f1c44f]/20">
        <Suspense fallback={<div className="p-8 text-white">Loading bookings...</div>}>
          <BookingsTable />
        </Suspense>
      </Card>
    </div>
  );
}
