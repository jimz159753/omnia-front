import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(request: NextRequest) {
  try {
    // Check if Google Calendar is configured
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json({
        configured: false,
        error: "Google Calendar credentials not configured",
      });
    }

    // Initialize auth
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Try to list calendars
    const calendarList = await calendar.calendarList.list();

    // Try to access the configured calendar
    const configuredCalendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    let calendarAccess = null;
    let calendarError = null;

    try {
      const calendarDetails = await calendar.calendars.get({
        calendarId: configuredCalendarId,
      });
      calendarAccess = {
        id: calendarDetails.data.id,
        summary: calendarDetails.data.summary,
        description: calendarDetails.data.description,
      };
    } catch (error: any) {
      calendarError = {
        message: error.message,
        status: error.status,
        code: error.code,
      };
    }

    return NextResponse.json({
      configured: true,
      serviceAccount: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      configuredCalendarId,
      availableCalendars: calendarList.data.items?.map((cal) => ({
        id: cal.id,
        summary: cal.summary,
        accessRole: cal.accessRole,
        primary: cal.primary,
      })),
      calendarAccess,
      calendarError,
    });
  } catch (error: any) {
    console.error("Error testing Google Calendar:", error);
    return NextResponse.json(
      {
        error: "Failed to test Google Calendar",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
