import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
            items: {
              include: {
                product: { select: { name: true } },
                service: { select: { name: true } },
              },
            },
            staff: {
              select: {
                id: true,
                name: true,
                email: true,
              },
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
    const body = await request.json();
    console.log("Received client creation request:", body);

    const { name, email, phone, instagram, address } = body;

    if (!name || !email) {
      console.error("Missing required fields:", { name, email });
      return NextResponse.json(
        { error: "Missing required fields: name, email" },
        { status: 400 }
      );
    }

    console.log("Creating client with data:", {
      name,
      email,
      phone: phone || "",
      instagram: instagram || null,
      address: address || "",
    });

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone: phone || "",
        instagram: instagram || null,
        address: address || "",
      },
    });

    console.log("Client created successfully:", client.id);

    return NextResponse.json(
      { data: client, message: "Client created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating client - Full error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("unique constraint")
    ) {
      console.error("Unique constraint violation");
      return NextResponse.json(
        { error: "Client with this email or instagram already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Failed to create client",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const { name, email, phone, instagram, address } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing client id" }, { status: 400 });
    }

    const data: Record<string, string | null> = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (instagram !== undefined) data.instagram = instagram || null;
    if (address !== undefined) data.address = address || "";

    const updated = await prisma.client.update({
      where: { id },
      data,
    });

    return NextResponse.json(
      { data: updated, message: "Client updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}
