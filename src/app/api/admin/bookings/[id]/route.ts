import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { bookings, users, trips } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is admin
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const body = (await request.json()) as { status: "approved" | "rejected" };
    const bookingId = parseInt(params.id);

    if (!bookingId || !body.status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!["approved", "rejected"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Get the booking to find the trip
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // If rejecting, free up the reserved seats
    if (body.status === "rejected") {
      const trip = await db.query.trips.findFirst({
        where: eq(trips.id, booking.tripId),
      });

      if (trip) {
        await db
          .update(trips)
          .set({
            seatsAvailable: trip.seatsAvailable + booking.seatsBooked,
          })
          .where(eq(trips.id, booking.tripId));
      }
    }

    // If approving, confirm the seatsReserved
    if (body.status === "approved") {
      const trip = await db.query.trips.findFirst({
        where: eq(trips.id, booking.tripId),
      });

      if (trip) {
        await db
          .update(trips)
          .set({
            seatsReserved: trip.seatsReserved + booking.seatsBooked,
          })
          .where(eq(trips.id, booking.tripId));
      }
    }

    // Update booking status
    const updatedBooking = await db
      .update(bookings)
      .set({
        status: body.status,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return NextResponse.json({
      success: true,
      booking: updatedBooking[0],
    });
  } catch (error) {
    console.error("Booking status update error:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 },
    );
  }
}
