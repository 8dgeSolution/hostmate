import { NextResponse } from "next/server";

export const runtime = "nodejs";

type PhotonFeature = {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    suburb?: string;
    district?: string;
    county?: string;
    locality?: string;
    state_district?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
};

function formatLabel(feature: PhotonFeature) {
  const properties = feature.properties;

  if (!properties) {
    return null;
  }

  const streetLine = [properties.housenumber, properties.street].filter(Boolean).join(" ");
  const parts = [
    properties.name,
    streetLine,
    properties.city,
    properties.state,
    properties.postcode,
    properties.country,
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || "5"), 1), 8);

  if (query.length < 3) {
    return NextResponse.json({ suggestions: [] });
  }

  const response = await fetch(`https://photon.komoot.io/api/?limit=${limit}&q=${encodeURIComponent(query)}`, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Unable to fetch address suggestions." }, { status: 502 });
  }

  const payload = (await response.json()) as { features?: PhotonFeature[] };
  const suggestions = (payload.features || [])
    .map((feature) => {
      const coordinates = feature.geometry?.coordinates;
      const properties = feature.properties;
      const label = formatLabel(feature);
      const streetLine = [properties?.housenumber, properties?.street].filter(Boolean).join(" ");

      if (!coordinates || coordinates.length < 2 || !label || !properties) {
        return null;
      }

      return {
        label,
        lat: coordinates[1],
        lng: coordinates[0],
        addressLine1: streetLine || properties.name || "",
        addressLine2: properties.suburb || properties.district || properties.locality || properties.county || "",
        city: properties.city || properties.locality || properties.suburb || "",
        state: properties.state || properties.state_district || "",
        postcode: properties.postcode || "",
        country: properties.country || "",
      };
    })
    .filter(
      (
        item,
      ): item is {
        label: string;
        lat: number;
        lng: number;
        addressLine1: string;
        addressLine2: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
      } => Boolean(item),
    );

  return NextResponse.json({ suggestions });
}