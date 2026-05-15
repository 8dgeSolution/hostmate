"use client";

import dynamic from "next/dynamic";
import type { PopupMarkerData } from "@/types/property";

const PropertyMap = dynamic(() => import("@/components/map/property-map").then((module) => module.PropertyMap), {
  ssr: false,
});

type PropertyMapClientProps = {
  center: [number, number];
  markers: PopupMarkerData[];
};

export function PropertyMapClient({ center, markers }: PropertyMapClientProps) {
  return <PropertyMap center={center} markers={markers} />;
}