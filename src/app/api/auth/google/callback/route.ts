import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getPrisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_URL
  ? `${process.env.NEXT_PUBLIC_URL}/api/auth/google/callback`
  : "http://localhost:3000/api/auth/google/callback";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    if (error) {
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent(error)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent("No authorization code received")}`
      );
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent("Google OAuth not configured")}`
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      REDIRECT_URI
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.email) {
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent("Could not get email from Google")}`
      );
    }

    // Check if user exists
    let user = await (await getPrisma()).user.findUnique({
      where: { email: userInfo.email },
    });

    // If user doesn't exist, create one
    if (!user) {
      user = await (await getPrisma()).user.create({
        data: {
          email: userInfo.email,
          // Generate a random password for Google users (they won't use it)
          password: await generateRandomPassword(),
          name: userInfo.name || "",
          avatar: userInfo.picture || null,
        },
      });
    } else {
      // Update user info if they logged in with Google
      await (await getPrisma()).user.update({
        where: { id: user.id },
        data: {
          name: user.name || userInfo.name || "",
          avatar: user.avatar || userInfo.picture || null,
        },
      });
    }

    // Create JWT token
    const token = auth.createToken(user.id, user.email);

    // Redirect to dashboard with token in cookie
    const response = NextResponse.redirect(`${baseUrl}/dashboard/analytics`);
    
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent("Authentication failed")}`
    );
  }
}

async function generateRandomPassword(): Promise<string> {
  const bcrypt = await import("bcryptjs");
  const randomString = Math.random().toString(36).slice(-16) + 
                       Math.random().toString(36).slice(-16);
  return bcrypt.default.hash(randomString, 10);
}
