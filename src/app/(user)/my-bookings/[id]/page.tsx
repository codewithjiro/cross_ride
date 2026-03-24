import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { db } from "~/server/db";
import { bookings } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "~/lib/auth";
import {
  MapPin,
  Calendar,
  Users,
  Car,
  Clock,
  ArrowLeft,
  Building2,
  Pencil,
} from "lucide-react";
import RoutePreview from "./route-preview";

export const dynamic = "force-dynamic";

function parseRouteParts(route: string | null | undefined) {
  if (!route) return { pickup: null, dropoff: null };
  const pickupMatch = route.match(/Pickup:\s*(.*?)\s*→/);
  const dropoffMatch = route.match(/→\s*Dropoff:\s*([^|]+)(?:\||$)/);
  return {
    pickup: pickupMatch?.[1]?.trim() || null,
    dropoff: dropoffMatch?.[1]?.trim() || null,
  };
}

export default async function BookingDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const bookingId = Number(id);
  if (Number.isNaN(bookingId)) notFound();

  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
    with: {
      trip: {
        with: {
          van: true,
          driver: true,
        },
      },
    },
  });

  if (!booking || booking.userId !== user.id) notFound();

  const { pickup, dropoff } = parseRouteParts(booking.trip?.route);

  return (
    <div className="min-h-screen bg-[#071d3a] p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-2">
          <Link
            href="/my-bookings"
            className="mb-2 inline-flex items-center text-sm text-gray-300 hover:text-white"
          >
            <ArrowLeft size={16} className="mr-2" /> Back to My Bookings
          </Link>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">Trip Details</h1>
              <Badge
                className={`text-sm capitalize ${
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
            {booking.status === "pending" && (
              <Link href={`/my-bookings/${booking.id}/edit`}>
                <Button className="gap-2 bg-[#f1c44f] font-semibold text-[#071d3a] hover:bg-[#f1c44f]/90">
                  <Pencil size={16} />
                  Edit Booking
                </Button>
              </Link>
            )}
          </div>
          <p className="mt-2 flex items-center gap-2 text-gray-300">
            <MapPin size={16} className="text-[#f1c44f]" />
            {booking.trip?.route || "Route unavailable"}
          </p>
        </div>

        <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Schedule</h3>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Calendar size={16} />
                Departure:{" "}
                {booking.trip?.departureTime
                  ? new Date(booking.trip.departureTime).toLocaleString("en-US", {
                      month: "numeric",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "TBD"}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Clock size={16} />
                Arrival:{" "}
                {booking.trip?.arrivalTime
                  ? new Date(booking.trip.arrivalTime).toLocaleString("en-US", {
                      month: "numeric",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "TBD"}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Users size={16} /> Seats booked: {booking.seatsBooked}
              </div>
              {booking.department && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Building2 size={16} /> Department: {booking.department}
                </div>
              )}
              <p className="text-xs text-gray-500">
                Booked on{" "}
                {booking.createdAt
                  ? new Date(booking.createdAt).toLocaleString("en-US", {
                      month: "numeric",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : ""}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">
                Vehicle & Driver
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Car size={16} /> Van: {booking.trip?.van?.name || "Unknown"}
              </div>
              <div className="text-sm text-gray-300">
                Plate: {booking.trip?.van?.plateNumber || "Unknown"}
              </div>
              <div className="text-sm text-gray-300">
                Driver: {booking.trip?.driver?.name || "Unknown"}
              </div>
            </div>
          </div>
        </Card>

        {pickup && dropoff ? (
          <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
            <h3 className="mb-3 text-lg font-semibold text-white">
              Route Preview
            </h3>
            <RoutePreview pickupLabel={pickup} dropoffLabel={dropoff} />
          </Card>
        ) : (
          <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
            <p className="text-sm text-gray-300">
              Route preview unavailable. Missing pickup or dropoff details.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
