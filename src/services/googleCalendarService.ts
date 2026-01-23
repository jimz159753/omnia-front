import { google } from 'googleapis';
import prisma from '@/lib/db';

// Get Service Account auth client
const getServiceAccountAuthClient = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  return auth;
};

// Get OAuth2 auth client for a specific calendar
const getOAuth2AuthClient = async (calendarId: string) => {
  console.log(`🔐 getOAuth2AuthClient: Looking for calendar ID: ${calendarId}`);
  
  // Find the calendar in the database
  const calendarRecord = await prisma.googleCalendar.findUnique({
    where: { calendarId },
  });

  if (!calendarRecord) {
    console.error(`❌ Calendar ${calendarId} not found in database`);
    // Log all calendars to help debug
    const allCalendars = await prisma.googleCalendar.findMany({
      select: { calendarId: true, name: true },
    });
    console.log('Available calendars:', allCalendars.map(c => ({ id: c.calendarId.substring(0, 20) + '...', name: c.name })));
    return null;
  }
  
  console.log(`✅ Found calendar: ${calendarRecord.name}`);

  // Get the associated Google account
  const googleAccount = await prisma.googleAccount.findUnique({
    where: { id: calendarRecord.googleAccountId }
  });

  if (!googleAccount) {
    console.error(`❌ Google account not found for calendar ${calendarId}`);
    return null;
  }
  
  console.log(`✅ Found Google account: ${googleAccount.email}`);

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error('❌ OAuth2 credentials not configured');
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
  const isExpired = googleAccount.expiresAt < new Date();
  console.log(`🔑 Token status: ${isExpired ? 'EXPIRED - refreshing...' : 'VALID'}`);
  
  if (isExpired) {
    try {
      console.log('🔄 Refreshing access token...');
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);

      if (credentials.access_token && credentials.expiry_date) {
        await prisma.googleAccount.update({
          where: { id: googleAccount.id },
          data: {
            accessToken: credentials.access_token,
            expiresAt: new Date(credentials.expiry_date),
          },
        });
        console.log('✅ Token refreshed successfully');
      }
    } catch (error) {
      console.error('❌ Error refreshing OAuth2 token:', error);
      return null;
    }
  }

  return oauth2Client;
};

export interface GoogleCalendarEvent {
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{ email: string }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

/**
 * Get the default OAuth2 calendar (first enabled calendar)
 */
const getDefaultOAuth2Calendar = async () => {
  // Find an enabled calendar from any connected Google account
  const enabledCalendar = await prisma.googleCalendar.findFirst({
    where: { isEnabled: true },
    select: { calendarId: true, name: true },
  });
  
  if (enabledCalendar) {
    console.log(`📅 Using default OAuth2 calendar: ${enabledCalendar.name}`);
    return enabledCalendar.calendarId;
  }
  
  return null;
};

/**
 * Create a Google Calendar event
 * @param eventData - Event details
 * @param targetCalendarId - Optional calendar ID from GoogleCalendar table (user-selected calendar)
 */
export const createGoogleCalendarEvent = async (
  eventData: GoogleCalendarEvent,
  targetCalendarId?: string
): Promise<string | null> => {
  try {
    let auth: any;
    let calendarId: string;
    let effectiveCalendarId = targetCalendarId;

    // If no targetCalendarId provided, try to get a default OAuth2 calendar
    if (!effectiveCalendarId) {
      effectiveCalendarId = await getDefaultOAuth2Calendar() || undefined;
    }

    // If we have a calendar ID, try OAuth2 first
    if (effectiveCalendarId) {
      const oauth2Client = await getOAuth2AuthClient(effectiveCalendarId);
      if (oauth2Client) {
        auth = oauth2Client;
        calendarId = effectiveCalendarId;
        console.log(`✅ Using OAuth2 for calendar: ${calendarId.substring(0, 30)}...`);
      } else {
        console.log(`OAuth2 client not found for ${effectiveCalendarId}, falling back to Service Account`);
        // Fall back to Service Account
        if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
          console.log('Service Account not configured, skipping sync');
          return null;
        }
        auth = getServiceAccountAuthClient();
        calendarId = effectiveCalendarId;
      }
    } else {
      // No OAuth2 calendar available, try Service Account
      if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        console.log('⚠️ No OAuth2 calendar available and Service Account not configured, skipping sync');
        return null;
      }
      auth = getServiceAccountAuthClient();
      calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
      console.log(`Using Service Account for calendar: ${calendarId}`);
    }

    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.insert({
      calendarId,
      requestBody: eventData,
    });

