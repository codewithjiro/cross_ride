"use client";

import { useState } from "react";
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
  seatsRequested: number;
}

export default function RequestTrip() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<BookingRequest>({
    vanId: "",
    driverId: "",
    date: "",
    seatsRequested: 1,
  });

  const selectedVan = VANS.find((v) => v.id === formData.vanId);
  const selectedDriver = DRIVERS.find((d) => d.id === formData.driverId);

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
      // Parse date to get departureTime and create arrival time (2 hours later)
      const depDateTime = new Date(formData.date);
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
              <MapPin className="mb-2 inline mr-2" size={20} />
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
                  <p className="mt-2 text-xs text-gray-500">{van.description}</p>
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

          {/* Date & Seats */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                <Calendar className="mb-2 inline mr-2" size={16} />
                Preferred Date
              </label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full rounded-lg border border-gray-600 bg-[#071d3a] px-4 py-2 text-white focus:border-[#f1c44f] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                <Users className="mb-2 inline mr-2" size={16} />
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
                  {new Date(formData.date).toLocaleString()}
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
