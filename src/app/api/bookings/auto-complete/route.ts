import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { bookings, trips } from "~/server/db/schema";
import { eq, and, lt, lte, gte } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const now = new Date();

    console.log("=== AUTO-COMPLETE BOOKINGS ===");
    console.log("Current time:", now);

    /**
     * 1. Find trips where ARRIVAL time has passed
     *    Auto-complete all approved bookings and mark trip as completed
     */
    const completedTrips = await db.query.trips.findMany({
      where: and(lte(trips.arrivalTime, now), eq(trips.status, "scheduled")),
    });

    console.log(`\n📍 Found ${completedTrips.length} trips past arrival time`);

    for (const trip of completedTrips) {
      // Find all approved bookings for this trip
      const approvedBookingsForTrip = await db.query.bookings.findMany({
        where: and(
          eq(bookings.tripId, trip.id),
          eq(bookings.status, "approved"),
        ),
      });

      console.log(
        `  Trip ${trip.id}: Completing ${approvedBookingsForTrip.length} bookings`,
      );

      // Auto-complete all approved bookings
      if (approvedBookingsForTrip.length > 0) {
        await db
          .update(bookings)
          .set({
            status: "completed",
            updatedAt: new Date(),
          })
          .where(
            and(eq(bookings.tripId, trip.id), eq(bookings.status, "approved")),
          );
      }

      // Mark trip as completed
      await db
        .update(trips)
        .set({ status: "completed", updatedAt: new Date() })
        .where(eq(trips.id, trip.id));

      console.log(`  ✅ Trip ${trip.id} marked as completed`);
    }

    /**
     * 2. Find trips where DEPARTURE time has passed but ARRIVAL hasn't
     *    Mark them as in_progress (if not already)
     */
    const inProgressTrips = await db.query.trips.findMany({
      where: and(
        lte(trips.departureTime, now),
        gte(trips.arrivalTime, now),
        eq(trips.status, "scheduled"),
      ),
    });

    console.log(`\n🚗 Found ${inProgressTrips.length} trips in progress`);

    for (const trip of inProgressTrips) {
      await db
        .update(trips)
        .set({ status: "in_progress", updatedAt: new Date() })
        .where(eq(trips.id, trip.id));

      console.log(`  ✅ Trip ${trip.id} marked as in_progress`);
    }

    /**
     * 3. Handle cancelled trips with approved bookings
     *    Mark bookings as cancelled with reason
     */
    const cancelledTripsWithApprovedBookings = await db.query.trips.findMany({
      where: eq(trips.status, "cancelled"),
    });

    console.log(
      `\n❌ Found ${cancelledTripsWithApprovedBookings.length} cancelled trips`,
    );

    for (const trip of cancelledTripsWithApprovedBookings) {
      const approvedBookingsForCancelledTrip = await db.query.bookings.findMany(
        {
          where: and(
            eq(bookings.tripId, trip.id),
            eq(bookings.status, "approved"),
          ),
        },
      );

      if (approvedBookingsForCancelledTrip.length > 0) {
        console.log(
          `  Trip ${trip.id} (cancelled): Cancelling ${approvedBookingsForCancelledTrip.length} approved bookings`,
        );

        await db
          .update(bookings)
          .set({
            status: "cancelled",
            updatedAt: new Date(),
          })
          .where(
            and(eq(bookings.tripId, trip.id), eq(bookings.status, "approved")),
          );

        console.log(
          `  ✅ Trip ${trip.id} bookings cancelled due to trip cancellation`,
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Auto-completion process completed",
      stats: {
        completedTrips: completedTrips.length,
        inProgressTrips: inProgressTrips.length,
        cancelledTripsProcessed: cancelledTripsWithApprovedBookings.length,
      },
    });
  } catch (error) {
    console.error("Auto-complete bookings error:", error);
    return NextResponse.json(
      { error: "Failed to auto-complete bookings" },
      { status: 500 },
    );
  }
}
