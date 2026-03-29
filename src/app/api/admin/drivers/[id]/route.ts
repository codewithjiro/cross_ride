import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { drivers, adminLogs, trips } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "~/lib/auth";

interface UpdateDriverRequest {
  firstName?: string;
  middleName?: string;
  surname?: string;
  email?: string;
  phoneNumber?: string;
  licenseNumber?: string;
  experience?: string;
  specialization?: string;
  profileImage?: string;
  status?: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const {
      firstName,
      middleName,
      surname,
      email,
      phoneNumber,
      licenseNumber,
      experience,
      specialization,
      profileImage,
      status,
    } = (await req.json()) as UpdateDriverRequest;
    const driverId = parseInt(id, 10);

    // Get existing driver
    const existingDriver = await db.query.drivers.findFirst({
      where: eq(drivers.id, driverId),
    });

    if (!existingDriver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (middleName !== undefined) updateData.middleName = middleName;
    if (surname !== undefined) updateData.surname = surname;
    if (email !== undefined) updateData.email = email;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
    if (experience !== undefined) updateData.experience = experience;
    if (specialization !== undefined)
      updateData.specialization = specialization;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (status !== undefined) updateData.status = status;

    const updatedDriver = await db
      .update(drivers)
      .set(updateData)
      .where(eq(drivers.id, driverId))
      .returning();

    // Log the action
    const fullName = `${firstName || existingDriver.firstName} ${surname || existingDriver.surname}`;
    await db.insert(adminLogs).values({
      adminId: user.id,
      action: "UPDATE",
      entityType: "driver",
      entityId: driverId.toString(),
      changes: JSON.stringify({ before: existingDriver, after: updateData }),
      description: `Updated driver: ${fullName}`,
    });

    revalidatePath("/admin/drivers");

    return NextResponse.json(updatedDriver[0]);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update driver",
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
    const driverId = parseInt(id, 10);

    // Check if driver exists
    const driver = await db.query.drivers.findFirst({
      where: eq(drivers.id, driverId),
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // Check if driver has active trips
    const activeTrips = await db.query.trips.findMany({
      where: eq(trips.driverId, driverId),
    });

    if (activeTrips && activeTrips.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete driver with ${activeTrips.length} active trip(s). Please assign these trips to another driver first.`,
        },
        { status: 400 },
      );
    }

    // Delete driver
    await db.delete(drivers).where(eq(drivers.id, driverId));

    // Log the action
    await db.insert(adminLogs).values({
      adminId: user.id,
      action: "DELETE",
      entityType: "driver",
      entityId: driverId.toString(),
      description: `Deleted driver: ${driver.firstName} ${driver.surname}`,
    });

    return NextResponse.json({
      success: true,
      message: "Driver deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete driver",
      },
      { status: 500 },
    );
  }
}
