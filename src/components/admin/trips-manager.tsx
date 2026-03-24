"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { TripsTable } from "~/components/admin/trips-table";
import { ConfirmationDialog } from "~/components/ui/confirmation-dialog";

// We can't import types directly from schema since they're not exported.
// Instead, we infer types based on what the API/database returns.
// The trips returned from `db.query.trips.findMany({ with: { van: true, driver: true } })`
// include the van and driver relations.

type DbTrip = {
  id: number;
  vanId: number;
  driverId: number;
  route: string;
  departureTime: Date | string;
  arrivalTime: Date | string;
  seatsAvailable: number;
  seatsReserved: number;
  status: string;
  cancelReason?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string | null;
};

type DbVan = {
  id: number;
  name: string;
  plateNumber: string;
  capacity: number;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string | null;
};

type DbDriver = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string | null;
};

interface TripWithRelations extends DbTrip {
  van: DbVan | null;
  driver: DbDriver | null;
}

interface TripsManagerProps {
  initialTrips: TripWithRelations[];
  vans: DbVan[];
  drivers: DbDriver[];
}

export function TripsManager({
  initialTrips,
  vans,
  drivers,
}: TripsManagerProps) {
  const [trips, setTrips] = useState<TripWithRelations[]>(initialTrips);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const handleCancel = (tripId: number) => {
    setTripToDelete(tripId);
    setCancelReason("");
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (tripToDelete === null) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/trips/${tripToDelete}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "cancelled",
          cancelReason: cancelReason || "No reason provided",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to cancel trip");
        setIsDeleting(false);
        return;
      }

      const updatedTrip = await response.json();

      // Update the trip in the list instead of removing it
      setTrips(
        trips.map((t) =>
          t.id === tripToDelete
            ? {
                ...t,
                status: "cancelled",
                cancelReason: cancelReason || "No reason provided",
              }
            : t,
        ),
      );
    } catch (error) {
      alert("Error cancelling trip");
      console.error(error);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setTripToDelete(null);
      setCancelReason("");
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setTripToDelete(null);
    setCancelReason("");
  };

  return (
    <>
      <div className="p-8">
        <div className="mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Trips</h1>
            <p className="text-gray-400">
              View and manage scheduled transport routes
            </p>
          </div>
        </div>

        {trips.filter((t) => t.status === "scheduled").length > 0 ? (
          <>
            <div className="mb-4 flex items-center gap-3">
              <CheckCircle2 size={24} className="text-emerald-400" />
              <h2 className="text-2xl font-bold text-white">
                Scheduled Trips (
                {trips.filter((t) => t.status === "scheduled").length})
              </h2>
            </div>
            <Card className="border-[#f1c44f]/20 bg-[#0a2540]">
              <div className="overflow-x-auto">
                <TripsTable
                  trips={trips.filter((t) => t.status === "scheduled")}
                  loading={loading}
                  onCancel={handleCancel}
                />
              </div>
            </Card>
          </>
        ) : (
          <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-8 text-center">
            <p className="text-gray-400">No scheduled trips at the moment.</p>
          </Card>
        )}

        {trips.filter((t) => t.status === "cancelled").length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Cancelled Trips (
              {trips.filter((t) => t.status === "cancelled").length})
            </h2>
            <Card className="border-[#f1c44f]/20 bg-[#0a2540]">
              <div className="overflow-x-auto">
                <TripsTable
                  trips={trips.filter((t) => t.status === "cancelled")}
                  loading={loading}
                  onCancel={handleCancel}
                />
              </div>
            </Card>
          </div>
        )}

        {trips.filter((t) => t.status === "completed").length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Completed Trips (
              {trips.filter((t) => t.status === "completed").length})
            </h2>
            <Card className="border-[#f1c44f]/20 bg-[#0a2540]">
              <div className="overflow-x-auto">
                <TripsTable
                  trips={trips.filter((t) => t.status === "completed")}
                  loading={loading}
                  onCancel={handleCancel}
                />
              </div>
            </Card>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        title="Cancel Trip"
        description="Are you sure you want to cancel this trip? This action cannot be undone."
        confirmText="Cancel Trip"
        cancelText="Keep Trip"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        showReasonInput={true}
        reasonValue={cancelReason}
        onReasonChange={setCancelReason}
      />
    </>
  );
}
