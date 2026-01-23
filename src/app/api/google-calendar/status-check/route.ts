import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Check Service Account configuration
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const configuredCalendarId = process.env.GOOGLE_CALENDAR_ID;

    // Check OAuth configuration
    const oauthClientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const oauthClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

    // Check database for connected accounts
    const googleAccounts = await prisma.googleAccount.findMany({
      select: {
        id: true,
        userId: true,
        email: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    // Check database for calendars
    const googleCalendars = await prisma.googleCalendar.findMany({
      select: {
        id: true,
        googleAccountId: true,
        calendarId: true,
        name: true,
        isEnabled: true,
        isPrimary: true,
      },
    });

    return NextResponse.json({
      serviceAccount: {
        configured: !!(serviceAccountEmail && serviceAccountKey),
        email: serviceAccountEmail || "NOT_CONFIGURED",
        calendarId: configuredCalendarId || "NOT_CONFIGURED",
        keyLength: serviceAccountKey ? serviceAccountKey.length : 0,
      },
      oauth: {
        configured: !!(oauthClientId && oauthClientSecret),
        hasClientId: !!oauthClientId,
        hasClientSecret: !!oauthClientSecret,
      },
      database: {
        connectedAccounts: googleAccounts.length,
        accounts: googleAccounts,
        calendars: googleCalendars.length,
        calendarsList: googleCalendars,
      },
      summary: {
        serviceAccountReady: !!(serviceAccountEmail && serviceAccountKey && configuredCalendarId),
        oauthReady: !!(oauthClientId && oauthClientSecret),
        hasConnectedUsers: googleAccounts.length > 0,
        hasCalendars: googleCalendars.length > 0,
      },
    });
  } catch (error) {
    console.error("Error checking Google Calendar status:", error);
    return NextResponse.json(
      {
        error: "Failed to check status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
