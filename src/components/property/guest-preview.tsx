"use client";

import { Eye } from "lucide-react";
import { GuestGuideTabs } from "@/components/property/guest-guide-tabs";
import { Card } from "@/components/ui/card";
import type { GuestThemePreset } from "@/lib/theme";
import type { GuideStep } from "@/types/property";

type GuestPreviewProps = {
  draft: {
    title: string;
    themePreset: GuestThemePreset;
    heroTitle: string;
    heroSubtitle: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    wifiSsid: string;
    wifiPassword: string;
    checkInTime: string;
    checkOutTime: string;
    quietHours: string;
    houseRules: string;
    parkingInfo: string;
    lockboxInstructions: string;
    lockboxCode: string;
    arrivalNotes: string;
    amenities: string;
    propertyLat: number;
    propertyLng: number;
    lockboxLat: number | null;
    lockboxLng: number | null;
    parkingLat: number | null;
    parkingLng: number | null;
    lockboxSteps: GuideStep[];
    parkingSteps: GuideStep[];
  };
}

export function GuestPreview({ draft }: GuestPreviewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Eye className="h-5 w-5 text-[var(--accent)]" />
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Guest preview</h2>
          <p className="text-sm text-slate-500">This is how the core guest experience is shaping up.</p>
        </div>
      </div>

      <Card>
        <GuestGuideTabs guide={draft} mode="preview" />
      </Card>
    </div>
  );
}