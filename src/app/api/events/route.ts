import { NextRequest, NextResponse } from "next/server";
import { calendarService } from "@/services";

// GET /api/events - Get all events
export async function GET() {
  try {
    const events = await calendarService.getEvents();
    console.log(events);
    return NextResponse.json(events);
  } catch (error) {
    console.error("Events GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}

// POST /api/calendar - Create new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.startTime || !body.endTime) {
      return NextResponse.json(
        { error: "Title, startTime, and endTime are required" },
        { status: 400 }
      );
    }

    const newEvent = await calendarService.createEvent(body);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Calendar POST error:", error);
    return NextResponse.json(
      { error: "Failed to create calendar event" },
      { status: 500 }
    );
  }
}

// PUT /api/calendar - Update existing event
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const updatedEvent = await calendarService.updateEvent(body);
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Calendar PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update calendar event" },
      { status: 500 }
    );
  }
}
