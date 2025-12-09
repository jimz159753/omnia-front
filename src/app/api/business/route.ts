import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { prisma } from "@/lib/db";

const uploadDirectory = path.join(process.cwd(), "public", "uploads");

const parseBoolean = (value: FormDataEntryValue | null) => {
  if (value === null) return false;
  if (typeof value === "string") {
    return value === "true" || value === "on";
  }
  return Boolean(value);
};

async function saveLogo(logoFile: File | null) {
  if (!logoFile || logoFile.size === 0) return null;
  await fs.promises.mkdir(uploadDirectory, { recursive: true });
  const buffer = Buffer.from(await logoFile.arrayBuffer());
  const safeName = `${Date.now()}-${logoFile.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
  const filePath = path.join(uploadDirectory, safeName);
  await fs.promises.writeFile(filePath, buffer);
  return `/uploads/${safeName}`;
}

export async function GET() {
  const business = await prisma.business.findFirst();
  return NextResponse.json({ data: business });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const existing = await prisma.business.findFirst();
  const logoFile = formData.get("logo") instanceof File ? (formData.get("logo") as File) : null;

  const data = {
    name: (formData.get("name") as string) ?? "",
    category: (formData.get("category") as string) ?? "",
    website: (formData.get("website") as string) ?? "",
    rfc: (formData.get("rfc") as string) ?? "",
    address: (formData.get("address") as string) ?? "",
    country: (formData.get("country") as string) ?? "",
    phone: (formData.get("phone") as string) ?? "",
    description: (formData.get("description") as string) ?? "",
    facebook: (formData.get("facebook") as string) ?? "",
    twitter: (formData.get("twitter") as string) ?? "",
    instagram: (formData.get("instagram") as string) ?? "",
    parking: parseBoolean(formData.get("parking")),
    acceptCards: parseBoolean(formData.get("acceptCards")),
    acceptCash: parseBoolean(formData.get("acceptCash")),
    petFriendly: parseBoolean(formData.get("petFriendly")),
    freeWifi: parseBoolean(formData.get("freeWifi")),
    whatsappReminders: parseBoolean(formData.get("whatsappReminders")),
    whatsappCredits: parseBoolean(formData.get("whatsappCredits")),
    whatsappChatBot: parseBoolean(formData.get("whatsappChatBot")),
      language: (formData.get("language") as string) ?? "en",
  };

  let logoUrl = existing?.logo ?? null;
  if (logoFile && logoFile.size > 0) {
    const savedLogo = await saveLogo(logoFile);
    if (savedLogo) {
      logoUrl = savedLogo;
    }
    if (existing?.logo && existing.logo !== logoUrl) {
      const oldPath = path.join(process.cwd(), "public", existing.logo);
      fs.promises.rm(oldPath).catch(() => {});
    }
  }

  if (logoUrl) {
    (data as typeof data & { logo: string }).logo = logoUrl;
  }

  const business = existing
    ? await prisma.business.update({
        where: { id: existing.id },
        data,
      })
    : await prisma.business.create({ data });

  return NextResponse.json({ data: business });
}

