
"use client";
import Image from "next/image";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Info, KeyRound, MapPinned, ParkingCircle, ShieldCheck, Wifi } from "lucide-react";
import { PropertyMapClient } from "@/components/map/property-map-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { resolveGuestTheme, type GuestThemePreset } from "@/lib/theme";
import { formatMultilineList } from "@/lib/utils";
import type { GuideStep, PopupMarkerData } from "@/types/property";

type GuideTabKey = "lockbox" | "parking" | "general";

type GuestGuideData = {
  title: string;
  themePreset: GuestThemePreset;
  companyLogoUrl?: string | null;
  heroTitle: string;
  heroSubtitle: string;
  addressLine1: string;
  addressLine2?: string;
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
  parkingInfo?: string;
  lockboxInstructions: string;
  lockboxCode?: string;
  arrivalNotes?: string;
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

type GuestGuideTabsProps = {
  guide: GuestGuideData;
  mode?: "preview" | "public";
};

const tabs = [
  { key: "lockbox" as const, label: "Lockbox", icon: KeyRound },
  { key: "parking" as const, label: "Parking", icon: ParkingCircle },
  { key: "general" as const, label: "General Info", icon: Info },
];

type StepMarkerGroup = {
  anchorIndex: number;
  position: [number, number];
  attachedSteps: GuideStep[];
  attachedIndices: number[];
};

function buildStepMarkerGroups(steps: GuideStep[]) {
  const groups: StepMarkerGroup[] = [];
  let lastGroup: StepMarkerGroup | null = null;

  steps.forEach((step, index) => {
    if (typeof step.lat === "number" && typeof step.lng === "number") {
      lastGroup = {
        anchorIndex: index,
        position: [step.lat, step.lng],
        attachedSteps: [step],
        attachedIndices: [index],
      };
      groups.push(lastGroup);
      return;
    }

    if (lastGroup) {
      lastGroup.attachedSteps.push(step);
      lastGroup.attachedIndices.push(index);
    }
  });

  return groups;
}

function StepPanel({
  title,
  code,
  steps,
  stepIndex,
  onPrev,
  onNext,
  overlay = false,
}: {
  title: string;
  code?: string;
  steps: GuideStep[];
  stepIndex: number;
  onPrev: () => void;
  onNext: () => void;
  overlay?: boolean;
}) {
  const currentStep = steps[stepIndex] ?? null;

  if (overlay) {
    return (
      <div className="absolute inset-x-3 bottom-3 z-[500] sm:bottom-5">
        <div className="mx-auto max-w-[min(100%,42rem)] rounded-[1.5rem] border border-white/50 bg-[rgba(255,252,245,0.96)] p-3 shadow-[0_20px_60px_rgba(15,23,42,0.22)] backdrop-blur sm:max-w-[34rem] sm:rounded-[1.75rem] sm:p-4">
          <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2 sm:grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] sm:gap-3">
            <Button
              type="button"
              variant="secondary"
              className="h-10 w-10 rounded-full p-0 text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.12)] disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
              onClick={onPrev}
              disabled={stepIndex === 0 || !steps.length}
              aria-label="Previous step"
            >
              <span className="text-lg font-semibold leading-none text-slate-700">&lt;</span>
            </Button>

            <div className="min-w-0">
              <div className="space-y-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</div>
                  {currentStep ? (
                    <>
                      <h3 className="mt-2 text-sm font-semibold text-slate-900 sm:text-base">{currentStep.title}</h3>
                      <p className="mt-1 text-sm leading-5 text-slate-600">{currentStep.description}</p>
                    </>
                  ) : (
                    <>
                      <h3 className="mt-2 text-sm font-semibold text-slate-900 sm:text-base">Add guided steps</h3>
                      <p className="mt-1 text-sm leading-5 text-slate-600">This section does not have guided steps yet.</p>
                    </>
                  )}
                </div>

                {code ? <div className="rounded-2xl px-3 py-2 text-sm font-medium" style={{ backgroundColor: "var(--guide-accent-soft)", color: "var(--guide-accent-strong)" }}>Code: {code}</div> : null}

                <div className="border-t border-slate-200 pt-2 text-center text-xs font-medium text-slate-500 sm:text-sm">
                  {steps.length ? `Step ${stepIndex + 1} of ${steps.length}` : "No steps added"}
                </div>
              </div>
            </div>

            <Button
              type="button"
              className="h-10 w-10 rounded-full p-0 text-white shadow-[0_10px_30px_rgba(15,23,42,0.16)] disabled:bg-slate-300 disabled:text-white/70 disabled:shadow-none"
              onClick={onNext}
              disabled={!steps.length || stepIndex >= steps.length - 1}
              aria-label="Next step"
            >
              <span className="text-lg font-semibold leading-none text-white">&gt;</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,252,245,0.96)] p-4 shadow-[0_20px_60px_rgba(15,23,42,0.1)]">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</div>
            {currentStep ? (
              <>
                <h3 className="mt-2 text-base font-semibold text-slate-900 sm:text-lg">{currentStep.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{currentStep.description}</p>
              </>
            ) : (
              <>
                <h3 className="mt-2 text-base font-semibold text-slate-900 sm:text-lg">Add guided steps</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">This section does not have guided steps yet.</p>
              </>
            )}
          </div>
        </div>

        {code ? <div className="rounded-2xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: "var(--guide-accent-soft)", color: "var(--guide-accent-strong)" }}>Code: {code}</div> : null}

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">{steps.length ? `Step ${stepIndex + 1} of ${steps.length}` : "No steps added"}</div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button
              type="button"
              variant="secondary"
              className="disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-300"
              onClick={onPrev}
              disabled={stepIndex === 0 || !steps.length}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              className="disabled:bg-slate-300 disabled:text-white/70"
              onClick={onNext}
              disabled={!steps.length || stepIndex >= steps.length - 1}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapTab({
  title,
  center,
  markers,
  code,
  steps,
  stepIndex,
  onPrev,
  onNext,
  compact = false,
}: {
  title: string;
  center: [number, number];
  markers: PopupMarkerData[];
  code?: string;
  steps: GuideStep[];
  stepIndex: number;
  onPrev: () => void;
  onNext: () => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <Card className="h-full min-h-0 overflow-hidden p-0">
        <div className="h-full min-h-0 bg-slate-100">
          <div className="relative h-full min-h-[18rem] sm:min-h-[22rem]">
            <PropertyMapClient center={center} markers={markers} />
            <StepPanel title={title} code={code} steps={steps} stepIndex={stepIndex} onPrev={onPrev} onNext={onNext} overlay />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-slate-100">
        <div className="relative h-[320px] sm:h-[620px] lg:h-[680px]">
          <PropertyMapClient center={center} markers={markers} />
          <div className="absolute inset-x-5 bottom-5 hidden sm:block">
            <StepPanel title={title} code={code} steps={steps} stepIndex={stepIndex} onPrev={onPrev} onNext={onNext} overlay />
          </div>
        </div>
        <div className="p-3 sm:hidden">
          <StepPanel title={title} code={code} steps={steps} stepIndex={stepIndex} onPrev={onPrev} onNext={onNext} />
        </div>
      </div>
    </Card>
  );
}

export function GuestGuideTabs({ guide, mode = "public" }: GuestGuideTabsProps) {
  const [activeTab, setActiveTab] = useState<GuideTabKey>("lockbox");
  const [lockboxIndex, setLockboxIndex] = useState(0);
  const [parkingIndex, setParkingIndex] = useState(0);
  const theme = resolveGuestTheme(guide.themePreset);
  const heroLogoUrl = guide.companyLogoUrl || "/brand/hostmate-logo.svg";
  const heroLogoAlt = guide.companyLogoUrl ? "Company logo" : "HostMate";

  const addressSummary = [guide.addressLine1, guide.addressLine2, guide.city, guide.state, guide.postcode, guide.country].filter(Boolean).join(", ");
  const activeLockboxStep = guide.lockboxSteps[lockboxIndex];
  const activeParkingStep = guide.parkingSteps[parkingIndex];
  const lockboxStepGroups = useMemo(() => buildStepMarkerGroups(guide.lockboxSteps), [guide.lockboxSteps]);
  const parkingStepGroups = useMemo(() => buildStepMarkerGroups(guide.parkingSteps), [guide.parkingSteps]);
  const lockboxHasStepPins = lockboxStepGroups.length > 0;
  const parkingHasStepPins = parkingStepGroups.length > 0;
  const lockboxActiveStepInGroup = lockboxStepGroups.some((group) => group.attachedIndices.includes(lockboxIndex));
  const parkingActiveStepInGroup = parkingStepGroups.some((group) => group.attachedIndices.includes(parkingIndex));
  const isPublic = mode === "public";

  const propertyMarker: PopupMarkerData = useMemo(
    () => ({
      label: guide.title || "Property",
      position: [guide.propertyLat, guide.propertyLng],
      summary: addressSummary,
      kind: "home",
    }),
    [addressSummary, guide.propertyLat, guide.propertyLng, guide.title],
  );

  const lockboxMarkers: PopupMarkerData[] = [
    {
      ...propertyMarker,
      summary:
        !lockboxHasStepPins && (typeof guide.lockboxLat !== "number" || typeof guide.lockboxLng !== "number")
          ? activeLockboxStep?.description || guide.lockboxSteps[0]?.description || addressSummary
          : addressSummary,
      imageUrl:
        !lockboxHasStepPins && (typeof guide.lockboxLat !== "number" || typeof guide.lockboxLng !== "number")
          ? activeLockboxStep?.imageUrl || guide.lockboxSteps[0]?.imageUrl
          : undefined,
    },
  ];
  lockboxStepGroups.forEach((group) => {
    const activeGroupOffset = group.attachedIndices.indexOf(lockboxIndex);
    const activeGroupStep = activeGroupOffset >= 0 ? group.attachedSteps[activeGroupOffset] : group.attachedSteps[group.attachedSteps.length - 1];

    lockboxMarkers.push({
      label: group.attachedSteps[0]?.title || `Lockbox step ${group.anchorIndex + 1}`,
      position: group.position,
      summary: activeGroupStep?.description,
      steps: group.attachedSteps,
      activeStepId: activeGroupStep?.id,
      kind: "step",
      stepNumber: group.anchorIndex + 1,
      isActive: group.attachedIndices.includes(lockboxIndex),
    });
  });
  if (typeof guide.lockboxLat === "number" && typeof guide.lockboxLng === "number") {
    lockboxMarkers.push({
      label: "Lockbox",
      position: [guide.lockboxLat, guide.lockboxLng],
      summary: guide.lockboxSteps[lockboxIndex]?.description,
      imageUrl: lockboxHasStepPins && lockboxActiveStepInGroup ? undefined : guide.lockboxSteps[lockboxIndex]?.imageUrl || guide.lockboxSteps[0]?.imageUrl,
      steps: lockboxHasStepPins && lockboxActiveStepInGroup ? undefined : guide.lockboxSteps,
      activeStepId: lockboxHasStepPins && lockboxActiveStepInGroup ? undefined : guide.lockboxSteps[lockboxIndex]?.id,
      kind: "lockbox",
      isActive: !lockboxHasStepPins || !lockboxActiveStepInGroup,
    });
  }

  const parkingMarkers: PopupMarkerData[] = [
    {
      ...propertyMarker,
      summary:
        !parkingHasStepPins && (typeof guide.parkingLat !== "number" || typeof guide.parkingLng !== "number")
          ? activeParkingStep?.description || guide.parkingSteps[0]?.description || addressSummary
          : addressSummary,
      imageUrl:
        !parkingHasStepPins && (typeof guide.parkingLat !== "number" || typeof guide.parkingLng !== "number")
          ? activeParkingStep?.imageUrl || guide.parkingSteps[0]?.imageUrl
          : undefined,
    },
  ];
  parkingStepGroups.forEach((group) => {
    const activeGroupOffset = group.attachedIndices.indexOf(parkingIndex);
    const activeGroupStep = activeGroupOffset >= 0 ? group.attachedSteps[activeGroupOffset] : group.attachedSteps[group.attachedSteps.length - 1];

    parkingMarkers.push({
      label: group.attachedSteps[0]?.title || `Parking step ${group.anchorIndex + 1}`,
      position: group.position,
      summary: activeGroupStep?.description,
      steps: group.attachedSteps,
      activeStepId: activeGroupStep?.id,
      kind: "step",
      stepNumber: group.anchorIndex + 1,
      isActive: group.attachedIndices.includes(parkingIndex),
    });
  });
  if (typeof guide.parkingLat === "number" && typeof guide.parkingLng === "number") {
    parkingMarkers.push({
      label: "Parking",
      position: [guide.parkingLat, guide.parkingLng],
      summary: guide.parkingSteps[parkingIndex]?.description,
      imageUrl: parkingHasStepPins && parkingActiveStepInGroup ? undefined : guide.parkingSteps[parkingIndex]?.imageUrl || guide.parkingSteps[0]?.imageUrl,
      steps: parkingHasStepPins && parkingActiveStepInGroup ? undefined : guide.parkingSteps,
      activeStepId: parkingHasStepPins && parkingActiveStepInGroup ? undefined : guide.parkingSteps[parkingIndex]?.id,
      kind: "parking",
      isActive: !parkingHasStepPins || !parkingActiveStepInGroup,
    });
  }

  const lockboxCenter: [number, number] = typeof activeLockboxStep?.lat === "number" && typeof activeLockboxStep?.lng === "number"
    ? [activeLockboxStep.lat, activeLockboxStep.lng]
    : typeof guide.lockboxLat === "number" && typeof guide.lockboxLng === "number"
    ? [guide.lockboxLat, guide.lockboxLng]
    : [guide.propertyLat, guide.propertyLng];
  const parkingCenter: [number, number] = typeof activeParkingStep?.lat === "number" && typeof activeParkingStep?.lng === "number"
    ? [activeParkingStep.lat, activeParkingStep.lng]
    : typeof guide.parkingLat === "number" && typeof guide.parkingLng === "number"
    ? [guide.parkingLat, guide.parkingLng]
    : [guide.propertyLat, guide.propertyLng];

  return (
    <div
      className={isPublic ? "flex h-full min-h-0 flex-col gap-3 overflow-hidden" : "space-y-6"}
      data-mode={mode}
      style={{
        ["--guide-accent" as string]: theme.accent,
        ["--guide-accent-strong" as string]: theme.accentStrong,
        ["--guide-accent-soft" as string]: theme.accentSoft,
        ["--guide-hero-from" as string]: theme.heroFrom,
        ["--guide-hero-to" as string]: theme.heroTo,
      }}
    >
      <div className={isPublic ? "shrink-0 space-y-2" : "space-y-3"}>
        <div className={`rounded-[1.75rem] text-white shadow-[0_24px_80px_rgba(15,118,110,0.22)] ${isPublic ? "p-4 sm:p-5" : "p-4 sm:rounded-[2rem] sm:p-6"}`} style={{ backgroundImage: "linear-gradient(135deg,var(--guide-hero-from),var(--guide-hero-to))" }}>
          <div className={`flex items-start gap-4 ${isPublic ? "sm:gap-5" : "sm:gap-6"}`}>
            <div className="shrink-0 pt-1">
              <Image
                src={heroLogoUrl}
                alt={heroLogoAlt}
                className={`${isPublic ? "h-12 max-w-[120px] sm:h-16 sm:max-w-[160px]" : "h-14 max-w-[140px] sm:h-20 sm:max-w-[200px]"} w-auto object-contain`}
                width={isPublic ? 160 : 200}
                height={isPublic ? 64 : 80}
              />
            </div>
            <div className="min-w-0">
              <h2 className={`${isPublic ? "text-xl sm:text-3xl" : "text-2xl sm:text-4xl"} font-semibold tracking-tight`}>{guide.heroTitle || guide.title || "Guest guide"}</h2>
              <p className={`max-w-3xl text-teal-50/90 ${isPublic ? "mt-2 text-sm leading-6" : "mt-3 text-sm leading-7 sm:text-base"}`}>{guide.heroSubtitle || "Everything your guest needs, organized into clear arrival and stay tabs."}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`shrink-0 grid gap-2 rounded-[1.5rem] border border-[var(--line)] bg-[var(--card)] p-3 ${isPublic ? "grid-cols-3" : "sm:flex sm:gap-3 sm:overflow-x-auto"}`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              className={`inline-flex items-center justify-center gap-2 rounded-full px-3 py-3 text-sm font-medium transition ${isPublic ? "sm:px-4" : "sm:shrink-0 sm:px-5"} ${
                active ? "text-white shadow-lg" : "bg-white/75 text-slate-700 hover:bg-white"
              }`}
              style={active ? { backgroundColor: "var(--guide-accent)" } : undefined}
              onClick={() => setActiveTab(tab.key)}
              aria-label={tab.label}
            >
              <Icon className="h-4 w-4" />
              <span className={isPublic ? "hidden sm:inline" : "inline"}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className={isPublic ? "min-h-0 flex-1" : ""}>
        {activeTab === "lockbox" ? (
          <MapTab
            title="Lockbox access"
            center={lockboxCenter}
            markers={lockboxMarkers}
            code={guide.lockboxCode}
            steps={guide.lockboxSteps}
            stepIndex={lockboxIndex}
            onPrev={() => setLockboxIndex((current) => Math.max(current - 1, 0))}
            onNext={() => setLockboxIndex((current) => Math.min(current + 1, Math.max(guide.lockboxSteps.length - 1, 0)))}
            compact={isPublic}
          />
        ) : null}

        {activeTab === "parking" ? (
          <MapTab
            title="Parking guidance"
            center={parkingCenter}
            markers={parkingMarkers}
            steps={guide.parkingSteps}
            stepIndex={parkingIndex}
            onPrev={() => setParkingIndex((current) => Math.max(current - 1, 0))}
            onNext={() => setParkingIndex((current) => Math.min(current + 1, Math.max(guide.parkingSteps.length - 1, 0)))}
            compact={isPublic}
          />
        ) : null}

        {activeTab === "general" ? (
        <div className={`${isPublic ? "grid h-full min-h-0 gap-4 lg:grid-cols-[0.95fr_1.05fr]" : "grid gap-6 lg:grid-cols-[0.95fr_1.05fr]"}`}>
          <Card className={`${isPublic ? "min-h-0 overflow-y-auto" : ""} space-y-5`}>
            <div className="rounded-[1.5rem] bg-white/80 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="flex items-center gap-3">
                    <MapPinned className="h-5 w-5 text-[var(--guide-accent)]" />
                    <h3 className="text-lg font-semibold text-slate-900">Address</h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{addressSummary || "Add address"}</p>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <Wifi className="h-5 w-5 text-[var(--guide-accent)]" />
                    <h3 className="text-lg font-semibold text-slate-900">WiFi</h3>
                  </div>
                  <div className="mt-3 text-sm text-slate-600">SSID: {guide.wifiSsid || "Add SSID"}</div>
                  <div className="text-sm text-slate-600">Password: {guide.wifiPassword || "Add password"}</div>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] bg-white/80 p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[var(--guide-accent)]" />
                <h3 className="text-lg font-semibold text-slate-900">Stay details</h3>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Check-in</div>
                  <div className="mt-1 text-base font-medium text-slate-900">{guide.checkInTime || "Add check-in"}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Check-out</div>
                  <div className="mt-1 text-base font-medium text-slate-900">{guide.checkOutTime || "Add check-out"}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Quiet hours</div>
                  <div className="mt-1 text-base font-medium text-slate-900">{guide.quietHours || "Add quiet hours"}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Parking</div>
                  <div className="mt-1 text-base font-medium text-slate-900">{guide.parkingInfo || "Add parking info"}</div>
                </div>
              </div>
              {guide.arrivalNotes ? <p className="mt-3 text-sm leading-6 text-slate-600">{guide.arrivalNotes}</p> : null}
            </div>
            <div className="rounded-[1.5rem] bg-white/80 p-5">
              <h3 className="text-lg font-semibold text-slate-900">Amenities</h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{guide.amenities || "Add amenities"}</p>
            </div>
          </Card>

          <Card className={isPublic ? "min-h-0 overflow-y-auto" : ""}>
            <h3 className="text-lg font-semibold text-slate-900">House rules</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              {formatMultilineList(guide.houseRules || "Add house rules").map((rule) => (
                <li key={rule} className="rounded-2xl bg-white/70 px-4 py-3">
                  {rule}
                </li>
              ))}
            </ul>
          </Card>
        </div>
        ) : null}
      </div>
    </div>
  );
}