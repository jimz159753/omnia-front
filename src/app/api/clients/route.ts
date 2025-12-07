import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: clients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, instagram } = await request.json();

    if (!name || !email || !phone || !instagram) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, phone, instagram" },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        instagram,
      },
    });

    return NextResponse.json(
      { data: client, message: "Client created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating client:", error);
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("unique constraint")
    ) {
      return NextResponse.json(
        { error: "Client with this email or instagram already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}

