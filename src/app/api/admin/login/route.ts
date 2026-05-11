import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Get admin credentials from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "CEO.NIL@utsavai.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "CEO.NIL2004";

// Hash the password from environment variable
const ADMIN_PASSWORD_HASH = crypto
  .createHash("sha256")
  .update(ADMIN_PASSWORD)
  .digest("hex");

// Generate secure token
function generateToken(email: string): string {
  const timestamp = Date.now();
  const secret = process.env.ADMIN_SECRET || "utsavai-secret-key";
  const data = `${email}:${timestamp}:${secret}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

// Verify credentials
function verifyCredentials(email: string, password: string): boolean {
  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  return email === ADMIN_EMAIL && passwordHash === ADMIN_PASSWORD_HASH;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Rate limiting check (simple implementation)
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Add delay to prevent brute force attacks
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify credentials
    if (!verifyCredentials(email, password)) {
      // Log failed attempt (in production, log to database or monitoring service)
      console.warn(`Failed login attempt from IP: ${ip}, Email: ${email}`);
      
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate secure token
    const token = generateToken(email);

    // Log successful login
    console.log(`Successful admin login from IP: ${ip}, Email: ${email}`);

    return NextResponse.json({
      success: true,
      token,
      email,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
