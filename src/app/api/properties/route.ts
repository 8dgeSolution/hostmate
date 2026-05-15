import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { propertySchema } from "@/lib/validations";

function normalizeOptionalNumbers<T>(value: T) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number" && Number.isNaN(value)) {
    return null;
  }

  return value;
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = propertySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid property details." }, { status: 400 });
  }

  const existing = await db.property.findUnique({ where: { slug: parsed.data.slug } });

  if (existing) {
    return NextResponse.json({ error: "That guest link slug is already in use." }, { status: 409 });
  }

  const property = await db.property.create({
    data: {
      ...parsed.data,
      hostId: session.user.id,
      addressLine2: parsed.data.addressLine2 || null,
      parkingInfo: parsed.data.parkingInfo || null,
      lockboxCode: parsed.data.lockboxCode || null,
      lockboxSteps: parsed.data.lockboxSteps,
      arrivalNotes: parsed.data.arrivalNotes || null,
      lockboxLat: normalizeOptionalNumbers(parsed.data.lockboxLat),
      lockboxLng: normalizeOptionalNumbers(parsed.data.lockboxLng),
      parkingLat: normalizeOptionalNumbers(parsed.data.parkingLat),
      parkingLng: normalizeOptionalNumbers(parsed.data.parkingLng),
      parkingSteps: parsed.data.parkingSteps,
    },
  });

  return NextResponse.json({ property });
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = propertySchema.safeParse(body);

  if (!parsed.success || !body.id) {
    return NextResponse.json({ error: "Invalid property details." }, { status: 400 });
  }

  const property = await db.property.findFirst({
    where: {
      id: String(body.id),
      hostId: session.user.id,
    },
  });

  if (!property) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }

  const slugOwner = await db.property.findUnique({ where: { slug: parsed.data.slug } });

  if (slugOwner && slugOwner.id !== property.id) {
    return NextResponse.json({ error: "That guest link slug is already in use." }, { status: 409 });
  }

  const updated = await db.property.update({
    where: { id: property.id },
    data: {
      ...parsed.data,
      addressLine2: parsed.data.addressLine2 || null,
      parkingInfo: parsed.data.parkingInfo || null,
      lockboxCode: parsed.data.lockboxCode || null,
      lockboxSteps: parsed.data.lockboxSteps,
      arrivalNotes: parsed.data.arrivalNotes || null,
      lockboxLat: normalizeOptionalNumbers(parsed.data.lockboxLat),
      lockboxLng: normalizeOptionalNumbers(parsed.data.lockboxLng),
      parkingLat: normalizeOptionalNumbers(parsed.data.parkingLat),
      parkingLng: normalizeOptionalNumbers(parsed.data.parkingLng),
      parkingSteps: parsed.data.parkingSteps,
    },
  });

  return NextResponse.json({ property: updated });
}