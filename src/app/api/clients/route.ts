import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (email) {
      // Fetch single client by email
      const client = await (await getPrisma()).client.findUnique({
        where: { email },
      });
      return NextResponse.json(client);
    }

    // Fetch all clients
    const clients = await (await getPrisma()).client.findMany({
      include: {
        tickets: {
          include: {
            products: {
              include: {
                product: { select: { name: true, id: true } },
              },
            },
            services: {
              include: {
                service: { select: { name: true, id: true } },
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

    // Transform the data to match the expected format (with items array)
    const transformedClients = clients.map((client) => ({
      ...client,
      tickets: client.tickets.map((ticket) => ({
        ...ticket,
        items: [
          ...ticket.products.map((tp) => ({
            id: tp.id,
            quantity: tp.quantity,
            unitPrice: tp.unitPrice,
            total: tp.total,
            discount: tp.discount,
            product: tp.product,
            service: null,
            type: "product" as const,
          })),
          ...ticket.services.map((ts) => ({
            id: ts.id,
            quantity: ts.quantity,
            unitPrice: ts.unitPrice,
            total: ts.total,
            discount: ts.discount,
            product: null,
            service: ts.service,
            type: "service" as const,
          })),
        ],
        products: undefined,
        services: undefined,
      })),
    }));

    return NextResponse.json(transformedClients);
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

    const { name, email, phone, instagram, address, birthday } = body;

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
      birthday: birthday ? new Date(birthday) : null,
    });

    const client = await (await getPrisma()).client.create({
      data: {
        name,
        email,
        phone: phone || "",
        instagram: instagram || null,
        address: address || "",
        birthday: birthday ? new Date(birthday) : null,
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
    const { name, email, phone, instagram, address, birthday } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing client id" }, { status: 400 });
    }

    const data: Record<string, any> = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (instagram !== undefined) data.instagram = instagram || null;
    if (address !== undefined) data.address = address || "";
    if (birthday !== undefined) data.birthday = birthday ? new Date(birthday) : null;

    const updated = await (await getPrisma()).client.update({
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
