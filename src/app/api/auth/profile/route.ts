import { getCurrentUser } from "~/lib/auth";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      firstName?: string;
      lastName?: string;
      email?: string;
      phoneNumber?: string;
      profileImage?: string;
    };

    // Build update object with only provided fields
    const updateData: Record<string, string> = {};

    if (body.firstName !== undefined) {
      updateData.firstName = body.firstName;
    }
    if (body.lastName !== undefined) {
      updateData.lastName = body.lastName;
    }
    if (body.email !== undefined) {
      updateData.email = body.email;
    }
    if (body.phoneNumber !== undefined) {
      updateData.phoneNumber = body.phoneNumber;
    }
    if (body.profileImage !== undefined) {
      updateData.profileImage = body.profileImage;
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    // Update user in database
    await db.update(users).set(updateData).where(eq(users.id, user.id));

    return Response.json({ success: true, ...updateData });
  } catch (error) {
    console.error("Profile update error:", error);
    return Response.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
