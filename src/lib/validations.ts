import type { GuestThemePreset } from "@/lib/theme";
import slugify from "slugify";
import { z } from "zod";

const guideStepSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z
    .string()
    .refine((value) => value.startsWith("/") || z.string().url().safeParse(value).success, "Invalid image path.")
    .optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
});

const stepsJsonSchema = z
  .string()
  .default("[]")
  .refine((value) => {
    try {
      const parsed = JSON.parse(value);
      return z.array(guideStepSchema).safeParse(parsed).success;
    } catch {
      return false;
    }
  }, "Invalid guide steps.");

export const propertySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  themePreset: z.enum(["coastal", "sunset", "midnight", "olive", "rosewood", "graphite", "lavender", "slate", "sand", "forest", "burgundy", "ocean"] satisfies [GuestThemePreset, ...GuestThemePreset[]]),
  slug: z
    .string()
    .min(3)
    .transform((value) => slugify(value, { lower: true, strict: true })),
  heroTitle: z.string().min(3),
  heroSubtitle: z.string().min(3),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional().or(z.literal("")),
  city: z.string().min(2),
  state: z.string().min(2),
  postcode: z.string().min(3),
  country: z.string().min(2),
  wifiSsid: z.string().min(1),
  wifiPassword: z.string().min(1),
  checkInTime: z.string().min(1),
  checkOutTime: z.string().min(1),
  quietHours: z.string().min(1),
  houseRules: z.string().min(1),
  parkingInfo: z.string().optional().or(z.literal("")),
  lockboxInstructions: z.string().optional().or(z.literal("")),
  lockboxCode: z.string().optional().or(z.literal("")),
  lockboxSteps: stepsJsonSchema,
  arrivalNotes: z.string().optional().or(z.literal("")),
  amenities: z.string().min(1),
  propertyLat: z.coerce.number(),
  propertyLng: z.coerce.number(),
  lockboxLat: z.coerce.number().optional().nullable(),
  lockboxLng: z.coerce.number().optional().nullable(),
  parkingLat: z.coerce.number().optional().nullable(),
  parkingLng: z.coerce.number().optional().nullable(),
  parkingSteps: stepsJsonSchema,
  published: z.boolean().default(true),
});

export type PropertyInput = z.infer<typeof propertySchema>;