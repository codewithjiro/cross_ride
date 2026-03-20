import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

interface AdminInitRequest {
  email?: string;
}

/**
 * POST /api/admin/init
 * Promote a user to admin (requires admin secret)
 * 
 * Body: { email: 'user@example.com' }
 * Header: X-Admin-Secret (matches environment variable ADMIN_INIT_SECRET)
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AdminInitRequest;
    const { email } = body;
    const secret = request.headers.get("X-Admin-Secret");
    const initSecret = process.env.ADMIN_INIT_SECRET ?? "change-me-in-production";

    // Verify secret
    if (secret !== initSecret) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update to admin
    if (existingUser.role === "admin") {
      return NextResponse.json(
        {
          success: true,
          message: "User is already an admin",
          email,
          role: "admin",
        },
        { status: 200 }
      );
    }

    await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.email, email));

    return NextResponse.json(
      {
        success: true,
        message: "User promoted to admin successfully",
        email,
        role: "admin",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin init error:", error);
    return NextResponse.json(
      { error: "Failed to promote user" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/init
 * Check admin setup status
 */
export async function GET() {
  try {
    const adminUsers = await db.query.users.findMany({
      where: (users, { eq }) => eq(users.role, "admin"),
    });

    return NextResponse.json({
      adminCount: adminUsers.length,
      isSetup: adminUsers.length > 0,
    });
  } catch (error) {
    console.error("Admin check error:", error);
    return NextResponse.json(
      { error: "Failed to check admin status" },
      { status: 500 }
    );
  }
}
