"use client";

import { useEffect, useState } from "react";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { MapPin, Users, Check, X, Loader2 } from "lucide-react";

interface BookingDetail {
  id: number;
  seatsBooked: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  createdAt: string;
  user: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
  trip: {
    route: string;
    departureTime: string;
    van: {
      name: string;
    };
    driver: {
      name: string;
    };
  };
}

export const dynamic = "force-dynamic";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/admin/bookings");
      const data = await response.json();
      if (response.ok) {
        // Sort by newest first (descending order)
        const sortedData = data.sort(
          (a: BookingDetail, b: BookingDetail) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setBookings(sortedData);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (
    bookingId: number,
    status: "approved" | "rejected",
  ) => {
    setActionLoading(bookingId);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Update local state
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status } : b)),
        );
      }
    } catch (error) {
      console.error("Failed to update booking:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const approvedBookings = bookings.filter((b) => b.status === "approved");
  const rejectedBookings = bookings.filter((b) => b.status === "rejected");

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-white">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Bookings Management</h1>
        <p className="text-gray-400">
          Review and manage passenger booking requests
        </p>
      </div>

      {/* Pending Requests Section */}
      {pendingBookings.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#f1c44f]">
              🔔 Pending Requests ({pendingBookings.length})
            </h2>
          </div>
          <div className="space-y-4">
            {pendingBookings.map((booking) => (
              <Card
                key={booking.id}
                className="border-yellow-500/20 bg-yellow-500/5 p-6"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">
                          {booking.user?.firstName} {booking.user?.lastName}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {booking.user?.email}
                        </p>
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 text-gray-300">
                            <MapPin size={16} className="text-[#f1c44f]" />
                            <span className="font-medium">
                              {booking.trip?.route}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <span className="text-sm">
                              Van: <strong>{booking.trip?.van?.name}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <span className="text-sm">
                              Driver:{" "}
                              <strong>{booking.trip?.driver?.name}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Users size={16} />
                            <span>
                              {booking.seatsBooked} seat
                              {booking.seatsBooked > 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            Requested:{" "}
                            {new Date(booking.createdAt).toLocaleString(
                              "en-US",
                              {
                                month: "numeric",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() =>
                        handleApproveReject(booking.id, "approved")
                      }
                      disabled={actionLoading === booking.id}
                      className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading === booking.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                      Approve
                    </Button>
                    <Button
                      onClick={() =>
                        handleApproveReject(booking.id, "rejected")
                      }
                      disabled={actionLoading === booking.id}
                      className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {actionLoading === booking.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <X size={16} />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Approved Bookings Section */}
      {approvedBookings.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-green-400">
            ✓ Approved ({approvedBookings.length})
          </h2>
          <div className="space-y-3">
            {approvedBookings.map((booking) => (
              <Card
                key={booking.id}
                className="border-green-500/20 bg-green-500/5 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">
                      {booking.user?.firstName} {booking.user?.lastName}
                    </p>
                    <p className="text-sm text-gray-400">
                      {booking.trip?.route}
                    </p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">
                    Approved
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Bookings Section */}
      {rejectedBookings.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-bold text-red-400">
            ✗ Rejected ({rejectedBookings.length})
          </h2>
          <div className="space-y-3">
            {rejectedBookings.map((booking) => (
              <Card
                key={booking.id}
                className="border-red-500/20 bg-red-500/5 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">
                      {booking.user?.firstName} {booking.user?.lastName}
                    </p>
                    <p className="text-sm text-gray-400">
                      {booking.trip?.route}
                    </p>
                  </div>
                  <Badge className="bg-red-500/20 text-red-400">Rejected</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {bookings.length === 0 && (
        <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-8 text-center">
          <p className="text-gray-400">No bookings yet.</p>
        </Card>
      )}
    </div>
  );
}
