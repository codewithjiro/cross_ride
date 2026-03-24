import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { bookings, trips } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "~/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireAuth();
    const bookingId = Number(params.id);

    if (!bookingId || Number.isNaN(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking id" },
        { status: 400 },
      );
    }

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
      with: {
        trip: {
          with: {
            van: true,
            driver: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { error: "Not authorized to view this booking" },
        { status: 403 },
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireAuth();
    const bookingId = Number(params.id);

    if (!bookingId || Number.isNaN(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking id" },
        { status: 400 },
      );
    }

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { error: "Not authorized to update this booking" },
        { status: 403 },
      );
    }

    if (booking.status !== "pending") {
      return NextResponse.json(
        {
          error: `Cannot edit a ${booking.status} booking. Only pending bookings can be edited.`,
        },
        { status: 400 },
      );
    }

    const body = (await req.json()) as {
      vanId?: number;
      driverId?: string;
      department?: string;
      departureTime?: string;
      arrivalTime?: string;
      seatsRequested?: number;
      route?: string;
    };

    // Update the trip associated with this booking
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, booking.tripId),
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Update trip with new details
    await db
      .update(trips)
      .set({
        vanId: body.vanId ?? trip.vanId,
        driverId: body.driverId ? Number(body.driverId) : trip.driverId,
        departureTime: body.departureTime
          ? new Date(body.departureTime)
          : trip.departureTime,
        arrivalTime: body.arrivalTime
          ? new Date(body.arrivalTime)
          : trip.arrivalTime,
        route: body.route ?? trip.route,
        updatedAt: new Date(),
      })
      .where(eq(trips.id, trip.id));

    // Update booking with new seat count and department
    await db
      .update(bookings)
      .set({
        seatsBooked: body.seatsRequested ?? booking.seatsBooked,
        department: body.department ?? booking.department,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    const updatedBooking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
      with: {
        trip: {
          with: {
            van: true,
            driver: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 },
    );
  }
}
