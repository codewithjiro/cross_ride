import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { hashPassword, getUserByEmail } from "~/lib/auth";
import { randomUUID } from "crypto";

interface SignUpRequest {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SignUpRequest;
    const { email, password, firstName, lastName } = body;

    // Validate input
    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return Response.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await db.insert(users).values({
      id: randomUUID(),
      email,
      password: hashedPassword,
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      role: "user",
    }).returning();

    // Return user (without password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pwd, ...userWithoutPassword } = newUser[0];
    return Response.json(
      { 
        success: true, 
        message: "User created successfully",
        user: userWithoutPassword 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Sign-up error:", error);
    return Response.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
