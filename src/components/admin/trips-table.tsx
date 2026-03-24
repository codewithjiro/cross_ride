"use client";

import { Trash2, MapPin, Users } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

// Type definitions matching what Drizzle ORM returns
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

interface TripsTableProps {
  trips: TripWithRelations[];
  loading: boolean;
  onCancel: (id: number) => void | Promise<void>;
}

export function TripsTable({ trips, loading, onCancel }: TripsTableProps) {
  if (trips.length === 0) {
    return <div className="p-8 text-center text-gray-400">No trips found</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30";
      case "scheduled":
        return "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-300 hover:bg-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 hover:bg-gray-500/30";
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-[#f1c44f]/20 bg-[#0a2540]">
          <th className="px-6 py-4 text-left font-semibold text-[#f1c44f]">
            Route
          </th>
          <th className="px-6 py-4 text-left font-semibold text-[#f1c44f]">
            Van
          </th>
          <th className="px-6 py-4 text-left font-semibold text-[#f1c44f]">
            Driver
          </th>
          <th className="px-6 py-4 text-left font-semibold text-[#f1c44f]">
            Departure
          </th>
          <th className="px-6 py-4 text-left font-semibold text-[#f1c44f]">
            Seats
          </th>
          <th className="px-6 py-4 text-left font-semibold text-[#f1c44f]">
            Status
          </th>
          <th className="px-6 py-4 text-right font-semibold text-[#f1c44f]">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {trips.map((trip) => (
          <tr
            key={trip.id}
            className="border-b border-[#f1c44f]/10 transition-colors hover:bg-[#0a2540]/50"
          >
            <td className="px-6 py-4">
              <div className="flex items-center gap-2 text-white">
                <MapPin size={16} className="text-[#f1c44f]" />
                {trip.route}
              </div>
            </td>
            <td className="px-6 py-4 text-gray-300">
              {trip.van?.plateNumber || "N/A"}
            </td>
            <td className="px-6 py-4 text-gray-300">
              {trip.driver?.name || "N/A"}
            </td>
            <td className="px-6 py-4 text-gray-300">
              {formatDate(trip.departureTime)}
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2 text-white">
                <Users size={16} className="text-[#f1c44f]" />
                {trip.seatsAvailable}
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="space-y-2">
                <Badge
                  className={`${getStatusColor(
                    trip.status,
                  )} cursor-default border-0 font-semibold uppercase`}
                >
                  {trip.status}
                </Badge>
                {trip.status === "cancelled" && trip.cancelReason && (
                  <div className="text-xs text-gray-400">
                    <span className="font-semibold">Reason:</span>{" "}
                    {trip.cancelReason}
                  </div>
                )}
              </div>
            </td>
            <td className="px-6 py-4 text-right">
              <div className="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  onClick={() => onCancel(trip.id)}
                  disabled={
                    loading ||
                    trip.status === "cancelled" ||
                    trip.status === "completed"
                  }
                  className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                  variant="outline"
                >
                  <Trash2 size={16} />
                  Cancel
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
