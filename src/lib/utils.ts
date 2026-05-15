import { clsx, type ClassValue } from "clsx";
import type { GuideStep } from "@/types/property";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatMultilineList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function stringifyTextList(items: string[]) {
  return items
    .map((item) => item.trim())
    .filter(Boolean)
    .join("\n");
}

export function parseGuideSteps(value?: string | null): GuideStep[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as GuideStep[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((step) => typeof step?.title === "string" && typeof step?.description === "string");
  } catch {
    return [];
  }
}

export function stringifyGuideSteps(steps: GuideStep[]) {
  return JSON.stringify(
    steps.map((step, index) => ({
      id: step.id || `step-${index + 1}`,
      title: step.title.trim(),
      description: step.description.trim(),
      imageUrl: step.imageUrl?.trim() || undefined,
      lat: typeof step.lat === "number" && !Number.isNaN(step.lat) ? step.lat : null,
      lng: typeof step.lng === "number" && !Number.isNaN(step.lng) ? step.lng : null,
    })),
  );
}