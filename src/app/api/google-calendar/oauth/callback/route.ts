import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getPrisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Read environment variables at runtime, not build time
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_URL
      ? `${process.env.NEXT_PUBLIC_URL}/api/google-calendar/oauth/callback`
      : "http://localhost:3000/api/google-calendar/oauth/callback";
    const BASE_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // userId
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        `${BASE_URL}/dashboard/settings/google-calendar?error=${error}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${BASE_URL}/dashboard/settings/google-calendar?error=missing_params`
      );
    }

    const userId = state;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return NextResponse.redirect(
        `${BASE_URL}/dashboard/settings/google-calendar?error=credentials_not_configured`
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

    if (
      !tokens.access_token ||
      !tokens.refresh_token ||
      !tokens.expiry_date
    ) {
      return NextResponse.redirect(
        `${BASE_URL}/dashboard/settings/google-calendar?error=invalid_tokens`
      );
    }

    // Get user email (with error handling)
    let email = "";
    try {
      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      email = userInfo.data.email || "";
    } catch (emailError) {
      console.error("Error fetching user email:", emailError);
      // Continue without email - it's not critical
      email = "unknown";
    }

    // Save tokens to database
    await (await getPrisma()).googleAccount.upsert({
      where: { userId },
      update: {
        email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(tokens.expiry_date),
      },
      create: {
        userId,
        email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(tokens.expiry_date),
      },
    });

    // Fetch and save user's calendars
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const calendarsResponse = await calendar.calendarList.list();
    const calendars = calendarsResponse.data.items || [];

    // Get service account email from environment
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

    const googleAccount = await (await getPrisma()).googleAccount.findUnique({
      where: { userId },
    });

    if (googleAccount) {
      // Save calendars to database AND share with service account
      for (const cal of calendars) {
        if (cal.id) {
          // Save to database
          await (await getPrisma()).googleCalendar.upsert({
            where: { calendarId: cal.id },
            update: {
              name: cal.summary || "",
              description: cal.description || "",
              backgroundColor: cal.backgroundColor || "#039BE5",
              isPrimary: cal.primary || false,
            },
            create: {
              googleAccountId: googleAccount.id,
              calendarId: cal.id,
              name: cal.summary || "",
              description: cal.description || "",
              backgroundColor: cal.backgroundColor || "#039BE5",
              isPrimary: cal.primary || false,
            },
          });

          // 🔥 AUTO-SHARE: Add service account as writer to the calendar
          if (serviceAccountEmail && cal.id !== "primary") {
            try {
              // Check if service account already has access
              const existingAcl = await calendar.acl.list({
                calendarId: cal.id,
              });

              const alreadyShared = existingAcl.data.items?.some(
                (rule) => rule.scope?.value === serviceAccountEmail
              );

              if (!alreadyShared) {
                // Share calendar with service account
                await calendar.acl.insert({
                  calendarId: cal.id,
                  requestBody: {
                    role: "writer", // Can create/edit/delete events
                    scope: {
                      type: "user",
                      value: serviceAccountEmail,
                    },
                  },
                });
                console.log(`✅ Shared calendar "${cal.summary}" with service account`);
              } else {
                console.log(`✓ Calendar "${cal.summary}" already shared with service account`);
              }
            } catch (aclError) {
              console.error(
                `⚠️ Could not share calendar "${cal.summary}":`,
                aclError
              );
              // Continue even if sharing fails - not critical
            }
          }
        }
      }
    }

    return NextResponse.redirect(
      `${BASE_URL}/dashboard/settings/google-calendar?success=true`
    );
  } catch (error) {
    console.error("Error in OAuth callback:", error);
    const BASE_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    return NextResponse.redirect(
      `${BASE_URL}/dashboard/settings/google-calendar?error=callback_failed`
    );
  }
}
