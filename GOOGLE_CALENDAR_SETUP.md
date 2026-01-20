# Google Calendar Integration Setup

This application supports automatic synchronization of appointments to Google Calendar. This is an **optional feature** - the app works perfectly without it.

## What Gets Synced?

- ✅ **Appointments only** (tickets with `startTime` and `endTime`)
- ❌ **NOT synced**: Regular sales/tickets without scheduled times

## Setup Instructions

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### 2. Enable Google Calendar API

1. In your project, go to **APIs & Services** > **Library**
2. Search for "Google Calendar API"
3. Click **Enable**

### 3. Create a Service Account

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Fill in the details:
   - Service account name: `omnia-calendar-sync` (or any name)
   - Service account ID: (auto-generated)
   - Role: **Project** > **Editor** (or more restrictive if you prefer)
4. Click **Done**

### 4. Generate and Download Credentials

1. Click on your newly created service account
2. Go to the **Keys** tab
3. Click **Add Key** > **Create new key**
4. Choose **JSON** format
5. Click **Create** - this downloads a JSON file

### 5. Grant Calendar Access

**Important:** You need to give the service account access to your calendar:

1. Open [Google Calendar](https://calendar.google.com/)
2. Go to **Settings** > **Settings for my calendars** > Select your calendar
3. Scroll to **Share with specific people**
4. Click **Add people**
5. Enter the service account email (from the JSON file, looks like: `omnia-calendar-sync@project-id.iam.gserviceaccount.com`)
6. Set permissions to **Make changes to events**
7. Click **Send**

### 6. Add Environment Variables

Add these variables to your `.env` file:

```bash
# Google Calendar API (Optional)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=primary
```

**How to get these values from the JSON file:**

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "omnia-calendar-sync@project-id.iam.gserviceaccount.com",
  ...
}
```

- `GOOGLE_SERVICE_ACCOUNT_EMAIL` = `client_email` from JSON
- `GOOGLE_PRIVATE_KEY` = `private_key` from JSON (keep the `\n` characters)
- `GOOGLE_CALENDAR_ID` = `primary` (or a specific calendar ID if you want to use a different calendar)

### 7. Update Docker Environment (if using Docker)

If you're using Docker, add these to your `docker-compose.yml` or pass them as environment variables:

```yaml
services:
  app:
    environment:
      - GOOGLE_SERVICE_ACCOUNT_EMAIL=${GOOGLE_SERVICE_ACCOUNT_EMAIL}
      - GOOGLE_PRIVATE_KEY=${GOOGLE_PRIVATE_KEY}
      - GOOGLE_CALENDAR_ID=${GOOGLE_CALENDAR_ID}
```

### 8. Restart the Application

```bash
npm run dev
# or if using Docker:
docker compose down
docker compose up --build -d
```

## How It Works

### Creating Appointments
When you create a new appointment (ticket with start/end time):
1. The ticket is saved to the database
2. A Google Calendar event is automatically created
3. The Google Calendar event ID is saved in the ticket
4. Client receives calendar invitation (if email is provided)

### Updating Appointments
When you update an appointment:
1. The ticket is updated in the database
2. The corresponding Google Calendar event is updated
3. Participants receive update notifications

### Deleting Appointments
When you delete a ticket:
1. The ticket is deleted from the database
2. The corresponding Google Calendar event is also deleted

### Sales (Non-Appointments)
Regular sales without scheduled times are **NOT synced** to Google Calendar.

## Troubleshooting

### Events are not appearing in Google Calendar

1. **Check environment variables**: Make sure all three variables are set correctly
2. **Check service account permissions**: Ensure the service account email has access to your calendar
3. **Check logs**: Look for "Google Calendar" messages in your application logs
4. **Verify calendar ID**: If using a custom calendar, make sure the ID is correct

### "Invalid credentials" error

1. Verify the `GOOGLE_PRIVATE_KEY` includes the entire key with `\n` characters
2. Make sure the service account JSON file is valid
3. Check that the Google Calendar API is enabled in your project

### Events created but not visible

1. Check that you're looking at the correct calendar
2. Verify the service account has "Make changes to events" permission
3. Check the calendar's sharing settings

## Without Google Calendar

If you don't set up Google Calendar (environment variables not provided):
- ✅ The app works normally
- ✅ Appointments are stored in the database
- ✅ Calendar view in the app works
- ❌ No sync to external Google Calendar

The integration gracefully skips sync operations if credentials are not configured.

## Security Notes

- **Never commit** the `.env` file or service account JSON to version control
- Keep your `GOOGLE_PRIVATE_KEY` secure
- Use environment-specific service accounts for production
- Regularly rotate service account keys
- Use minimal permissions (only Calendar API access needed)

## Support

For issues with Google Calendar API, refer to:
- [Google Calendar API Documentation](https://developers.google.com/calendar)
- [Service Accounts Documentation](https://cloud.google.com/iam/docs/service-accounts)
