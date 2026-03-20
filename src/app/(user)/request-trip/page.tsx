"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { VANS, DRIVERS } from "~/lib/data";
import { MapPin, Users, Calendar, Loader2, ArrowLeft } from "lucide-react";

interface BookingRequest {
  vanId: string;
  driverId: string;
  date: string;
  time: string;
  seatsRequested: number;
}

interface AvailabilityData {
  dates: Array<{ value: string; label: string }>;
  times: Array<{ value: string; label: string }>;
}

export default function RequestTrip() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availability, setAvailability] = useState<AvailabilityData | null>(
    null,
  );
  const [loadingAvailability, setLoadingAvailability] = useState(true);

  const [formData, setFormData] = useState<BookingRequest>({
    vanId: "",
    driverId: "",
    date: "",
    time: "08:00",
    seatsRequested: 1,
  });

  const selectedVan = VANS.find((v) => v.id === formData.vanId);
  const selectedDriver = DRIVERS.find((d) => d.id === formData.driverId);

  // Fetch availability from API
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await fetch("/api/bookings/availability");
        const data = await response.json();
        if (response.ok) {
          setAvailability(data);
          // Set first available date by default
          if (data.dates.length > 0) {
            setFormData((prev) => ({ ...prev, date: data.dates[0].value }));
          }
          // Set first available time by default
          if (data.times.length > 0) {
            setFormData((prev) => ({ ...prev, time: data.times[0].value }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch availability:", err);
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.vanId || !formData.driverId || !formData.date) {
      setError("Please select a van, driver, and date");
      return;
    }

    if (formData.seatsRequested < 1) {
      setError("Please select at least 1 seat");
      return;
    }

    setLoading(true);

    try {
      // Combine date and time: "2026-03-20" + "08:00" = "2026-03-20T08:00"
      const dateTimeString = `${formData.date}T${formData.time}`;
      const depDateTime = new Date(dateTimeString);
      const arrDateTime = new Date(depDateTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

      const response = await fetch("/api/bookings/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vanId: parseInt(formData.vanId),
          driverId: parseInt(formData.driverId),
          route: `Holy Cross College Route`,
          departureTime: depDateTime.toISOString(),
          arrivalTime: arrDateTime.toISOString(),
          seatsRequested: formData.seatsRequested,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create booking request");
        return;
      }

      // Success - redirect to my bookings
      router.push("/my-bookings?success=true");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071d3a] p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Request a Trip</h1>
          <p className="mt-2 text-gray-400">
            Book a van and driver for your transportation needs
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-red-500/20 bg-red-500/10 p-4">
            <p className="text-red-400">{error}</p>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Select Van */}
          <div>
            <label className="mb-4 block text-lg font-bold text-white">
              <MapPin className="mr-2 mb-2 inline" size={20} />
              Select a Van
            </label>
            <div className="grid gap-4 md:grid-cols-3">
              {VANS.map((van) => (
                <Card
                  key={van.id}
                  className={`cursor-pointer border-2 p-4 transition-all ${
                    formData.vanId === van.id
                      ? "border-[#f1c44f] bg-[#f1c44f]/10"
                      : "border-[#f1c44f]/20 bg-[#0a2540] hover:border-[#f1c44f]/40"
                  }`}
                  onClick={() => setFormData({ ...formData, vanId: van.id })}
                >
                  <h3 className="font-bold text-white">{van.name}</h3>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                    <Users size={16} />
                    {van.capacity} seats
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {van.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Select Driver */}
          <div>
            <label className="mb-4 block text-lg font-bold text-white">
              Select a Driver
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              {DRIVERS.map((driver) => (
                <Card
                  key={driver.id}
                  className={`cursor-pointer border-2 p-4 transition-all ${
                    formData.driverId === driver.id
                      ? "border-[#f1c44f] bg-[#f1c44f]/10"
                      : "border-[#f1c44f]/20 bg-[#0a2540] hover:border-[#f1c44f]/40"
                  }`}
                  onClick={() =>
                    setFormData({ ...formData, driverId: driver.id })
                  }
                >
                  <h3 className="font-bold text-white">{driver.name}</h3>
                  <p className="text-sm text-gray-400">{driver.role}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {driver.experience} experience
                  </p>
                  <p className="text-xs text-[#f1c44f]">
                    {driver.specialization}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Calendar Date Picker */}
          <div>
            <label className="mb-4 block text-lg font-bold text-white">
              <Calendar className="mr-2 mb-2 inline" size={20} />
              Select Departure Date
            </label>
            {loadingAvailability ? (
              <div className="rounded-lg border border-gray-600 bg-[#071d3a] px-4 py-2 text-gray-400">
                Loading dates...
              </div>
            ) : (
              <select
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full rounded-lg border border-gray-600 bg-[#071d3a] px-4 py-2 text-white focus:border-[#f1c44f] focus:outline-none"
                required
              >
                <option value="">Select a date</option>
                {availability?.dates.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Time Grid Picker */}
          <div>
            <label className="mb-4 block text-lg font-bold text-white">
              Select Departure Time
            </label>
            {loadingAvailability ? (
              <div className="rounded-lg border border-gray-600 bg-[#071d3a] px-4 py-2 text-gray-400">
                Loading times...
              </div>
            ) : (
              <select
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="w-full rounded-lg border border-gray-600 bg-[#071d3a] px-4 py-2 text-white focus:border-[#f1c44f] focus:outline-none"
                required
              >
                {availability?.times.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Seats Selection */}
          <div>
            <label className="mb-4 block text-lg font-bold text-white">
              <Users className="mr-2 mb-2 inline" size={20} />
              Number of Seats
            </label>
            <select
              value={formData.seatsRequested}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  seatsRequested: parseInt(e.target.value),
                })
              }
              className="w-full rounded-lg border border-gray-600 bg-[#071d3a] px-4 py-2 text-white focus:border-[#f1c44f] focus:outline-none"
              required
            >
              {selectedVan ? (
                Array.from({ length: selectedVan.capacity }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? "seat" : "seats"}
                  </option>
                ))
              ) : (
                <option>Select van first</option>
              )}
            </select>
          </div>

          {/* Summary */}
          {selectedVan && selectedDriver && formData.date && (
            <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
              <h3 className="mb-4 font-bold text-white">Request Summary</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>
                  <span className="text-gray-300">Van:</span> {selectedVan.name}
                </p>
                <p>
                  <span className="text-gray-300">Driver:</span>{" "}
                  {selectedDriver.name}
                </p>
                <p>
                  <span className="text-gray-300">Date:</span>{" "}
                  {new Date(formData.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  at {formData.time}
                </p>
                <p>
                  <span className="text-gray-300">Seats Requested:</span>{" "}
                  {formData.seatsRequested}
                </p>
              </div>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#f1c44f] font-semibold text-[#071d3a] hover:bg-[#f1c44f]/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>

            <Button
              type="button"
              onClick={() => router.back()}
              className="border border-gray-600 bg-transparent text-white hover:bg-gray-600/20"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
