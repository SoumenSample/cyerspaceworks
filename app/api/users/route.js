import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { z } from "zod";
import nodemailer from "nodemailer";

import { authOptions } from "@/lib/auth-options";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ===============================
// VALIDATION
// ===============================
const createUserSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["client", "employee"]),
});

// ===============================
// GET USERS
// ===============================
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const users = await User.find({}, { passwordHash: 0 })
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({ users }, { status: 200 });

  } catch (err) {
    console.error("GET users error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

// ===============================
// CREATE USER
// ===============================
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectToDatabase();

    const email = parsed.data.email.toLowerCase().trim();

    const existing = await User.findOne({ email });
    if (existing) {
      return Response.json({ error: "User already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const created = await User.create({
      name: parsed.data.name.trim(),
      email,
      passwordHash,
      role: parsed.data.role,
      isActive: true,
      createdBy: session.user.id,
    });

    // ===============================
    // SEND EMAIL (SAFE)
    // ===============================
    try {
      if (
        process.env.EMAIL_HOST &&
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASS
      ) {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT) || 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: `"CyberSpace Works" <${process.env.EMAIL_USER}>`,
          to: created.email,
          subject: "Your Account Has Been Created",
          html: `
            <h2>Welcome, ${created.name}</h2>
            <p>Your account has been created successfully.</p>
            <p><b>Email:</b> ${created.email}</p>
            <p><b>Temporary Password:</b> ${parsed.data.password}</p>
            <p>Please change your password after login.</p>
          `,
        });
      } else {
        console.warn("Email skipped: Missing env vars");
      }
    } catch (err) {
      console.error("Email failed:", err);
    }

    return Response.json(
      {
        user: {
          id: created._id.toString(),
          name: created.name,
          email: created.email,
          role: created.role,
          isActive: created.isActive,
        },
      },
      { status: 201 }
    );

  } catch (err) {
    console.error("POST user error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

// ===============================
// DELETE USER
// ===============================
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    await connectToDatabase();

    // ❗ prevent deleting self
    if (userId === session.user.id) {
      return Response.json(
        { error: "You cannot delete yourself" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    await User.findByIdAndDelete(userId);

    return Response.json({ success: true });

  } catch (err) {
    console.error("DELETE user error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}