import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { trips } from "~/server/db/schema";
import { eq, gte, lt, and } from "drizzle-orm";

/**
 * GET /api/trips/by-date?date=2026-03-20
 * Returns all scheduled trips for a specific date
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    // Parse date and create start/end of day range
    const dateObj = new Date(date);
    const startOfDay = new Date(
      dateObj.getFullYear(),
      dateObj.getMonth(),
      dateObj.getDate(),
      0,
      0,
      0
    );
    const endOfDay = new Date(
      dateObj.getFullYear(),
      dateObj.getMonth(),
      dateObj.getDate(),
      23,
      59,
      59
    );

    // Fetch trips for this date
    const tripsForDate = await db.query.trips.findMany({
      where: and(
        eq(trips.status, "scheduled"),
        gte(trips.departureTime, startOfDay),
        lt(trips.departureTime, endOfDay)
      ),
      with: {
        van: {
          columns: { name: true, plateNumber: true },
        },
        driver: {
          columns: { name: true },
        },
      },
      orderBy: (trips, { asc }) => [asc(trips.departureTime)],
    });

    // Format response
    const formattedTrips = tripsForDate.map((trip) => ({
      id: trip.id,
      vanId: trip.vanId,
      driverId: trip.driverId,
      time: new Date(trip.departureTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      seatsAvailable: trip.seatsAvailable,
      van: trip.van,
      driver: trip.driver,
    }));

    return NextResponse.json({
      success: true,
      trips: formattedTrips,
    });
  } catch (error) {
    console.error("Error fetching trips by date:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch trips by date",
      },
      { status: 500 }
    );
  }
}
