import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const schedules = await prisma.schedule.findMany({
      orderBy: {
        dayOfWeek: "asc",
      },
    });
    
    return NextResponse.json({ data: schedules });
  } catch (error) {
    console.error("Get schedules error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch schedules",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schedules } = body;

    if (!schedules || !Array.isArray(schedules)) {
      return NextResponse.json(
        { error: "Invalid schedules data" },
        { status: 400 }
      );
    }

    // Delete all existing schedules and create new ones
    await prisma.schedule.deleteMany();

    const createdSchedules = await prisma.schedule.createMany({
      data: schedules.map((schedule: any) => ({
        dayOfWeek: schedule.dayOfWeek,
        isOpen: schedule.isOpen,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      })),
    });

    return NextResponse.json({ 
      success: true,
      data: createdSchedules
    });
  } catch (error) {
    console.error("Save schedules error:", error);
    return NextResponse.json(
      {
        error: "Failed to save schedules",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

