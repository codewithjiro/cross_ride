import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { trips, bookings, adminLogs } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "~/lib/auth";
import { checkConflicts } from "~/lib/conflicts";

interface UpdateTripRequest {
  vanId?: string | number;
  driverId?: string | number;
  route?: string;
  departureTime?: string;
  arrivalTime?: string;
  seatsAvailable?: string | number;
  status?: string;
  cancelReason?: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const {
      vanId,
      driverId,
      route,
      departureTime,
      arrivalTime,
      seatsAvailable,
      status,
      cancelReason,
    } = (await req.json()) as UpdateTripRequest;
    const tripId = parseInt(id, 10);

    // Get existing trip
    const existingTrip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
    });

    if (!existingTrip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const newVanId = vanId ? parseInt(String(vanId), 10) : existingTrip.vanId;
    const newDriverId = driverId
      ? parseInt(String(driverId), 10)
      : existingTrip.driverId;
    const newDepTime = departureTime
      ? new Date(departureTime)
      : existingTrip.departureTime;
    const newArrTime = arrivalTime
      ? new Date(arrivalTime)
      : existingTrip.arrivalTime;

    // Validate times if being updated
    if (departureTime ?? arrivalTime) {
      if (newDepTime >= newArrTime) {
        return NextResponse.json(
          { error: "Departure time must be before arrival time" },
          { status: 400 },
        );
      }
    }

    // Check for conflicts if van or driver or times changed
    if ((vanId ?? driverId ?? departureTime ?? arrivalTime) !== undefined) {
      const conflictCheck = await checkConflicts(
        newVanId,
        newDriverId,
        newDepTime,
        newArrTime,
        tripId,
      );
      if (conflictCheck.hasConflict) {
        return NextResponse.json(
          { error: conflictCheck.message ?? "Scheduling conflict detected" },
          { status: 400 },
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (vanId !== undefined) updateData.vanId = newVanId;
    if (driverId !== undefined) updateData.driverId = newDriverId;
    if (route !== undefined) updateData.route = route;
    if (departureTime !== undefined) updateData.departureTime = newDepTime;
    if (arrivalTime !== undefined) updateData.arrivalTime = newArrTime;
    if (seatsAvailable !== undefined)
      updateData.seatsAvailable = parseInt(String(seatsAvailable), 10);
    if (status !== undefined) updateData.status = status;
    if (cancelReason !== undefined) updateData.cancelReason = cancelReason;

    const updatedTrip = await db
      .update(trips)
      .set(updateData)
      .where(eq(trips.id, tripId))
      .returning();

    // If trip is being cancelled, also cancel all related bookings
    if (status === "cancelled") {
      await db
        .update(bookings)
        .set({ status: "cancelled" })
        .where(eq(bookings.tripId, tripId));
    }

    // Log the action
    await db.insert(adminLogs).values({
      adminId: user.id,
      action: "UPDATE",
      entityType: "trip",
      entityId: tripId.toString(),
      changes: JSON.stringify({ before: existingTrip, after: updateData }),
      description: `Updated trip: ${route ?? existingTrip.route}`,
    });

    return NextResponse.json(updatedTrip[0]);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update trip",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const tripId = parseInt(id, 10);

    // Check if trip exists
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Delete trip
    await db.delete(trips).where(eq(trips.id, tripId));

    // Log the action
    await db.insert(adminLogs).values({
      adminId: user.id,
      action: "DELETE",
      entityType: "trip",
      entityId: tripId.toString(),
      description: `Deleted trip: ${trip.route}`,
    });

    return NextResponse.json({
      success: true,
      message: "Trip deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete trip",
      },
      { status: 500 },
    );
  }
}
