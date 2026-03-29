"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Users,
  Car,
  Mail,
  Phone,
} from "lucide-react";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

const RouteMap = dynamic(() => import("~/components/maps/route-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 items-center justify-center text-sm text-gray-400">
      Loading map...
    </div>
  ),
});

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
  image?: string;
};

type DbDriver = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  profileImage?: string;
};

type DbUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImage?: string;
};

type DbBooking = {
  id: number;
  userId: string;
  tripId: number;
  seatsBooked: number;
  department?: string | null;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string | null;
  user: DbUser;
};

interface TripWithRelations extends DbTrip {
  van: DbVan | null;
  driver: DbDriver | null;
  bookings?: DbBooking[];
}

interface TripDetailsModalProps {
  trip: TripWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
}

function parseRouteParts(route: string | null | undefined) {
  if (!route) return { pickup: null, dropoff: null, coords: [] };
  const pickupMatch = route.match(/Pickup:\s*(.*?)\s*→/);
  const dropoffMatch = route.match(/→\s*Dropoff:\s*([^|]+)(?:\||$)/);
  return {
    pickup: pickupMatch?.[1]?.trim() || null,
    dropoff: dropoffMatch?.[1]?.trim() || null,
    coords: [],
  };
}

export function TripDetailsModal({
  trip,
  isOpen,
  onClose,
}: TripDetailsModalProps) {
  const [mapData, setMapData] = useState<{
    pickup: { lat: number; lon: number } | null;
    dropoff: { lat: number; lon: number } | null;
    coords: Array<{ lat: number; lon: number }>;
    distance?: string;
    duration?: string;
  } | null>(null);
  const [loadingMap, setLoadingMap] = useState(false);

  useEffect(() => {
    if (!trip || !isOpen) return;

    const fetchCoordinates = async () => {
      setLoadingMap(true);
      const { pickup, dropoff } = parseRouteParts(trip.route);

      try {
        let pickupCoords = null;
        let dropoffCoords = null;

        // Geocode pickup location
        if (pickup) {
          const pickupRes = await fetch(
            `/api/geocode?q=${encodeURIComponent(pickup)}`,
          );
          if (pickupRes.ok) {
            const pickupData = await pickupRes.json();
            if (pickupData.results && pickupData.results.length > 0) {
              pickupCoords = {
                lat: pickupData.results[0].lat,
                lon: pickupData.results[0].lon,
              };
            }
          }
        }

        // Geocode dropoff location
        if (dropoff) {
          const dropoffRes = await fetch(
            `/api/geocode?q=${encodeURIComponent(dropoff)}`,
          );
          if (dropoffRes.ok) {
            const dropoffData = await dropoffRes.json();
            if (dropoffData.results && dropoffData.results.length > 0) {
              dropoffCoords = {
                lat: dropoffData.results[0].lat,
                lon: dropoffData.results[0].lon,
              };
            }
          }
        }

        let routeData = null;
        let distance = undefined;
        let duration = undefined;

        // Fetch route data if both coordinates are available
        if (pickupCoords && dropoffCoords) {
          try {
            const routeRes = await fetch(
              `/api/route?from=${pickupCoords.lat},${pickupCoords.lon}&to=${dropoffCoords.lat},${dropoffCoords.lon}`,
            );
            if (routeRes.ok) {
              const routeResponse = await routeRes.json();
              routeData = routeResponse.route;
              distance = routeData.distanceKm;
              duration = routeData.durationMin;
            }
          } catch (err) {
            console.error("Error fetching route:", err);
          }
        }

        setMapData({
          pickup: pickupCoords,
          dropoff: dropoffCoords,
          coords:
            routeData?.coords?.length > 0
              ? routeData.coords
              : pickupCoords && dropoffCoords
                ? [pickupCoords, dropoffCoords]
                : [],
          distance,
          duration,
        });
      } catch (error) {
        console.error("Error geocoding locations:", error);
        setMapData({
          pickup: null,
          dropoff: null,
          coords: [],
        });
      } finally {
        setLoadingMap(false);
      }
    };

    fetchCoordinates();
  }, [trip, isOpen]);

  if (!isOpen || !trip) return null;

  const { pickup, dropoff } = parseRouteParts(trip.route);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/20 text-amber-300";
      case "scheduled":
        return "bg-emerald-500/20 text-emerald-300";
      case "completed":
        return "bg-green-500/20 text-green-300";
      case "cancelled":
        return "bg-red-500/20 text-red-300";
      default:
        return "bg-gray-500/20 text-gray-300";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <Card className="max-h-[90vh] w-full max-w-5xl overflow-y-auto border-[#f1c44f]/30 bg-gradient-to-br from-[#071d3a] to-[#0a2540] shadow-2xl">
        {/* Header with gradient background */}
        <div className="sticky top-0 border-b border-[#f1c44f]/20 bg-gradient-to-r from-[#0a2540] to-[#0f3050] px-8 py-8 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-12 w-1 rounded-full bg-gradient-to-b from-[#f1c44f] to-yellow-600"></div>
                <div>
                  <h2 className="text-3xl font-bold text-white">
                    Trip Details
                  </h2>
                  <p className="mt-1 flex items-center gap-2 text-sm text-gray-400">
                    <MapPin size={16} className="text-[#f1c44f]" />
                    {trip.route}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                className={`${getStatusColor(trip.status)} px-4 py-1.5 text-sm font-semibold capitalize`}
              >
                {trip.status}
              </Badge>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition-all hover:bg-[#f1c44f]/20 hover:text-[#f1c44f]"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 p-8">
          {/* Schedule & Vehicle Section - Two Column Layout */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Schedule Card */}
            <div className="space-y-4">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-6 w-1 rounded-full bg-[#f1c44f]"></div>
                <h3 className="text-xl font-bold text-white">Schedule</h3>
              </div>
              <div className="space-y-3">
                <div className="group flex items-center gap-3 rounded-xl border border-[#f1c44f]/20 bg-gradient-to-br from-[#0f3050] to-[#0a2540] p-4 transition-all hover:border-[#f1c44f]/40 hover:shadow-lg hover:shadow-[#f1c44f]/10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f1c44f]/10 transition-colors group-hover:bg-[#f1c44f]/20">
                    <Calendar size={20} className="text-[#f1c44f]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                      Departure
                    </p>
                    <p className="font-semibold text-white">
                      {formatDate(trip.departureTime)}
                    </p>
                  </div>
                </div>
                <div className="group flex items-center gap-3 rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-[#0a2540] p-4 transition-all hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 transition-colors group-hover:bg-blue-500/20">
                    <Clock size={20} className="text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                      {trip.status === "completed" ? "Arrival" : "ETA"}
                    </p>
                    <p className="font-semibold text-white">
                      {trip.status === "completed"
                        ? formatDate(trip.arrivalTime)
                        : mapData?.duration
                          ? formatDate(
                              new Date(
                                new Date(trip.departureTime).getTime() +
                                  mapData.duration * 60 * 1000,
                              ),
                            )
                          : formatDate(trip.arrivalTime)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle & Driver Card */}
            <div className="space-y-4">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-6 w-1 rounded-full bg-[#f1c44f]"></div>
                <h3 className="text-xl font-bold text-white">
                  Vehicle & Driver
                </h3>
              </div>
              <div className="space-y-3">
                <div className="group flex items-center gap-3 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-[#0a2540] p-4 transition-all hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 transition-colors group-hover:bg-amber-500/20">
                    <Car size={20} className="text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                      Van
                    </p>
                    <p className="font-semibold text-white">
                      {trip.van?.name || "N/A"}{" "}
                      <span className="text-gray-400">
                        ({trip.van?.plateNumber})
                      </span>
                    </p>
                  </div>
                </div>
                <div className="group flex items-center gap-3 rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-[#0a2540] p-4 transition-all hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-purple-500/20 bg-[#1a3a5c] transition-colors group-hover:border-purple-500/40">
                    {trip.driver?.profileImage ? (
                      <Image
                        src={trip.driver.profileImage}
                        alt={`${trip.driver.firstName} ${trip.driver.surname}`}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-bold text-purple-400">
                        {trip.driver?.firstName?.charAt(0)?.toUpperCase() ||
                          "?"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                      Driver
                    </p>
                    <p className="font-semibold text-white">
                      {trip.driver?.firstName}{" "}
                      {trip.driver?.middleName
                        ? `${trip.driver.middleName} `
                        : ""}
                      {trip.driver?.surname || "N/A"}
                    </p>
                    {trip.driver?.email && (
                      <p className="mt-1 text-xs text-gray-400">
                        {trip.driver.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Capacity Section - Three Column Stats */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 rounded-full bg-[#f1c44f]"></div>
              <h3 className="text-xl font-bold text-white">Seat Capacity</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="group rounded-xl border border-[#f1c44f]/20 bg-gradient-to-br from-[#f1c44f]/10 to-[#0a2540] p-6 text-center transition-all hover:border-[#f1c44f]/40 hover:shadow-lg hover:shadow-[#f1c44f]/10">
                <p className="mb-2 text-sm font-semibold tracking-wide text-gray-300 uppercase">
                  Total Seats
                </p>
                <p className="text-4xl font-bold text-[#f1c44f] transition-transform group-hover:scale-110">
                  {trip.van?.capacity || 0}
                </p>
              </div>
              <div className="group rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-[#0a2540] p-6 text-center transition-all hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10">
                <p className="mb-2 text-sm font-semibold tracking-wide text-gray-300 uppercase">
                  Reserved
                </p>
                <p className="text-4xl font-bold text-emerald-400 transition-transform group-hover:scale-110">
                  {trip.seatsReserved}
                </p>
              </div>
              <div className="group rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-[#0a2540] p-6 text-center transition-all hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10">
                <p className="mb-2 text-sm font-semibold tracking-wide text-gray-300 uppercase">
                  Available
                </p>
                <p className="text-4xl font-bold text-blue-400 transition-transform group-hover:scale-110">
                  {trip.seatsAvailable}
                </p>
              </div>
            </div>
          </div>

          {/* Passenger Information Section */}
          {trip.bookings && trip.bookings.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-1 rounded-full bg-[#f1c44f]"></div>
                  <h3 className="text-xl font-bold text-white">
                    Passengers ({trip.bookings.length})
                  </h3>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {trip.bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="group rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-[#0a2540] p-5 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex flex-1 items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/20 transition-colors group-hover:border-purple-500/50">
                          <Users size={18} className="text-purple-400" />
                        </div>
                        <div>
                          <p className="font-bold text-white transition-colors group-hover:text-purple-300">
                            {booking.user.firstName} {booking.user.lastName}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            Booking ID: #{booking.id}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={`h-fit px-3 py-1 text-xs font-semibold capitalize ${
                          booking.status === "approved"
                            ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
                            : booking.status === "completed"
                              ? "border border-green-500/30 bg-green-500/20 text-green-300"
                              : booking.status === "rejected"
                                ? "border border-red-500/30 bg-red-500/20 text-red-300"
                                : "border border-amber-500/30 bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="space-y-2.5 border-t border-purple-500/10 pt-4">
                      {booking.user.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail
                            size={14}
                            className="flex-shrink-0 text-purple-400"
                          />
                          <span className="text-gray-300">
                            {booking.user.email}
                          </span>
                        </div>
                      )}
                      {booking.user.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone
                            size={14}
                            className="flex-shrink-0 text-purple-400"
                          />
                          <span className="text-gray-300">
                            {booking.user.phoneNumber}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Users
                          size={14}
                          className="flex-shrink-0 text-blue-400"
                        />
                        <span className="text-gray-300">
                          <span className="font-semibold text-white">
                            {booking.seatsBooked}
                          </span>{" "}
                          seat{booking.seatsBooked !== 1 ? "s" : ""} booked
                        </span>
                      </div>
                      {booking.department && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></span>
                          <span className="text-gray-300">
                            <span className="font-semibold text-pink-300">
                              {booking.department}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Locations Section */}
          {pickup || dropoff ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 rounded-full bg-[#f1c44f]"></div>
                <h3 className="text-xl font-bold text-white">
                  Route Locations
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {pickup && (
                  <div className="group rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/5 to-[#0a2540] p-6 transition-all hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
                      <p className="text-xs font-bold tracking-widest text-green-400 uppercase">
                        PICKUP LOCATION
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-white transition-colors group-hover:text-green-300">
                      {pickup}
                    </p>
                  </div>
                )}
                {dropoff && (
                  <div className="group rounded-xl border border-red-500/30 bg-gradient-to-br from-red-500/5 to-[#0a2540] p-6 transition-all hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
                      <p className="text-xs font-bold tracking-widest text-red-400 uppercase">
                        DROPOFF LOCATION
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-white transition-colors group-hover:text-red-300">
                      {dropoff}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Map */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 rounded-full bg-[#f1c44f]"></div>
              <h3 className="text-xl font-bold text-white">Route Map</h3>
            </div>
            {mapData?.distance && mapData?.duration && (
              <div className="flex items-center gap-4 rounded-lg border border-[#f1c44f]/20 bg-[#0a2540]/50 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Distance:</span>
                  <span className="font-bold text-[#f1c44f]">
                    {mapData.distance} km
                  </span>
                </div>
                <div className="h-6 w-px bg-gray-600"></div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Duration:</span>
                  <span className="font-bold text-blue-400">
                    {mapData.duration} mins
                  </span>
                </div>
              </div>
            )}
            <div className="h-96 overflow-hidden rounded-xl border border-[#f1c44f]/20 bg-[#0a2540]/50 shadow-lg">
              {loadingMap ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-[#f1c44f]/30 border-t-[#f1c44f]"></div>
                    <p className="text-gray-400">Loading map...</p>
                  </div>
                </div>
              ) : mapData?.pickup && mapData?.dropoff ? (
                <RouteMap
                  pickup={mapData.pickup}
                  dropoff={mapData.dropoff}
                  coords={mapData.coords}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  <p>Map data unavailable</p>
                </div>
              )}
            </div>
          </div>

          {/* Cancel Reason (if cancelled) */}
          {trip.status === "cancelled" && trip.cancelReason && (
            <div className="rounded-xl border-l-4 border-red-500 bg-gradient-to-r from-red-500/10 to-[#0a2540] p-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <p className="text-sm font-bold tracking-wide text-red-400 uppercase">
                    Cancellation Reason
                  </p>
                </div>
              </div>
              <p className="mt-3 leading-relaxed text-white">
                {trip.cancelReason}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
