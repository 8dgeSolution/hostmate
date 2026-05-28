import { notFound } from "next/navigation";
import { GuestGuideTabs } from "@/components/property/guest-guide-tabs";
import { parseGuideSteps } from "@/lib/utils";
import { db } from "@/lib/db";
import type { GuestThemePreset } from "@/lib/theme";

type PropertyPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;

  const property = await db.property.findUnique({
    where: { slug },
    include: {
      host: {
        select: {
          companyLogoUrl: true,
        },
      },
    },
  });

  if (!property || !property.published) {
    notFound();
  }

  const lockboxSteps = parseGuideSteps(property.lockboxSteps);
  const parkingSteps = parseGuideSteps(property.parkingSteps);

  return (
    <main style={{ height: 'calc(var(--vh, 1vh) * 100)' }} className="overflow-hidden">
      <GuestGuideTabs
        guide={{
          title: property.title,
          themePreset: property.themePreset as GuestThemePreset,
          companyLogoUrl: property.host.companyLogoUrl,
          heroTitle: property.heroTitle,
          heroSubtitle: property.heroSubtitle,
          addressLine1: property.addressLine1,
          addressLine2: property.addressLine2 ?? "",
          city: property.city,
          state: property.state,
          postcode: property.postcode,
          country: property.country,
          wifiSsid: property.wifiSsid,
          wifiPassword: property.wifiPassword,
          checkInTime: property.checkInTime,
          checkOutTime: property.checkOutTime,
          quietHours: property.quietHours,
          houseRules: property.houseRules,
          parkingInfo: property.parkingInfo ?? "",
          lockboxInstructions: property.lockboxInstructions,
          lockboxCode: property.lockboxCode ?? "",
          arrivalNotes: property.arrivalNotes ?? "",
          amenities: property.amenities,
          propertyLat: property.propertyLat,
          propertyLng: property.propertyLng,
          lockboxLat: property.lockboxLat,
          lockboxLng: property.lockboxLng,
          parkingLat: property.parkingLat,
          parkingLng: property.parkingLng,
          lockboxSteps,
          parkingSteps,
        }}
      />
    </main>
  );
}