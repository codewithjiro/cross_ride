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

    // Verify user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const bookingId = parseInt(params.id);

    if (!bookingId) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 },
      );
    }

    // Get the booking to verify it belongs to the user
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== userId) {
      return NextResponse.json(
        { error: "Cannot mark other user's bookings as completed" },
        { status: 403 },
      );
    }

    if (booking.status !== "approved") {
      return NextResponse.json(
        { error: "Only approved bookings can be marked as completed" },
        { status: 400 },
      );
    }

    // Update booking status to completed
    const updatedBooking = await db
      .update(bookings)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    // Also update the trip status to completed
    if (booking.tripId) {
      await db
        .update(trips)
        .set({ status: "completed" })
        .where(eq(trips.id, booking.tripId));
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking[0],
    });
  } catch (error) {
    console.error("Mark booking completed error:", error);
    return NextResponse.json(
      { error: "Failed to mark booking as completed" },
      { status: 500 },
    );
  }
}
