import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

// MIME types for common image formats
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".bmp": "image/bmp",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    
    if (!pathSegments || pathSegments.length === 0) {
      return NextResponse.json({ error: "Path required" }, { status: 400 });
    }

    // Join path segments and sanitize
    const filePath = pathSegments.join("/");
    
    // Prevent directory traversal attacks
    if (filePath.includes("..") || filePath.startsWith("/")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // Construct the full file path
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const fullPath = path.join(uploadsDir, filePath);

    // Ensure the file is within the uploads directory
    if (!fullPath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // Check if file exists
    try {
      await stat(fullPath);
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read the file
    const fileBuffer = await readFile(fullPath);

    // Get file extension and MIME type
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
}
