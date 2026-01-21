import { google } from 'googleapis';

// Initialize auth (Service Account approach - simpler for backend)
const getAuthClient = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  return auth;
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
 * Create a Google Calendar event
 * @param eventData - Event details
 * @param targetCalendarId - Optional calendar ID from GoogleCalendar table (user-selected calendar)
 */
export const createGoogleCalendarEvent = async (
  eventData: GoogleCalendarEvent,
  targetCalendarId?: string
): Promise<string | null> => {
  try {
    // Skip if Google Calendar is not configured
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.log('Google Calendar not configured, skipping sync');
      return null;
    }

    const auth = getAuthClient();
    // Use provided calendar ID, fallback to env var, then to 'primary'
    const calendarId = targetCalendarId || process.env.GOOGLE_CALENDAR_ID || 'primary';
    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.insert({
      calendarId,
      requestBody: eventData,
    });

    console.log('Google Calendar event created:', response.data.id, 'in calendar:', calendarId);
    return response.data.id || null;
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
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
    // Skip if Google Calendar is not configured
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.log('Google Calendar not configured, skipping sync');
      return false;
    }

    const auth = getAuthClient();
    // Use provided calendar ID, fallback to env var, then to 'primary'
    const calendarId = targetCalendarId || process.env.GOOGLE_CALENDAR_ID || 'primary';
    const calendar = google.calendar({ version: 'v3', auth });

    await calendar.events.update({
      calendarId,
      eventId,
      requestBody: eventData,
    });

    console.log('Google Calendar event updated:', eventId, 'in calendar:', calendarId);
    return true;
  } catch (error) {
    console.error('Error updating Google Calendar event:', error);
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
    // Skip if Google Calendar is not configured
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.log('Google Calendar not configured, skipping sync');
      return false;
    }

    const auth = getAuthClient();
    // Use provided calendar ID, fallback to env var, then to 'primary'
    const calendarId = targetCalendarId || process.env.GOOGLE_CALENDAR_ID || 'primary';
    const calendar = google.calendar({ version: 'v3', auth });

    await calendar.events.delete({
      calendarId,
      eventId,
    });

    console.log('Google Calendar event deleted:', eventId, 'from calendar:', calendarId);
    return true;
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
    return false;
  }
};
