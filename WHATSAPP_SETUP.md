# WhatsApp Business Integration Setup

This guide explains how to set up WhatsApp messaging for automatic client reminders using Twilio.

## Features

- ✅ Appointment reminders (before scheduled appointments)
- ✅ Appointment confirmations (when booking is made)
- ✅ Follow-up reminders (to encourage rebooking)
- ✅ Birthday greetings
- ✅ Customizable message templates with variables

## Prerequisites

1. A Twilio account ([Sign up here](https://www.twilio.com/try-twilio))
2. WhatsApp Business approval (or use Twilio Sandbox for testing)

---

## Part 1: Twilio Account Setup

### 1. Create a Twilio Account

1. Go to [Twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free account
3. Verify your email and phone number

### 2. Get Your Account Credentials

1. Go to your [Twilio Console](https://console.twilio.com/)
2. Find your credentials in the dashboard:
   - **Account SID**: `ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
   - **Auth Token**: Click to reveal (keep this secret!)

### 3. Set Up WhatsApp Sandbox (For Testing)

For testing, you can use the Twilio WhatsApp Sandbox:

1. Go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow the instructions to join the sandbox:
   - Save the Twilio phone number to your contacts
   - Send the join code (e.g., `join example-sandbox`) via WhatsApp
3. Note the sandbox number: `whatsapp:+14155238886`

### 4. Set Up WhatsApp Business (For Production)

For production use:

1. Go to **Messaging** → **Senders** → **WhatsApp senders**
2. Click **New WhatsApp Sender**
3. Complete the Facebook Business verification
4. Configure your WhatsApp Business Profile
5. Note your assigned WhatsApp number

---

## Part 2: Environment Configuration

Add these variables to your `.env` file:

```env
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Variable Descriptions

| Variable | Description | Example |
|----------|-------------|---------|
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_WHATSAPP_NUMBER` | Your WhatsApp sender number | `whatsapp:+14155238886` |

**Important**: The `TWILIO_WHATSAPP_NUMBER` must include the `whatsapp:` prefix.

---

## Part 3: Docker Configuration

If using Docker, add the variables to `compose.yaml`:

```yaml
services:
  app:
    environment:
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
      - TWILIO_WHATSAPP_NUMBER=${TWILIO_WHATSAPP_NUMBER}
```

---

## Part 4: Testing the Integration

### Option A: Test from the Dashboard

1. Go to **Settings** → **WhatsApp** → **Reminders**
2. Click the **Send Test** button
3. Enter your phone number (with country code, e.g., `+521234567890`)
4. Click **Send Test**
5. Check your WhatsApp for the test message

### Option B: Test via API

```bash
curl -X POST http://localhost:3000/api/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+521234567890"}'
```

### Option C: Send a Custom Message

```bash
curl -X POST http://localhost:3000/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+521234567890",
    "message": "Hello! This is a test message.",
    "variables": {
      "clientName": "John Doe"
    }
  }'
```

---

## Part 5: Message Templates

### Available Variables

Use these variables in your message templates:

| Variable | Description | Example |
|----------|-------------|---------|
| `{clientName}` | Client's full name | `Juan Pérez` |
| `{date}` | Appointment date | `25 de Enero, 2026` |
| `{time}` | Appointment time | `10:30 AM` |
| `{serviceName}` | Service name | `Corte de cabello` |
| `{businessName}` | Your business name | `Espacio Omnia` |
| `{staffName}` | Staff member name | `María González` |

### Example Template

```
¡Hola {clientName}! 👋

Te recordamos que tienes una cita programada:

📅 Fecha: {date}
⏰ Hora: {time}
💇 Servicio: {serviceName}
📍 Lugar: {businessName}

¡Te esperamos!
```

---

## Part 6: Configuring Reminders

1. Go to **Settings** → **WhatsApp** → **Reminders**
2. Enable/disable reminders using the toggle switch
3. Click **Edit** to customize:
   - **Name**: Display name for the reminder
   - **Timing**: When to send (e.g., 24 hours before)
   - **Message Template**: The message content with variables

### Reminder Types

| Type | Description | Default Timing |
|------|-------------|----------------|
| Appointment Reminder | Sent before appointments | 24 hours before |
| Appointment Confirmation | Sent when booking is made | Immediately |
| Follow-up Reminder | Encourage rebooking | 30 days after |
| Birthday Greeting | Birthday wishes | On birthday |

---

## Troubleshooting

### Message Not Sending

1. **Check credentials**: Verify `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` in your `.env`
2. **Check phone format**: Ensure numbers include country code (e.g., `+52` for Mexico)
3. **Sandbox users**: Make sure the recipient has joined your WhatsApp sandbox

### "WhatsApp Not Configured" Error

The settings page shows which credentials are missing:
- ❌ `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- ❌ `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
- ❌ `TWILIO_WHATSAPP_NUMBER` - Your WhatsApp number

### Sandbox Limitations

The Twilio WhatsApp Sandbox has these limitations:
- Recipients must join the sandbox first
- Messages expire after 24 hours of inactivity
- Limited message templates

For production use, complete the WhatsApp Business verification process.

---

## Security Notes

- **Never commit** your `TWILIO_AUTH_TOKEN` to version control
- Use environment variables for all sensitive credentials
- Rotate your Auth Token periodically
- Monitor your Twilio usage for unexpected activity

---

## Costs

Twilio WhatsApp pricing (as of 2024):
- **Template messages**: ~$0.005 - $0.08 per message (varies by country)
- **Session messages**: ~$0.005 per message
- Free trial includes ~$15 credit

Check [Twilio Pricing](https://www.twilio.com/whatsapp/pricing) for current rates.
