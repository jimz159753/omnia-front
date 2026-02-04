import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getPrisma } from "@/lib/db";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

async function getAuthClient(userId: string) {
  const googleAccount = await (await getPrisma()).googleAccount.findUnique({
    where: { userId },
  });

  if (!googleAccount) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: googleAccount.accessToken,
    refresh_token: googleAccount.refreshToken,
    expiry_date: googleAccount.expiresAt.getTime(),
  });

  // Refresh token if expired
  if (googleAccount.expiresAt < new Date()) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);

    if (credentials.access_token && credentials.expiry_date) {
      await (await getPrisma()).googleAccount.update({
        where: { userId },
        data: {
          accessToken: credentials.access_token,
          expiresAt: new Date(credentials.expiry_date),
        },
      });
    }
  }

  return oauth2Client;
}

// GET - List calendars
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    // If userId is provided, get calendars for that specific user
    if (userId) {
      const googleAccount = await (await getPrisma()).googleAccount.findUnique({
        where: { userId },
      });

      if (!googleAccount) {
        return NextResponse.json(
          { error: "Google account not connected", connected: false },
          { status: 404 }
        );
      }

      const calendars = await (await getPrisma()).googleCalendar.findMany({
        where: { googleAccountId: googleAccount.id },
        orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
      });

      return NextResponse.json({
        connected: true,
        email: googleAccount.email,
        calendars,
      });
    }

    // If no userId, get all available calendars from all connected accounts
    const allCalendars = await (await getPrisma()).googleCalendar.findMany({
      where: { isEnabled: true },
      orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
    });

    // Map to a simplified format for the booking calendar selector
    const calendars = allCalendars.map((cal) => ({
      calendarId: cal.calendarId,
      summary: cal.name,
      backgroundColor: cal.backgroundColor,
      primary: cal.isPrimary,
    }));

    return NextResponse.json({
      connected: calendars.length > 0,
      calendars,
    });
  } catch (error) {
    console.error("Error fetching calendars:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendars" },
      { status: 500 }
    );
  }
}

// POST - Create new calendar
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, description, backgroundColor } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { error: "User ID and name are required" },
        { status: 400 }
      );
    }

    const authClient = await getAuthClient(userId);
    if (!authClient) {
      return NextResponse.json(
        { error: "Google account not connected" },
        { status: 404 }
      );
    }

    const calendar = google.calendar({ version: "v3", auth: authClient });

    // Create calendar in Google
    const response = await calendar.calendars.insert({
      requestBody: {
        summary: name,
        description: description || "",
        timeZone: "America/Mexico_City",
      },
    });

    const newCalendar = response.data;

    // Update calendar color if provided
    if (backgroundColor && newCalendar.id) {
      await calendar.calendarList.update({
        calendarId: newCalendar.id,
        requestBody: {
          backgroundColor,
        },
      });
    }

    // 🔥 AUTO-SHARE: Share new calendar with service account
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    if (serviceAccountEmail && newCalendar.id) {
      try {
        await calendar.acl.insert({
          calendarId: newCalendar.id,
          requestBody: {
            role: "writer", // Can create/edit/delete events
            scope: {
              type: "user",
              value: serviceAccountEmail,
            },
          },
        });
        console.log(`✅ Auto-shared new calendar "${name}" with service account`);
      } catch (aclError) {
        console.error(`⚠️ Could not share new calendar "${name}":`, aclError);
        // Continue even if sharing fails
      }
    }

    // Save to database
    const googleAccount = await (await getPrisma()).googleAccount.findUnique({
      where: { userId },
    });

    if (googleAccount && newCalendar.id) {
      const savedCalendar = await (await getPrisma()).googleCalendar.create({
        data: {
          googleAccountId: googleAccount.id,
          calendarId: newCalendar.id,
          name: newCalendar.summary || name,
          description: newCalendar.description || description || "",
          backgroundColor: backgroundColor || "#039BE5",
          isPrimary: false,
          isEnabled: true,
        },
      });

      return NextResponse.json(
        { data: savedCalendar, message: "Calendar created successfully" },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save calendar" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error creating calendar:", error);
    return NextResponse.json(
      { error: "Failed to create calendar" },
      { status: 500 }
    );
  }
}

// PUT - Update calendar
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, calendarId, name, description, backgroundColor, isEnabled } =
      body;

    if (!userId || !calendarId) {
      return NextResponse.json(
        { error: "User ID and calendar ID are required" },
        { status: 400 }
      );
    }

    const authClient = await getAuthClient(userId);
    if (!authClient) {
      return NextResponse.json(
        { error: "Google account not connected" },
        { status: 404 }
      );
    }

    const calendar = google.calendar({ version: "v3", auth: authClient });

    // Update in Google Calendar
    const updates: any = {};
    if (backgroundColor) {
      updates.backgroundColor = backgroundColor;
    }
    if (name) {
      updates.summary = name;
    }

    if (Object.keys(updates).length > 0) {
      await calendar.calendarList.update({
        calendarId,
        requestBody: updates,
      });
    }

    // Update calendar metadata if provided
    if (name || description) {
      await calendar.calendars.update({
        calendarId,
        requestBody: {
          summary: name,
          description,
        },
      });
    }

    // Update in database
    const updatedCalendar = await (await getPrisma()).googleCalendar.update({
      where: { calendarId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(backgroundColor && { backgroundColor }),
        ...(isEnabled !== undefined && { isEnabled }),
      },
    });

    return NextResponse.json({
      data: updatedCalendar,
      message: "Calendar updated successfully",
    });
  } catch (error) {
    console.error("Error updating calendar:", error);
    return NextResponse.json(
      { error: "Failed to update calendar" },
      { status: 500 }
    );
  }
}

// DELETE - Disconnect Google account
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const googleAccount = await (await getPrisma()).googleAccount.findUnique({
      where: { userId },
    });

    if (!googleAccount) {
      return NextResponse.json(
        { error: "Google account not connected" },
        { status: 404 }
      );
    }

    // Delete calendars
    await (await getPrisma()).googleCalendar.deleteMany({
      where: { googleAccountId: googleAccount.id },
    });

    // Delete account
    await (await getPrisma()).googleAccount.delete({
      where: { userId },
    });

    return NextResponse.json({
      message: "Google account disconnected successfully",
    });
  } catch (error) {
    console.error("Error disconnecting account:", error);
    return NextResponse.json(
      { error: "Failed to disconnect account" },
      { status: 500 }
    );
  }
}
