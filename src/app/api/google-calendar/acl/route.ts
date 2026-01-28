import { NextRequest, NextResponse } from "next/server";
import { 
  getCalendarAcl, 
  addCalendarAcl, 
  deleteCalendarAcl 
} from "@/services/googleCalendarService";

export async function GET(request: NextRequest) {
  try {
    const calendarId = request.nextUrl.searchParams.get("calendarId");

    if (!calendarId) {
      return NextResponse.json(
        { error: "Calendar ID is required" },
        { status: 400 }
      );
    }

    const acl = await getCalendarAcl(calendarId);

    if (acl === null) {
      return NextResponse.json(
        { error: "Failed to fetch ACL (Calendar not found or auth error)" },
        { status: 500 }
      );
    }

    return NextResponse.json({ items: acl });
  } catch (error) {
    console.error("Error fetching ACL:", error);
    return NextResponse.json(
      { error: "Failed to fetch ACL" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { calendarId, email, role } = body;

    if (!calendarId || !email) {
      return NextResponse.json(
        { error: "Calendar ID and email are required" },
        { status: 400 }
      );
    }

    const result = await addCalendarAcl(calendarId, email, role || "reader");

    if (!result) {
      return NextResponse.json(
        { error: "Failed to add ACL rule" },
        { status: 500 }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error adding ACL rule:", error);
    return NextResponse.json(
      { error: "Failed to add ACL rule" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const calendarId = searchParams.get("calendarId");
    const ruleId = searchParams.get("ruleId");

    if (!calendarId || !ruleId) {
      return NextResponse.json(
        { error: "Calendar ID and rule ID are required" },
        { status: 400 }
      );
    }

    const success = await deleteCalendarAcl(calendarId, ruleId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete ACL rule" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "ACL rule deleted" });
  } catch (error) {
    console.error("Error deleting ACL rule:", error);
    return NextResponse.json(
      { error: "Failed to delete ACL rule" },
      { status: 500 }
    );
  }
}
