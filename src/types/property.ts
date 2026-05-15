export type GuideStep = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  lat?: number | null;
  lng?: number | null;
};

export type PopupMarkerData = {
  label: string;
  position: [number, number];
  summary?: string;
  imageUrl?: string;
  steps?: GuideStep[];
  activeStepId?: string;
  kind?: "home" | "parking" | "lockbox" | "step";
  stepNumber?: number;
  isActive?: boolean;
};