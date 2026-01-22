import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Default reminder templates
const defaultReminders = [
  {
    type: "appointment",
    name: "Appointment Reminder",
    isEnabled: true,
    timing: 24,
    timingUnit: "hours",
    messageTemplate: `¡Hola {clientName}! 👋

Te recordamos que tienes una cita programada:

📅 Fecha: {date}
⏰ Hora: {time}
💇 Servicio: {serviceName}
📍 Lugar: {businessName}

¡Te esperamos! Si necesitas reprogramar, contáctanos.`,
  },
  {
    type: "followup",
    name: "Follow-up Reminder",
    isEnabled: false,
    timing: 30,
    timingUnit: "days",
    messageTemplate: `¡Hola {clientName}! 👋

Ha pasado un tiempo desde tu última visita a {businessName}. 

¿Te gustaría agendar una nueva cita? Estamos aquí para atenderte.

¡Esperamos verte pronto! 💫`,
  },
  {
    type: "birthday",
    name: "Birthday Greeting",
    isEnabled: false,
    timing: 0,
    timingUnit: "days",
    messageTemplate: `🎂 ¡Feliz Cumpleaños, {clientName}! 🎉

Desde {businessName} te deseamos un día increíble lleno de alegría.

Como regalo especial, te ofrecemos un 15% de descuento en tu próxima visita. ¡Ven a celebrar con nosotros!

🎁 Código: CUMPLE15`,
  },
  {
    type: "confirmation",
    name: "Appointment Confirmation",
    isEnabled: true,
    timing: 0,
    timingUnit: "hours",
    messageTemplate: `¡Hola {clientName}! 👋

Tu cita ha sido confirmada:

📅 Fecha: {date}
⏰ Hora: {time}
💇 Servicio: {serviceName}
📍 Lugar: {businessName}

Gracias por elegirnos. ¡Te esperamos! ✨`,
  },
];

// GET - Fetch all reminders
export async function GET() {
  try {
    let reminders = await prisma.whatsAppReminder.findMany({
      orderBy: { createdAt: "asc" },
    });

    // If no reminders exist, create defaults
    if (reminders.length === 0) {
      await prisma.whatsAppReminder.createMany({
        data: defaultReminders,
      });
      reminders = await prisma.whatsAppReminder.findMany({
        orderBy: { createdAt: "asc" },
      });
    }

    return NextResponse.json({ data: reminders });
  } catch (error) {
    console.error("Error fetching WhatsApp reminders:", error);
    return NextResponse.json(
      { error: "Failed to fetch reminders" },
      { status: 500 }
    );
  }
}

// POST - Create a new reminder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, name, isEnabled, timing, timingUnit, messageTemplate } = body;

    if (!type || !name || !messageTemplate) {
      return NextResponse.json(
        { error: "Type, name, and message template are required" },
        { status: 400 }
      );
    }

    const reminder = await prisma.whatsAppReminder.create({
      data: {
        type,
        name,
        isEnabled: isEnabled ?? true,
        timing: timing ?? 24,
        timingUnit: timingUnit ?? "hours",
        messageTemplate,
      },
    });

    return NextResponse.json(
      { data: reminder, message: "Reminder created successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating WhatsApp reminder:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A reminder of this type already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create reminder" },
      { status: 500 }
    );
  }
}

// PUT - Update a reminder
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Reminder ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, isEnabled, timing, timingUnit, messageTemplate } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled;
    if (timing !== undefined) updateData.timing = timing;
    if (timingUnit !== undefined) updateData.timingUnit = timingUnit;
    if (messageTemplate !== undefined)
      updateData.messageTemplate = messageTemplate;

    const reminder = await prisma.whatsAppReminder.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      data: reminder,
      message: "Reminder updated successfully",
    });
  } catch (error) {
    console.error("Error updating WhatsApp reminder:", error);
    return NextResponse.json(
      { error: "Failed to update reminder" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a reminder
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Reminder ID is required" },
        { status: 400 }
      );
    }

    await prisma.whatsAppReminder.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Reminder deleted successfully" });
  } catch (error) {
    console.error("Error deleting WhatsApp reminder:", error);
    return NextResponse.json(
      { error: "Failed to delete reminder" },
      { status: 500 }
    );
  }
}
