"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Zap, CheckCircle2 } from "lucide-react";

interface AutoCompleteStats {
  completedTrips: number;
  inProgressTrips: number;
  cancelledTripsProcessed: number;
}

export function AutoCompleteBookings() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AutoCompleteStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRunTime, setLastRunTime] = useState<string | null>(null);

  const handleAutoComplete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/bookings/auto-complete", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to run auto-complete");
      }

      const data = await response.json();
      setStats(data.stats);
      setLastRunTime(new Date().toLocaleString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
      <div className="mb-6 flex items-center gap-3">
        <Zap size={28} className="text-[#f1c44f]" />
        <h2 className="text-2xl font-bold text-white">
          Auto-Complete Bookings
        </h2>
      </div>

      <p className="mb-6 text-sm text-gray-400">
        Automatically complete bookings for trips that have passed their arrival
        time, update in-progress trips, and handle cancelled trips.
      </p>

      <Button
        onClick={handleAutoComplete}
        disabled={loading}
        className="mb-6 flex items-center gap-2 bg-[#f1c44f] font-semibold text-[#071d3a] hover:bg-[#f1c44f]/90 disabled:opacity-50"
      >
        <Zap size={18} />
        {loading ? "Processing..." : "Run Auto-Complete Now"}
      </Button>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-200">❌ Error: {error}</p>
        </div>
      )}

      {stats && (
        <div className="space-y-3 rounded-lg border border-[#f1c44f]/20 bg-[#0f2d4a]/40 p-4">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle2 size={16} className="text-green-500" />
              Completed Trips
            </p>
            <span className="font-bold text-white">{stats.completedTrips}</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm text-gray-400">
              <Zap size={16} className="text-blue-500" />
              In-Progress Trips
            </p>
            <span className="font-bold text-white">
              {stats.inProgressTrips}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm text-gray-400">
              <span className="text-red-500">❌</span>
              Cancelled Trips Processed
            </p>
            <span className="font-bold text-white">
              {stats.cancelledTripsProcessed}
            </span>
          </div>
          {lastRunTime && (
            <p className="mt-4 border-t border-[#f1c44f]/10 pt-3 text-xs text-gray-500">
              Last run: {lastRunTime}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
