"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  MapPin,
  Calendar,
  Users,
  Trash2,
  CheckCircle2,
  Truck,
  Clock,
  Building2,
  Pencil,
} from "lucide-react";

interface BookingCardProps {
  id: number;
  status: "pending" | "approved" | "completed" | "rejected" | "cancelled";
  route: string;
  seatsBooked: number;
  driverName: string;
  departureTime: string;
  vanName: string;
  plateNumber: string;
  createdAt: Date;
  department: string;
  onCompleted?: () => void;
  tripStatus?: string;
  cancelReason?: string | null;
}

export function BookingCard({
  id,
  status,
  route,
  seatsBooked,
  driverName,
  departureTime,
  vanName,
  plateNumber,
  createdAt,
  department,
  onCompleted,
  tripStatus,
  cancelReason,
}: BookingCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleMarkCompleted = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/bookings/${id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to mark as completed");
        return;
      }

      // Success - refresh page
      window.location.reload();
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/bookings/${id}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to cancel booking");
        return;
      }

      window.location.reload();
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
      setShowCancelConfirm(false);
    }
  };

  return (
    <Card className="overflow-hidden border-[#f1c44f]/20 bg-gradient-to-br from-[#0a2540] to-[#051a2f] p-0 shadow-lg transition-all hover:border-[#f1c44f]/40 hover:shadow-xl hover:shadow-[#f1c44f]/10">
      {/* Header Section with Status */}
      <div className="border-b border-[#f1c44f]/10 bg-[#0f2d4a] px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-[#f1c44f] uppercase">
              <MapPin size={16} />
              Route
            </div>
            <h3 className="mt-2 text-xl leading-tight font-bold text-white">
              {route}
            </h3>
          </div>
          <Badge
            className={`px-3 py-1 text-sm font-semibold whitespace-nowrap capitalize ${
              status === "approved"
                ? "border border-green-500/30 bg-green-500/20 text-green-300"
                : status === "pending"
                  ? "border border-yellow-500/30 bg-yellow-500/20 text-yellow-300"
                  : status === "completed"
                    ? "border border-blue-500/30 bg-blue-500/20 text-blue-300"
                    : "border border-red-500/30 bg-red-500/20 text-red-300"
            }`}
          >
            {status}
          </Badge>
        </div>
      </div>

      {/* Trip Cancellation Alert */}
      {tripStatus === "cancelled" && cancelReason && (
        <div className="border-b border-red-500/20 bg-red-500/10 px-6 py-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 pt-0.5">
              <svg
                className="h-5 w-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-red-300">Trip Cancelled</h4>
              <p className="mt-1 text-sm text-red-200">{cancelReason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-4">
        {/* Driver Info */}
        <div className="mb-6 flex items-center gap-3 border-b border-[#f1c44f]/10 pb-4 text-gray-300">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f1c44f]/20">
            <Users size={18} className="text-[#f1c44f]" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Driver
            </p>
            <p className="text-sm font-semibold text-white">{driverName}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Date & Time */}
          <div className="rounded-lg border border-[#f1c44f]/10 bg-[#0a2540]/50 p-3">
            <p className="mb-1 flex items-center gap-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              <Clock size={12} />
              Departure
            </p>
            <p className="text-sm font-semibold text-white">
              {new Date(departureTime).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-[#f1c44f]">
              {new Date(departureTime).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>

          {/* Seats */}
          <div className="rounded-lg border border-[#f1c44f]/10 bg-[#0a2540]/50 p-3">
            <p className="mb-1 flex items-center gap-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              <Users size={12} />
              Seats
            </p>
            <p className="text-sm font-semibold text-white">{seatsBooked}</p>
            <p className="text-xs text-gray-500">
              {seatsBooked === 1 ? "seat" : "seats"} booked
            </p>
          </div>

          {/* Van */}
          <div className="rounded-lg border border-[#f1c44f]/10 bg-[#0a2540]/50 p-3">
            <p className="mb-1 flex items-center gap-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              <Truck size={12} />
              Van
            </p>
            <p className="text-sm font-semibold text-white">{vanName}</p>
            <p className="text-xs text-[#f1c44f]">{plateNumber}</p>
          </div>

          {/* Department */}
          <div className="rounded-lg border border-[#f1c44f]/10 bg-[#0a2540]/50 p-3">
            <p className="mb-1 flex items-center gap-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              <Building2 size={12} />
              Dept
            </p>
            <p className="truncate text-sm font-semibold text-white">
              {department ? department.split(" ").slice(0, 2).join(" ") : "N/A"}
            </p>
            <p className="text-xs text-gray-500">
              Booked {new Date(createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-xs text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 border-t border-[#f1c44f]/10 bg-[#0f2d4a] px-6 py-4">
        <Button
          asChild
          variant="outline"
          className="border-[#f1c44f]/30 bg-[#0a2540] font-semibold text-white hover:border-[#f1c44f]/50 hover:bg-[#0a2540]/80"
        >
          <Link href={`/my-bookings/${id}`}>View Details</Link>
        </Button>

        <div className="flex items-center gap-2">
          {status === "pending" && (
            <Button
              asChild
              className="gap-2 bg-[#f1c44f] font-semibold text-[#071d3a] hover:bg-[#f1c44f]/90"
            >
              <Link href={`/my-bookings/${id}/edit`}>
                <Pencil size={16} />
                Edit
              </Link>
            </Button>
          )}

          {status === "approved" && (
            <Button
              onClick={handleMarkCompleted}
              disabled={loading}
              className="gap-2 bg-green-600/80 font-semibold text-white hover:bg-green-600"
            >
              <CheckCircle2 size={16} />
              {loading ? "Marking..." : "Complete"}
            </Button>
          )}

          {status === "pending" && (
            <Button
              onClick={() => setShowCancelConfirm(true)}
              variant="ghost"
              className="gap-2 font-semibold text-red-400 hover:bg-red-600/20 hover:text-red-300"
              disabled={loading}
            >
              <Trash2 size={16} />
              Cancel
            </Button>
          )}

          {status !== "pending" && status !== "approved" && (
            <p className="text-xs text-gray-500 italic">In history</p>
          )}
        </div>
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[#f1c44f]/30 bg-gradient-to-br from-[#0a2540] to-[#051a2f] p-6 shadow-2xl">
            <h4 className="text-lg font-bold text-white">Cancel Booking?</h4>
            <p className="mt-3 text-sm leading-relaxed text-gray-300">
              This will free your reserved seats and move the booking to your
              trip history. You can rebook later if slots are available.
            </p>
            {error && (
              <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-xs text-red-300">
                {error}
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                className="border-[#f1c44f]/30 font-semibold text-white hover:bg-[#f1c44f]/10"
                onClick={() => setShowCancelConfirm(false)}
                disabled={loading}
              >
                Keep Booking
              </Button>
              <Button
                onClick={handleCancelBooking}
                disabled={loading}
                className="bg-red-600/80 font-semibold text-white hover:bg-red-600"
              >
                {loading ? "Cancelling..." : "Confirm Cancel"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
