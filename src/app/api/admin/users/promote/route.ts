import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { users, adminLogs } from "~/server/db/schema";
import { getCurrentUser } from "~/lib/auth";

export async function PATCH(request: Request) {
  try {
    const currentAdmin = await getCurrentUser();

    if (!currentAdmin || currentAdmin.role !== "admin") {
      return Response.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 },
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const userToPromote = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!userToPromote) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (userToPromote.role === "admin") {
      return Response.json(
        { error: "User is already an admin" },
        { status: 400 },
      );
    }

    // Update user to admin
    await db.update(users).set({ role: "admin" }).where(eq(users.id, userId));

    // Log the action
    await db.insert(adminLogs).values({
      adminId: currentAdmin.id,
      action: "promote_user",
      entityType: "user",
      entityId: userId,
      description: `Promoted ${userToPromote.firstName} ${userToPromote.lastName} (${userToPromote.email}) to admin`,
    });

    return Response.json({
      success: true,
      message: `User promoted to admin successfully`,
    });
  } catch (error) {
    console.error("Error promoting user:", error);
    return Response.json({ error: "Failed to promote user" }, { status: 500 });
  }
}
