import { NextResponse } from "next/server";

export async function GET() {
  const configured =
    !!process.env.GOOGLE_OAUTH_CLIENT_ID &&
    !!process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
    !!process.env.NEXT_PUBLIC_URL;

  return NextResponse.json({
    configured,
    details: {
      hasClientId: !!process.env.GOOGLE_OAUTH_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      hasPublicUrl: !!process.env.NEXT_PUBLIC_URL,
      publicUrl: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
    },
    message: configured
      ? "OAuth is configured and ready"
      : "OAuth credentials are not configured. Please add GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET to your environment variables.",
  });
}
