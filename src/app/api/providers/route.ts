import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export async function GET() {
  try {
    const providers = await (await getPrisma()).provider.findMany({
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

    const provider = await (await getPrisma()).provider.create({
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

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const provider = await (await getPrisma()).provider.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json({
      data: provider,
      message: "Provider updated successfully",
    });
  } catch (error) {
    console.error("Error updating provider:", error);
    return NextResponse.json(
      { error: "Failed to update provider" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await (await getPrisma()).provider.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Provider deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting provider:", error);
    
    // Check for Prisma foreign key constraint error
    const prismaError = error as { code?: string };
    if (prismaError?.code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete provider: it is being used by products" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete provider" },
      { status: 500 }
    );
  }
}
