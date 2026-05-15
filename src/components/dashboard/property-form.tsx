"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CarFront, ExternalLink, KeyRound } from "lucide-react";
import { ListBuilder } from "@/components/dashboard/list-builder";
import { GuestPreview } from "@/components/property/guest-preview";
import { StepEditor } from "@/components/dashboard/step-editor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { guestThemePresets, type GuestThemePreset } from "@/lib/theme";
import { parseGuideSteps, stringifyGuideSteps } from "@/lib/utils";
import type { GuideStep } from "@/types/property";

const LocationPicker = dynamic(
  () => import("@/components/map/location-picker").then((module) => module.LocationPicker),
  { ssr: false },
);

type PropertyFormValues = {
  id?: string;
  title?: string;
  themePreset?: GuestThemePreset;
  slug?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  wifiSsid?: string;
  wifiPassword?: string;
  checkInTime?: string;
  checkOutTime?: string;
  quietHours?: string;
  houseRules?: string;
  parkingInfo?: string | null;
  lockboxInstructions?: string;
  lockboxCode?: string | null;
  arrivalNotes?: string | null;
  amenities?: string;
  propertyLat?: number;
  propertyLng?: number;
  lockboxLat?: number | null;
  lockboxLng?: number | null;
  parkingLat?: number | null;
  parkingLng?: number | null;
  lockboxSteps?: string | null;
  parkingSteps?: string | null;
  published?: boolean;
};

type PropertyFormProps = {
  property?: PropertyFormValues;
};

type AddressSuggestion = {
  label: string;
  lat: number;
  lng: number;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
};

