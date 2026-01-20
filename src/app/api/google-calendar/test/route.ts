import { NextResponse } from "next/server";

export async function GET() {
  const isConfigured = !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY &&
    process.env.GOOGLE_CALENDAR_ID
  );

  return NextResponse.json({
    configured: isConfigured,
    details: {
      hasServiceAccountEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
      hasCalendarId: !!process.env.GOOGLE_CALENDAR_ID,
      calendarId: process.env.GOOGLE_CALENDAR_ID || "not set (will use 'primary')",
    },
    message: isConfigured
      ? "Google Calendar is configured and ready to sync appointments"
      : "Google Calendar is NOT configured. Appointments will be saved locally only. See GOOGLE_CALENDAR_SETUP.md for setup instructions.",
  });
}
