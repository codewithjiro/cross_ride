"use client";

import { useState, useEffect } from "react";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { MapPin, Calendar, Users, CheckCircle2, XCircle } from "lucide-react";

interface TripHistoryBooking {
  id: number;
  status: "completed" | "rejected" | "cancelled";
  seatsBooked: number;
  trip: {
    route: string;
    departureTime: Date | string;
    driver: { name: string } | null;
    van: { name: string } | null;
    status?: string;
    cancelReason?: string | null;
  } | null;
}

async function fetchTripHistory() {
  try {
    const response = await fetch("/api/bookings");
    if (!response.ok) return [];
    const bookings = await response.json();
    return bookings.filter(
      (b: TripHistoryBooking) =>
        b.status === "completed" ||
        b.status === "rejected" ||
        b.status === "cancelled",
    );
  } catch (error) {
    console.error("Failed to fetch trip history:", error);
    return [];
  }
}

function TripHistoryTable({
  trips,
  filter,
}: {
  trips: TripHistoryBooking[];
  filter: string;
}) {
  const filteredTrips =
    filter === "all"
      ? trips
      : trips.filter((b) => {
          if (filter === "completed") return b.status === "completed";
          if (filter === "cancelled")
            return b.status === "cancelled" || b.status === "rejected";
          return true;
        });

  if (filteredTrips.length === 0) {
    return (
      <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
        <p className="text-gray-400">
          {filter === "all"
            ? "No trip history yet."
            : filter === "completed"
              ? "No completed trips yet."
              : "No cancelled trips yet."}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {filteredTrips.map((booking, index) => (
        <Card key={booking.id} className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
          <div className="flex items-start gap-6">
            {/* Timeline marker */}
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1c44f] text-sm font-bold text-[#071d3a]">
                {index + 1}
              </div>
              {index < filteredTrips.length - 1 && (
                <div className="mt-2 h-24 w-0.5 bg-[#f1c44f]/20" />
              )}
            </div>

            {/* Trip details */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-[#f1c44f]" />
                    <h3 className="text-lg font-bold text-white">
                      {booking.trip?.route}
                    </h3>
                  </div>
                  <p className="mt-1 ml-6 text-sm text-gray-400">
                    Driver: {booking.trip?.driver?.name || "Unknown"}
                  </p>
                </div>
                <Badge
                  className={`capitalize ${
                    booking.status === "completed"
                      ? "bg-blue-500/20 text-blue-300"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {booking.status}
                </Badge>
              </div>

              <div className="mt-4 ml-6 grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar size={14} />
                  {new Date(
                    booking.trip?.departureTime || "",
                  ).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Users size={14} />
                  {booking.seatsBooked} seat
                  {booking.seatsBooked !== 1 ? "s" : ""}
                </div>
                <div className="text-sm text-gray-400">
                  Van: {booking.trip?.van?.name}
                </div>
              </div>

              {/* Trip Cancellation Reason */}
              {booking.trip?.status === "cancelled" &&
                booking.trip?.cancelReason && (
                  <div className="mt-4 ml-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                    <p className="text-xs font-semibold tracking-wide text-red-300 uppercase">
                      Cancellation Reason
                    </p>
                    <p className="mt-1 text-sm text-red-200">
                      {booking.trip.cancelReason}
                    </p>
                  </div>
                )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function TripHistory() {
  const [trips, setTrips] = useState<TripHistoryBooking[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrips = async () => {
      setLoading(true);
      const data = await fetchTripHistory();
      setTrips(data);
      setLoading(false);
    };
    loadTrips();
  }, []);

  const completedCount = trips.filter((t) => t.status === "completed").length;
  const cancelledCount = trips.filter(
    (t) => t.status === "cancelled" || t.status === "rejected",
  ).length;

  return (
    <div className="min-h-screen bg-[#071d3a] p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Trip History</h1>
          <p className="mt-2 text-gray-400">
            View your completed and cancelled trips
          </p>
        </div>

        {/* Filter Buttons */}
        {!loading && trips.length > 0 && (
          <div className="mb-6 flex gap-3">
            <Button
              onClick={() => setFilter("all")}
              className={`${
                filter === "all"
                  ? "bg-[#f1c44f] text-[#071d3a] hover:bg-[#f1c44f]/90"
                  : "border border-[#f1c44f]/30 bg-transparent text-[#f1c44f] hover:bg-[#f1c44f]/10"
              }`}
            >
              All ({trips.length})
            </Button>
            <Button
              onClick={() => setFilter("completed")}
              className={`flex items-center gap-2 ${
                filter === "completed"
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "border border-blue-500/30 bg-transparent text-blue-300 hover:bg-blue-500/10"
              }`}
            >
              <CheckCircle2 size={16} />
              Completed ({completedCount})
            </Button>
            <Button
              onClick={() => setFilter("cancelled")}
              className={`flex items-center gap-2 ${
                filter === "cancelled"
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "border border-red-500/30 bg-transparent text-red-300 hover:bg-red-500/10"
              }`}
            >
              <XCircle size={16} />
              Cancelled ({cancelledCount})
            </Button>
          </div>
        )}

        {/* Trip History Timeline */}
        {loading ? (
          <div className="text-white">Loading trip history...</div>
        ) : (
          <TripHistoryTable trips={trips} filter={filter} />
        )}
      </div>
    </div>
  );
}
