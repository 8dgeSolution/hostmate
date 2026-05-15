import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function sanitizeSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-/]+|[-/]+$/g, "") || "draft";
}

function getMaxFileSize() {
  const configured = Number(process.env.UPLOAD_MAX_IMAGE_SIZE_MB || "5");

  if (!Number.isFinite(configured) || configured <= 0) {
    return DEFAULT_MAX_FILE_SIZE;
  }

  return configured * 1024 * 1024;
}

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "stay-portal";

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    folder,
  };
}

async function uploadToCloudinary(file: File, folderSegments: string[]) {
  const config = getCloudinaryConfig();

  if (!config) {
    return null;
  }

  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
  });

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${config.folder}/${folderSegments.join("/")}`,
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error || new Error("Cloudinary upload failed."));
          return;
        }

        resolve({ secure_url: result.secure_url });
      },
    );

    stream.end(buffer);
  });

  return result.secure_url;
}

async function saveLocally(file: File, folderSegments: string[]) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadsDir = path.join(process.cwd(), "public", "uploads", ...folderSegments);
  await mkdir(uploadsDir, { recursive: true });

  const extension = path.extname(file.name) || ".jpg";
  const safeFileName = `${randomUUID()}${extension.toLowerCase()}`;
  const targetPath = path.join(uploadsDir, safeFileName);

  await writeFile(targetPath, buffer);

  return `/uploads/${folderSegments.join("/")}/${safeFileName}`;
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const category = sanitizeSegment(String(formData.get("category") || "general"));
  const propertySlug = sanitizeSegment(String(formData.get("propertySlug") || ""));
  const propertyId = sanitizeSegment(String(formData.get("propertyId") || ""));

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
  }

  const maxFileSize = getMaxFileSize();

  if (file.size > maxFileSize) {
    return NextResponse.json({ error: `Image must be ${Math.round(maxFileSize / 1024 / 1024)}MB or smaller.` }, { status: 400 });
  }

  const folderSegments = category === "branding"
    ? ["users", session.user.id, "branding"]
    : ["users", session.user.id, "properties", propertySlug || propertyId || "draft", category];

  try {
    const cloudinaryUrl = await uploadToCloudinary(file, folderSegments);

    if (cloudinaryUrl) {
      return NextResponse.json({ url: cloudinaryUrl, storage: "cloudinary" });
    }

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Cloudinary must be configured for production uploads." }, { status: 500 });
    }

    const localUrl = await saveLocally(file, folderSegments);
    return NextResponse.json({ url: localUrl, storage: "local" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to upload image." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as { url?: string };
    const url = typeof payload?.url === "string" && payload.url.length ? payload.url : null;

    if (!url) {
      return NextResponse.json({ error: "No url provided." }, { status: 400 });
    }

    const config = getCloudinaryConfig();

    // Cloudinary URL deletion
    if (config && url.includes("res.cloudinary.com") && url.includes("/upload/")) {
      cloudinary.config({
        cloud_name: config.cloudName,
        api_key: config.apiKey,
        api_secret: config.apiSecret,
      });

      const afterUpload = url.split("/upload/")[1] || "";
      const withoutVersion = afterUpload.replace(/v\d+\//, "");
      const publicIdWithExt = withoutVersion.split("?")[0];
      const publicId = publicIdWithExt.replace(/\.[a-zA-Z0-9]+$/, "");

      if (publicId) {
        await new Promise<void>((resolve) => {
          cloudinary.uploader.destroy(publicId, { invalidate: true }, (err) => {
            if (err) {
              console.error("Cloudinary destroy error:", err);
            }
            resolve();
          });
        });
      }

      return NextResponse.json({ ok: true, deletedFrom: "cloudinary" });
    }

    // Local file deletion for dev
    if (url.startsWith("/uploads/")) {
      const rel = url.replace(/^\//, "");
      const fsPath = path.join(process.cwd(), "public", rel);
      try {
        await unlink(fsPath);
        return NextResponse.json({ ok: true, deletedFrom: "local" });
      } catch (err) {
        console.error("Unable to unlink local file:", err);
        return NextResponse.json({ error: "Unable to delete local file." }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, message: "No deletion performed." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete image." }, { status: 500 });
  }
}