    console.log('✅ Google Calendar event created:', response.data.id, 'in calendar:', calendarId);
    return response.data.id || null;
  } catch (error) {
    console.error('❌ Error creating Google Calendar event:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return null;
  }
};

/**
 * Update a Google Calendar event
 * @param eventId - Google Calendar event ID
 * @param eventData - Updated event details
 * @param targetCalendarId - Optional calendar ID from GoogleCalendar table
 */
export const updateGoogleCalendarEvent = async (
  eventId: string,
  eventData: GoogleCalendarEvent,
  targetCalendarId?: string
): Promise<boolean> => {
  try {
    let auth: any;
    let calendarId: string;
    let effectiveCalendarId = targetCalendarId;

    // If no targetCalendarId provided, try to get a default OAuth2 calendar
    if (!effectiveCalendarId) {
      effectiveCalendarId = await getDefaultOAuth2Calendar() || undefined;
    }

    // If we have a calendar ID, try OAuth2 first
    if (effectiveCalendarId) {
      const oauth2Client = await getOAuth2AuthClient(effectiveCalendarId);
      if (oauth2Client) {
        auth = oauth2Client;
        calendarId = effectiveCalendarId;
        console.log(`✅ Using OAuth2 for calendar: ${calendarId.substring(0, 30)}...`);
      } else {
        console.log(`OAuth2 client not found for ${effectiveCalendarId}, falling back to Service Account`);
        if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
          console.log('Service Account not configured, skipping sync');
          return false;
        }
        auth = getServiceAccountAuthClient();
        calendarId = effectiveCalendarId;
      }
    } else {
      // No OAuth2 calendar available, try Service Account
      if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        console.log('⚠️ No OAuth2 calendar available and Service Account not configured, skipping sync');
        return false;
      }
      auth = getServiceAccountAuthClient();
      calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
      console.log(`Using Service Account for calendar: ${calendarId}`);
    }

    const calendar = google.calendar({ version: 'v3', auth });

    await calendar.events.update({
      calendarId,
      eventId,
      requestBody: eventData,
    });

    console.log('✅ Google Calendar event updated:', eventId, 'in calendar:', calendarId);
    return true;
  } catch (error) {
    console.error('❌ Error updating Google Calendar event:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return false;
  }
};

/**
 * Delete a Google Calendar event
 * @param eventId - Google Calendar event ID
 * @param targetCalendarId - Optional calendar ID from GoogleCalendar table
 */
export const deleteGoogleCalendarEvent = async (
  eventId: string,
  targetCalendarId?: string
): Promise<boolean> => {
  try {
    let auth: any;
    let calendarId: string;
    let effectiveCalendarId = targetCalendarId;

    // If no targetCalendarId provided, try to get a default OAuth2 calendar
    if (!effectiveCalendarId) {
      effectiveCalendarId = await getDefaultOAuth2Calendar() || undefined;
    }

    // If we have a calendar ID, try OAuth2 first
    if (effectiveCalendarId) {
      const oauth2Client = await getOAuth2AuthClient(effectiveCalendarId);
      if (oauth2Client) {
        auth = oauth2Client;
        calendarId = effectiveCalendarId;
        console.log(`✅ Using OAuth2 for calendar: ${calendarId.substring(0, 30)}...`);
      } else {
        console.log(`OAuth2 client not found for ${effectiveCalendarId}, falling back to Service Account`);
        if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
          console.log('Service Account not configured, skipping sync');
          return false;
        }
        auth = getServiceAccountAuthClient();
        calendarId = effectiveCalendarId;
      }
    } else {
      // No OAuth2 calendar available, try Service Account
      if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        console.log('⚠️ No OAuth2 calendar available and Service Account not configured, skipping sync');
        return false;
      }
      auth = getServiceAccountAuthClient();
      calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
      console.log(`Using Service Account for calendar: ${calendarId}`);
    }

    const calendar = google.calendar({ version: 'v3', auth });

    await calendar.events.delete({
      calendarId,
      eventId,
    });

    console.log('✅ Google Calendar event deleted:', eventId, 'from calendar:', calendarId);
    return true;
  } catch (error) {
    console.error('❌ Error deleting Google Calendar event:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return false;
  }
};
