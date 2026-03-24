import { Suspense } from "react";
import Link from "next/link";
import { db } from "~/server/db";
import { bookings } from "~/server/db/schema";
import { eq } from "drizzle-orm";

// Force dynamic rendering (no static prerendering)
export const dynamic = "force-dynamic";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { MapPin, Calendar, Users } from "lucide-react";
import { getCurrentUser } from "~/lib/auth";
import { DashboardHeader } from "~/components/user/dashboard-header";

async function UpcomingBookings() {
  const user = await getCurrentUser();
  if (!user) return null;

  const userBookings = await db.query.bookings.findMany({
    where: eq(bookings.userId, user.id),
    with: {
      trip: {
        with: {
          van: true,
          driver: true,
        },
      },
    },
    limit: 3,
  });

  return (
    <div className="space-y-4">
      {userBookings.length === 0 ? (
        <p className="text-gray-400">No upcoming bookings yet.</p>
      ) : (
        userBookings.map((booking) => (
          <Card
            key={booking.id}
            className="border-[#f1c44f]/20 bg-[#0a2540] p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <MapPin size={20} className="text-[#f1c44f]" />
                  <h3 className="text-lg font-bold text-white">
                    {booking.trip?.route}
                  </h3>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar size={16} />
                    {new Date(
                      booking.trip?.departureTime || "",
                    ).toLocaleString("en-US", {
                      month: "numeric",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users size={16} />
                    {booking.seatsBooked} seat
                    {booking.seatsBooked !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
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
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

async function TripStats() {
  const user = await getCurrentUser();
  if (!user) return null;

  const userBookings = await db.query.bookings.findMany({
    where: eq(bookings.userId, user.id),
  });

  const approvedBookings = userBookings.filter((b) => b.status === "approved");
  const totalSeatsBooked = userBookings.reduce(
    (sum, b) => sum + b.seatsBooked,
    0,
  );

  return (
    <>
      <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
        <p className="text-sm text-gray-400">Total Bookings</p>
        <p className="text-4xl font-bold text-[#f1c44f]">
          {userBookings.length}
        </p>
      </Card>
      <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
        <p className="text-sm text-gray-400">Approved Trips</p>
        <p className="text-4xl font-bold text-[#f1c44f]">
          {approvedBookings.length}
        </p>
      </Card>
      <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
        <p className="text-sm text-gray-400">Total Seats Booked</p>
        <p className="text-4xl font-bold text-[#f1c44f]">{totalSeatsBooked}</p>
      </Card>
    </>
  );
}

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-[#071d3a] p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <DashboardHeader />

        {/* Stats */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Suspense
            fallback={<div className="text-white">Loading stats...</div>}
          >
            <TripStats />
          </Suspense>
        </div>

        {/* Upcoming Bookings */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Your Upcoming Trips
              </h2>
              <p className="mt-1 text-sm text-gray-400">Your next 3 bookings</p>
            </div>
            <Link href="/request-trip">
              <Button className="bg-[#f1c44f] text-[#071d3a] hover:bg-[#f1c44f]/90">
                Request a Trip
              </Button>
            </Link>
          </div>

          <Suspense
            fallback={<div className="text-white">Loading bookings...</div>}
          >
            <UpcomingBookings />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
