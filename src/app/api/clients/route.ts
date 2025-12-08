import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (email) {
      // Fetch single client by email
      const client = await prisma.client.findUnique({
        where: { email },
      });
      return NextResponse.json(client);
    }

    // Fetch all clients
    const clients = await prisma.client.findMany({
      include: {
        tickets: {
          include: {
            product: {
              select: { name: true },
            },
            service: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(clients);
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
    const { name, email, phone, instagram, address } = await request.json();

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
        address: address || "",
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

