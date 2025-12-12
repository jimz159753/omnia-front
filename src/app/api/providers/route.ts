import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ data: providers });
  } catch (error) {
    console.error("Error fetching providers:", error);
    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const provider = await prisma.provider.create({
      data: {
        name,
      },
    });

    return NextResponse.json(
      { data: provider, message: "Provider created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating provider:", error);
    return NextResponse.json(
      { error: "Failed to create provider" },
      { status: 500 }
    );
  }
}

