import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "5");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * pageSize;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    // Get total count for pagination
    const total = await (await getPrisma()).service.count({ where });

    // Get paginated data
    const services = await (await getPrisma()).service.findMany({
      where,
      include: {
        category: {
          include: {
            subCategories: true,
          },
        },
        subCategory: true,
        provider: true,
        schedules: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    });

    return NextResponse.json({
      data: services,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

interface ServiceScheduleInput {
  dayOfWeek: string;
  isOpen: boolean;
  startTime: string | null;
  endTime: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      commission,
      duration,
      slots,
      classes,
      providerId,
      startDate,
      endDate,
      categoryId,
      subCategoryId,
      image,
      googleCalendarId,
      useCustomSchedule,
      schedules,
      minAdvanceBookingHours,
    } = body;

    // Validate required fields
    if (
      !name ||
      price === undefined ||
      commission === undefined ||
      duration === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate that category exists (if provided)
    if (categoryId) {
      const category = await (await getPrisma()).category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        return NextResponse.json(
          { error: "Invalid category. Please select an existing category." },
          { status: 400 }
        );
      }
    }

    // Validate that subcategory exists and belongs to the category (if provided)
    if (subCategoryId) {
      const subCategory = await (await getPrisma()).subCategory.findUnique({
        where: { id: subCategoryId },
      });
      if (!subCategory) {
        return NextResponse.json(
          { error: "Invalid subcategory. Please select an existing subcategory." },
          { status: 400 }
        );
      }
      if (categoryId && subCategory.categoryId !== categoryId) {
        return NextResponse.json(
          {
            error:
              "The selected subcategory does not belong to the selected category.",
          },
          { status: 400 }
        );
      }
    }

    // Create service with schedules
    const service = await (await getPrisma()).service.create({
      data: {
        name,
        description: description || "",
        price: parseFloat(price),
        commission: parseFloat(commission),
        duration: parseInt(duration),
        slots: slots && parseInt(slots) > 0 ? parseInt(slots) : null,
        classes: classes && parseInt(classes) > 0 ? parseInt(classes) : null,
        providerId: providerId || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        categoryId: categoryId || null,
        subCategoryId: subCategoryId || null,
        image: image || "",
        googleCalendarId: googleCalendarId || null,
        useCustomSchedule: useCustomSchedule || false,
        minAdvanceBookingHours: minAdvanceBookingHours ? parseInt(minAdvanceBookingHours) : 0,
        schedules: schedules && Array.isArray(schedules) && schedules.length > 0
          ? {
              create: schedules.map((s: ServiceScheduleInput) => ({
                dayOfWeek: s.dayOfWeek,
                isOpen: s.isOpen,
                startTime: s.startTime,
                endTime: s.endTime,
              })),
            }
          : undefined,
      },
      include: {
        category: {
          include: {
            subCategories: true,
          },
        },
        subCategory: true,
        provider: true,
        schedules: true,
      },
    });

    return NextResponse.json(
      { data: service, message: "Service created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating service:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create service", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      description,
      price,
      commission,
      duration,
      slots,
      classes,
      providerId,
      startDate,
      endDate,
      categoryId,
      subCategoryId,
      image,
      googleCalendarId,
      useCustomSchedule,
      schedules,
      minAdvanceBookingHours,
    } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      );
    }

    // Check if service exists
    const existingService = await (await getPrisma()).service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Validate category if provided
    if (categoryId) {
      const category = await (await getPrisma()).category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        return NextResponse.json(
          { error: "Invalid category. Please select an existing category." },
          { status: 400 }
        );
      }
    }

    // Validate subcategory if provided
    if (subCategoryId) {
      const subCategory = await (await getPrisma()).subCategory.findUnique({
        where: { id: subCategoryId },
      });
      if (!subCategory) {
        return NextResponse.json(
          {
            error: "Invalid subcategory. Please select an existing subcategory.",
          },
          { status: 400 }
        );
      }
      if (categoryId && subCategory.categoryId !== categoryId) {
        return NextResponse.json(
          {
            error:
              "The selected subcategory does not belong to the selected category.",
          },
          { status: 400 }
        );
      }
    }

    // Calculate slots value
    const slotsValue = slots !== undefined ? (parseInt(String(slots)) > 0 ? parseInt(String(slots)) : null) : undefined;
    const classesValue = classes !== undefined ? (parseInt(String(classes)) > 0 ? parseInt(String(classes)) : null) : undefined;
    const minAdvanceValue = minAdvanceBookingHours !== undefined ? parseInt(String(minAdvanceBookingHours)) : undefined;
    console.log(`📝 Updating service "${name || existingService.name}": slots received=${slots}, classes received=${classes}`);

    // Update schedules if provided
    if (schedules !== undefined && Array.isArray(schedules)) {
      // Delete existing schedules
      await (await getPrisma()).serviceSchedule.deleteMany({
        where: { serviceId: id },
      });

      // Create new schedules if any
      if (schedules.length > 0) {
        await (await getPrisma()).serviceSchedule.createMany({
          data: schedules.map((s: ServiceScheduleInput) => ({
            serviceId: id,
            dayOfWeek: s.dayOfWeek,
            isOpen: s.isOpen,
            startTime: s.startTime,
            endTime: s.endTime,
          })),
        });
      }
    }

    // Update service
    const service = await (await getPrisma()).service.update({
      where: { id },
      data: {
        name,
        description: description || "",
        price: price !== undefined ? parseFloat(price) : undefined,
        commission: commission !== undefined ? parseFloat(commission) : undefined,
        duration: duration !== undefined ? parseInt(duration) : undefined,
        slots: slotsValue,
        classes: classesValue,
        providerId: providerId !== undefined ? (providerId || null) : undefined,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : undefined,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
        categoryId: categoryId || null,
        subCategoryId: subCategoryId || null,
        image: image || "",
        googleCalendarId: googleCalendarId !== undefined ? (googleCalendarId || null) : undefined,
        useCustomSchedule: useCustomSchedule !== undefined ? useCustomSchedule : undefined,
        minAdvanceBookingHours: minAdvanceValue,
      },
      include: {
        category: {
          include: {
            subCategories: true,
          },
        },
        subCategory: true,
        provider: true,
        schedules: true,
      },
    });

    console.log(`✅ Service updated successfully: slots now = ${service.slots}, useCustomSchedule = ${service.useCustomSchedule}`);
    
    return NextResponse.json(
      { data: service, message: "Service updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating service:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update service", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      );
    }

    // Check if service exists
    const existingService = await (await getPrisma()).service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Delete service
    await (await getPrisma()).service.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Service deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}