export function PropertyForm({ property }: PropertyFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [activeStepTab, setActiveStepTab] = useState<"lockbox" | "parking">("lockbox");
  const addressAutocompleteRef = useRef<HTMLDivElement | null>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [activeAddressSuggestionIndex, setActiveAddressSuggestionIndex] = useState(-1);

  const initialDraft = useMemo(
    () => ({
      title: property?.title ?? "",
      themePreset: property?.themePreset ?? "coastal",
      slug: property?.slug ?? "",
      heroTitle: property?.heroTitle ?? "",
      heroSubtitle: property?.heroSubtitle ?? "",
      addressLine1: property?.addressLine1 ?? "",
      addressLine2: property?.addressLine2 ?? "",
      city: property?.city ?? "",
      state: property?.state ?? "",
      postcode: property?.postcode ?? "",
      country: property?.country ?? "Australia",
      wifiSsid: property?.wifiSsid ?? "",
      wifiPassword: property?.wifiPassword ?? "",
      checkInTime: property?.checkInTime ?? "",
      checkOutTime: property?.checkOutTime ?? "",
      quietHours: property?.quietHours ?? "",
      houseRules: property?.houseRules ?? "",
      parkingInfo: property?.parkingInfo ?? "",
      lockboxInstructions: property?.lockboxInstructions ?? "",
      lockboxCode: property?.lockboxCode ?? "",
      arrivalNotes: property?.arrivalNotes ?? "",
      amenities: property?.amenities ?? "",
      propertyLat: property?.propertyLat ?? -33.8688,
      propertyLng: property?.propertyLng ?? 151.2093,
      lockboxLat: property?.lockboxLat ?? null,
      lockboxLng: property?.lockboxLng ?? null,
      parkingLat: property?.parkingLat ?? null,
      parkingLng: property?.parkingLng ?? null,
      lockboxSteps: parseGuideSteps(property?.lockboxSteps),
      parkingSteps: parseGuideSteps(property?.parkingSteps),
      published: property?.published ?? true,
    }),
    [property],
  );

  const [draft, setDraft] = useState(initialDraft);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!addressAutocompleteRef.current?.contains(event.target as Node)) {
        setShowAddressSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const query = draft.addressLine1.trim();

    if (query.length < 3) {
      setAddressSuggestions([]);
      setActiveAddressSuggestionIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/geocode/autocomplete?q=${encodeURIComponent(query)}&limit=5`, {
          signal: controller.signal,
        });

        const payload = (await response.json()) as { suggestions?: AddressSuggestion[]; error?: string };

        if (!response.ok) {
          setAddressSuggestions([]);
          return;
        }

        setAddressSuggestions(payload.suggestions ?? []);
        setActiveAddressSuggestionIndex(-1);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }

        setAddressSuggestions([]);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [draft.addressLine1]);

  function setField<K extends keyof typeof draft>(field: K, value: (typeof draft)[K]) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function applyAddressSuggestion(suggestion: AddressSuggestion) {
    setDraft((current) => ({
      ...current,
      addressLine1: suggestion.addressLine1 || current.addressLine1,
      addressLine2: suggestion.addressLine2,
      city: suggestion.city || current.city,
      state: suggestion.state || current.state,
      postcode: suggestion.postcode || current.postcode,
      country: suggestion.country || current.country,
      propertyLat: suggestion.lat,
      propertyLng: suggestion.lng,
    }));
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
    setActiveAddressSuggestionIndex(-1);
  }

  function setGuideSteps(field: "lockboxSteps" | "parkingSteps", steps: GuideStep[]) {
    setDraft((current) => ({
      ...current,
      [field]: steps,
    }));
  }

  async function submit(formData: FormData) {
    setError(null);

    const payload = {
      id: property?.id,
      title: String(formData.get("title") || ""),
      themePreset: String(formData.get("themePreset") || "coastal"),
      slug: String(formData.get("slug") || ""),
      heroTitle: String(formData.get("heroTitle") || ""),
      heroSubtitle: String(formData.get("heroSubtitle") || ""),
      addressLine1: String(formData.get("addressLine1") || ""),
      addressLine2: String(formData.get("addressLine2") || ""),
      city: String(formData.get("city") || ""),
      state: String(formData.get("state") || ""),
      postcode: String(formData.get("postcode") || ""),
      country: String(formData.get("country") || ""),
      wifiSsid: String(formData.get("wifiSsid") || ""),
      wifiPassword: String(formData.get("wifiPassword") || ""),
      checkInTime: String(formData.get("checkInTime") || ""),
      checkOutTime: String(formData.get("checkOutTime") || ""),
      quietHours: String(formData.get("quietHours") || ""),
      houseRules: draft.houseRules,
      parkingInfo: "",
      lockboxInstructions: "",
      lockboxCode: String(formData.get("lockboxCode") || ""),
      lockboxSteps: stringifyGuideSteps(draft.lockboxSteps),
      arrivalNotes: String(formData.get("arrivalNotes") || ""),
      amenities: draft.amenities,
      propertyLat: draft.propertyLat,
      propertyLng: draft.propertyLng,
      lockboxLat: draft.lockboxLat,
      lockboxLng: draft.lockboxLng,
      parkingLat: draft.parkingLat,
      parkingLng: draft.parkingLng,
      parkingSteps: stringifyGuideSteps(draft.parkingSteps),
      published: formData.get("published") === "on",
    };

    const response = await fetch("/api/properties", {
      method: property?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error || "Unable to save property.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  const propertyAddressSuggestion = [draft.addressLine1, draft.addressLine2, draft.city, draft.state, draft.postcode, draft.country]
    .filter(Boolean)
    .join(", ");

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          await submit(formData);
        })
      }
      className="space-y-6"
    >
      <Card className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-xl font-semibold text-slate-900">Property overview</h2>
          <p className="text-sm text-slate-600">
            Build the guest-facing guide, then publish it with a unique link per property.
          </p>
        </div>
        <Input name="title" placeholder="Property title" defaultValue={property?.title} required onChange={(event) => setField("title", event.target.value)} />
        <Input name="slug" placeholder="Unique guest URL slug" defaultValue={property?.slug} required onChange={(event) => setField("slug", event.target.value)} />
        <input type="hidden" name="themePreset" value={draft.themePreset} readOnly />
        <Input name="heroTitle" placeholder="Hero headline" defaultValue={property?.heroTitle} required onChange={(event) => setField("heroTitle", event.target.value)} />
        <Input name="heroSubtitle" placeholder="Hero subheading" defaultValue={property?.heroSubtitle} required onChange={(event) => setField("heroSubtitle", event.target.value)} />
        <div className="space-y-3 lg:col-span-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Guest guide colour scheme</h3>
            <p className="mt-1 text-sm text-slate-500">Choose a restrained preset palette for the public guest guide.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {Object.entries(guestThemePresets).map(([key, preset]) => {
              const isActive = draft.themePreset === key;

              return (
                <button
                  key={key}
                  type="button"
                  className={`rounded-[1rem] border px-3 py-2 text-left transition ${isActive ? "border-slate-900 bg-slate-50 shadow-[0_10px_25px_rgba(15,23,42,0.08)]" : "border-[var(--line)] bg-white/70 hover:bg-white"}`}
                  onClick={() => setField("themePreset", key as GuestThemePreset)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="h-5 w-5 rounded-full ring-1 ring-black/5" style={{ backgroundColor: preset.accent }} />
                      <span className="h-5 w-5 rounded-full ring-1 ring-black/5" style={{ backgroundColor: preset.accentSoft }} />
                      <span className="h-5 w-5 rounded-full ring-1 ring-black/5" style={{ backgroundColor: preset.accentStrong }} />
                    </div>
                    {isActive ? <span className="h-2.5 w-2.5 rounded-full bg-slate-900" /> : null}
                  </div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">{preset.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <Card className="grid gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-slate-900">Arrival details</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
          <Input name="checkInTime" placeholder="Check-in time" defaultValue={property?.checkInTime} required onChange={(event) => setField("checkInTime", event.target.value)} />
          <Input name="checkOutTime" placeholder="Check-out time" defaultValue={property?.checkOutTime} required onChange={(event) => setField("checkOutTime", event.target.value)} />
          <Input name="quietHours" placeholder="Quiet hours" defaultValue={property?.quietHours} required onChange={(event) => setField("quietHours", event.target.value)} />
        </div>
        <Input name="lockboxCode" placeholder="Lockbox code" defaultValue={property?.lockboxCode ?? ""} onChange={(event) => setField("lockboxCode", event.target.value)} />
        <Textarea name="arrivalNotes" placeholder="Extra arrival notes" defaultValue={property?.arrivalNotes ?? ""} onChange={(event) => setField("arrivalNotes", event.target.value)} className="lg:col-span-2" />
      </Card>

      <Card className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Arrival step guides</h2>
            <p className="mt-1 text-sm text-slate-500">Switch between lockbox and parking without making the page overly long.</p>
          </div>
          <div className="grid gap-2 rounded-[1.5rem] border border-[var(--line)] bg-white/70 p-2 sm:flex sm:gap-3 sm:overflow-x-auto">
            <button
              type="button"
              className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition sm:shrink-0 ${
                activeStepTab === "lockbox" ? "bg-[var(--accent)] text-white shadow-lg" : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => setActiveStepTab("lockbox")}
            >
              <KeyRound className="h-4 w-4" />
              Lockbox steps
            </button>
            <button
              type="button"
              className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition sm:shrink-0 ${
                activeStepTab === "parking" ? "bg-[var(--accent)] text-white shadow-lg" : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => setActiveStepTab("parking")}
            >
              <CarFront className="h-4 w-4" />
              Parking steps
            </button>
          </div>
        </div>

        {activeStepTab === "lockbox" ? (
          <StepEditor
            name="lockboxSteps"
            label="Lockbox steps"
            description="Add step titles, open a modal to edit the details, and place a map point for each step."
            initialSteps={draft.lockboxSteps}
            uploadCategory="lockbox"
            propertySlug={draft.slug || draft.title}
            propertyId={property?.id}
            onChange={(steps) => setGuideSteps("lockboxSteps", steps)}
          />
        ) : null}

        {activeStepTab === "parking" ? (
          <StepEditor
            name="parkingSteps"
            label="Parking steps"
            description="Add parking step titles, then edit details and map points inside the modal."
            initialSteps={draft.parkingSteps}
            uploadCategory="parking"
            propertySlug={draft.slug || draft.title}
            propertyId={property?.id}
            onChange={(steps) => setGuideSteps("parkingSteps", steps)}
          />
        ) : null}
      </Card>

      <Card className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">House information</h2>
          <p className="mt-1 text-sm text-slate-500">Keep the essentials clean and easy to scan for guests.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4 rounded-[1.5rem] border border-[var(--line)] bg-white/70 p-5">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Address</h3>
              <p className="mt-1 text-sm text-slate-500">This is shown in the general information tab for guests.</p>
            </div>
            <div className="relative" ref={addressAutocompleteRef}>
              <Input
                name="addressLine1"
                placeholder="Address line 1"
                value={draft.addressLine1}
                required
                onChange={(event) => {
                  setField("addressLine1", event.target.value);
                  setShowAddressSuggestions(true);
                }}
                onFocus={() => setShowAddressSuggestions(true)}
                onKeyDown={(event) => {
                  if (!showAddressSuggestions || !addressSuggestions.length) {
                    return;
                  }

                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActiveAddressSuggestionIndex((current) => (current + 1) % addressSuggestions.length);
                  }

                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActiveAddressSuggestionIndex((current) => (current <= 0 ? addressSuggestions.length - 1 : current - 1));
                  }

                  if (event.key === "Enter") {
                    event.preventDefault();

                    if (activeAddressSuggestionIndex >= 0 && addressSuggestions[activeAddressSuggestionIndex]) {
                      applyAddressSuggestion(addressSuggestions[activeAddressSuggestionIndex]);
                    }
                  }

                  if (event.key === "Escape") {
                    setShowAddressSuggestions(false);
                    setActiveAddressSuggestionIndex(-1);
                  }
                }}
              />
              {showAddressSuggestions && addressSuggestions.length ? (
                <div className="absolute z-[500] mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-[var(--line)] bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.14)]">
                  {addressSuggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.label}-${suggestion.lat}-${suggestion.lng}`}
                      type="button"
                      className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition ${index === activeAddressSuggestionIndex ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                      onClick={() => applyAddressSuggestion(suggestion)}
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <Input name="addressLine2" placeholder="Address line 2" value={draft.addressLine2} onChange={(event) => setField("addressLine2", event.target.value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="city" placeholder="City" value={draft.city} required onChange={(event) => setField("city", event.target.value)} />
              <Input name="state" placeholder="State / Region" value={draft.state} required onChange={(event) => setField("state", event.target.value)} />
              <Input name="postcode" placeholder="Postcode" value={draft.postcode} required onChange={(event) => setField("postcode", event.target.value)} />
              <Input name="country" placeholder="Country" value={draft.country} required onChange={(event) => setField("country", event.target.value)} />
            </div>
          </div>

          <div className="space-y-4 rounded-[1.5rem] border border-[var(--line)] bg-white/70 p-5">
            <div>
              <h3 className="text-base font-semibold text-slate-900">WiFi</h3>
              <p className="mt-1 text-sm text-slate-500">Keep network details visible and easy for guests to copy.</p>
            </div>
            <Input name="wifiSsid" placeholder="WiFi SSID" defaultValue={property?.wifiSsid} required onChange={(event) => setField("wifiSsid", event.target.value)} />
            <Input name="wifiPassword" placeholder="WiFi password" defaultValue={property?.wifiPassword} required onChange={(event) => setField("wifiPassword", event.target.value)} />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <ListBuilder
            name="amenities"
            label="Amenities"
            description="Add each amenity as a separate item for a cleaner guest experience."
            emptyMessage="No amenities added yet."
            placeholder="For example: Washer and dryer"
            value={draft.amenities}
            onChange={(value) => setField("amenities", value)}
          />
          <ListBuilder
            name="houseRules"
            label="House rules"
            description="Add rules one by one so guests can scan them quickly."
            emptyMessage="No house rules added yet."
            placeholder="For example: No smoking indoors"
            value={draft.houseRules}
            onChange={(value) => setField("houseRules", value)}
          />
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Map locations</h2>
          <p className="text-sm text-slate-600">
            Pin the property, lockbox, and optional parking location for guests.
          </p>
        </div>
        <div className="grid gap-5 xl:grid-cols-3">
          <LocationPicker
            label="Property location"
            latName="propertyLat"
            lngName="propertyLng"
            defaultLat={draft.propertyLat}
            defaultLng={draft.propertyLng}
            required
            searchSuggestion={propertyAddressSuggestion}
            searchPlaceholder="Search the property address"
            onChange={(value) => {
              if (value) {
                setField("propertyLat", value[0]);
                setField("propertyLng", value[1]);
              }
            }}
          />
          <LocationPicker
            label="Lockbox location"
            latName="lockboxLat"
            lngName="lockboxLng"
            defaultLat={draft.lockboxLat}
            defaultLng={draft.lockboxLng}
            searchPlaceholder="Search lockbox location"
            onChange={(value) => {
              setField("lockboxLat", value?.[0] ?? null);
              setField("lockboxLng", value?.[1] ?? null);
            }}
          />
          <LocationPicker
            label="Parking location"
            latName="parkingLat"
            lngName="parkingLng"
            defaultLat={draft.parkingLat}
            defaultLng={draft.parkingLng}
            searchPlaceholder="Search parking location"
            onChange={(value) => {
              setField("parkingLat", value?.[0] ?? null);
              setField("parkingLng", value?.[1] ?? null);
            }}
          />
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Guest preview</h2>
            <p className="text-sm text-slate-600">Preview the guest-facing experience before you save or publish.</p>
          </div>
          {property?.slug ? (
            <Link href={`/property/${property.slug}`} target="_blank" className="inline-flex">
              <Button type="button" variant="secondary">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open saved guest page
              </Button>
            </Link>
          ) : null}
        </div>
        <GuestPreview draft={draft} />
      </Card>

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            name="published"
            defaultChecked={property?.published ?? true}
            onChange={(event) => setField("published", event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[var(--accent)] focus:ring-[var(--accent)]"
          />
          Make this property publicly viewable
        </label>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending ? "Saving..." : property?.id ? "Update property" : "Create property"}
          </Button>
        </div>
      </Card>
    </form>
  );
}