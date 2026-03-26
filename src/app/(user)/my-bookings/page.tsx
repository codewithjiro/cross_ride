"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Card } from "~/components/ui/card";
import { BookingCard } from "~/components/user/booking-card";

interface BookingDetail {
  id: string;
  status: "pending" | "approved" | "completed" | "rejected" | "cancelled";
  createdAt: string;
  seatsBooked: number;
  department?: string;
  trip: {
    route: string;
    departureTime: string;
    status?: string;
    cancelReason?: string;
    driver?: {
      name: string;
    };
    van?: {
      name: string;
      plateNumber: string;
    };
  };
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "pending" | "approved" | "completed"
  >("all");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/bookings");
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          setBookings(data);
        }
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getFilteredBookings = () => {
    let filtered;
    switch (activeFilter) {
      case "pending":
        filtered = bookings.filter((b) => b.status === "pending");
        break;
      case "approved":
        filtered = bookings.filter((b) => b.status === "approved");
        break;
      case "completed":
        filtered = bookings.filter((b) => b.status === "completed");
        break;
      case "all":
      default:
        filtered = bookings;
    }
    // Sort by createdAt descending (newest first)
    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  };

  const getPendingCount = () =>
    bookings.filter((b) => b.status === "pending").length;
  const getApprovedCount = () =>
    bookings.filter((b) => b.status === "approved").length;
  const getCompletedCount = () =>
    bookings.filter((b) => b.status === "completed").length;

  const filteredBookings = getFilteredBookings();

  const renderBookingCards = (bookingList: BookingDetail[]) =>
    bookingList.map((booking) => (
      <BookingCard
        key={booking.id}
        id={booking.id}
        status={booking.status}
        route={booking.trip?.route || "Unknown Route"}
        seatsBooked={booking.seatsBooked}
        driverName={booking.trip?.driver?.name || "Unknown"}
        departureTime={booking.trip?.departureTime || ""}
        vanName={booking.trip?.van?.name || "Unknown"}
        plateNumber={booking.trip?.van?.plateNumber || "Unknown"}
        createdAt={booking.createdAt}
        department={booking.department || ""}
        tripStatus={booking.trip?.status}
        cancelReason={booking.trip?.cancelReason}
      />
    ));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071d3a] p-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold text-white">My Bookings</h1>
          <div className="mt-8 text-gray-400">Loading bookings...</div>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen bg-[#071d3a] p-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold text-white">My Bookings</h1>
          <p className="mt-2 text-gray-400">
            View and manage all your transportation bookings
          </p>
          <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
            <p className="text-gray-400">
              No bookings yet. Start exploring available trips!
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071d3a] p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">My Bookings</h1>
          <p className="mt-2 text-gray-400">
            View and manage all your transportation bookings
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => setActiveFilter("all")}
            className={`flex items-center gap-2 rounded-lg px-6 py-2 font-medium transition-all ${
              activeFilter === "all"
                ? "bg-[#f1c44f] text-[#071d3a]"
                : "border border-[#f1c44f]/30 text-[#f1c44f] hover:bg-[#f1c44f]/10"
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            onClick={() => setActiveFilter("pending")}
            className={`flex items-center gap-2 rounded-lg px-6 py-2 font-medium transition-all ${
              activeFilter === "pending"
                ? "bg-yellow-500 text-[#071d3a]"
                : "border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            }`}
          >
            <AlertCircle size={18} />
            Pending ({getPendingCount()})
          </button>
          <button
            onClick={() => setActiveFilter("approved")}
            className={`flex items-center gap-2 rounded-lg px-6 py-2 font-medium transition-all ${
              activeFilter === "approved"
                ? "bg-green-500 text-[#071d3a]"
                : "border border-green-500/30 text-green-400 hover:bg-green-500/10"
            }`}
          >
            <Clock size={18} />
            Approved ({getApprovedCount()})
          </button>
          <button
            onClick={() => setActiveFilter("completed")}
            className={`flex items-center gap-2 rounded-lg px-6 py-2 font-medium transition-all ${
              activeFilter === "completed"
                ? "bg-blue-500 text-white"
                : "border border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            }`}
          >
            <CheckCircle2 size={18} />
            Completed ({getCompletedCount()})
          </button>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
            <p className="text-gray-400">
              {activeFilter === "all" && "No bookings found."}
              {activeFilter === "pending" && "No pending bookings."}
              {activeFilter === "approved" && "No approved bookings."}
              {activeFilter === "completed" && "No completed bookings."}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {renderBookingCards(filteredBookings)}
          </div>
        )}
      </div>
    </div>
  );
}
