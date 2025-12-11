import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const restTimes = await prisma.restTime.findMany({
      orderBy: {
        dayOfWeek: "asc",
      },
    });

    return NextResponse.json({ data: restTimes });
  } catch (error) {
    console.error("Get rest times error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch rest times",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dayOfWeek, startTime, endTime } = body;

    if (!dayOfWeek || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Day, start time, and end time are required" },
        { status: 400 }
      );
    }

    const restTime = await prisma.restTime.create({
      data: {
        dayOfWeek,
        startTime,
        endTime,
      },
    });

    return NextResponse.json({
      success: true,
      data: restTime,
    });
  } catch (error) {
    console.error("Create rest time error:", error);
    return NextResponse.json(
      {
        error: "Failed to create rest time",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();
    const { dayOfWeek, startTime, endTime } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Rest time ID is required" },
        { status: 400 }
      );
    }

    if (!dayOfWeek || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Day, start time, and end time are required" },
        { status: 400 }
      );
    }

    const restTime = await prisma.restTime.update({
      where: { id },
      data: {
        dayOfWeek,
        startTime,
        endTime,
      },
    });

    return NextResponse.json({
      success: true,
      data: restTime,
    });
  } catch (error) {
    console.error("Update rest time error:", error);
    return NextResponse.json(
      {
        error: "Failed to update rest time",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Rest time ID is required" },
        { status: 400 }
      );
    }

    await prisma.restTime.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Rest time deleted successfully",
    });
  } catch (error) {
    console.error("Delete rest time error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete rest time",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

