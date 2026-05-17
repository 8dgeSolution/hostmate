import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

function getCloudinaryConfigFromEnv() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return null;

  return { cloudName, apiKey, apiSecret };
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as { companyLogoUrl?: string | null };
  const companyLogoUrl = typeof payload.companyLogoUrl === "string" && payload.companyLogoUrl.length
    ? payload.companyLogoUrl
    : null;

  // Fetch existing logo so we can delete it from Cloudinary if needed
  const existing = await db.user.findUnique({ where: { id: session.user.id }, select: { companyLogoUrl: true } });

  // If clearing the logo and the existing one looks like a Cloudinary URL, attempt deletion
  if (!companyLogoUrl && existing?.companyLogoUrl) {
    try {
      const cfg = getCloudinaryConfigFromEnv();

      if (cfg && existing.companyLogoUrl.includes("res.cloudinary.com") && existing.companyLogoUrl.includes("/upload/")) {
        cloudinary.config({
          cloud_name: cfg.cloudName,
          api_key: cfg.apiKey,
          api_secret: cfg.apiSecret,
        });

        // Extract the public_id from the secure URL.
        // Example URL: https://res.cloudinary.com/<cloud>/image/upload/v12345/folder/sub/file.png
        // We want: folder/sub/file (remove /v12345/ and extension)
        const afterUpload = existing.companyLogoUrl.split("/upload/")[1] || "";
        const withoutVersion = afterUpload.replace(/v\d+\//, "");
        const publicIdWithExt = withoutVersion.split("?")[0];
        const publicId = publicIdWithExt.replace(/\.[a-zA-Z0-9]+$/, "");

        if (publicId) {
          // Best-effort delete; don't block the request if Cloudinary deletion fails
          await new Promise<void>((resolve) => {
            cloudinary.uploader.destroy(publicId, { invalidate: true }, (err) => {
              if (err) {
                // log to console for now
                console.error("Cloudinary destroy error:", err);
                return resolve();
              }

              resolve();
            });
          });
        }
      }
    } catch (err) {
      // swallow errors to avoid failing user action; log for debugging
      console.error("Error deleting cloudinary logo:", err);
    }
  }

  const user = await db.user.update({
    where: { id: session.user.id },
    data: { companyLogoUrl },
    select: { companyLogoUrl: true },
  });

  return NextResponse.json(user);
}