import { NextResponse } from "next/server";

/**
 * GET /api/bookings/availability
 * Returns available dates and times for booking
 */
export async function GET() {
  try {
    // Generate next 30 days
    const availableDates = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      availableDates.push({
        value: date.toISOString().split("T")[0],
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      });
    }

    // Generate time slots (5 AM to 11 PM - every hour)
    const availableTimes = [];
    for (let hour = 5; hour <= 23; hour++) {
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      availableTimes.push({
        value: `${String(hour).padStart(2, "0")}:00`,
        label: `${displayHour}:00 ${ampm}`,
      });
    }

    return NextResponse.json({
      success: true,
      dates: availableDates,
      times: availableTimes,
    });
  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch availability",
      },
      { status: 500 },
    );
  }
}
