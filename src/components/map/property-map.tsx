
"use client";
import Image from "next/image";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { CircleParking, House, KeyRound, MapPinned } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import type { PopupMarkerData } from "@/types/property";

const markerIconCache = new Map<string, L.DivIcon>();

function buildMarkerIcon(marker: PopupMarkerData) {
  const cacheKey = `${marker.kind ?? "default"}-${marker.stepNumber ?? "none"}-${marker.isActive ? "active" : "base"}`;

  if (markerIconCache.has(cacheKey)) {
    return markerIconCache.get(cacheKey)!;
  }

  const accentClass = marker.isActive ? "background:#0f766e;color:white;border-color:#0f766e;transform:scale(1.05);" : "background:white;color:#1f2937;border-color:rgba(15,118,110,0.24);";

  let innerMarkup = renderToStaticMarkup(<MapPinned size={18} />);

  if (marker.kind === "home") {
    innerMarkup = renderToStaticMarkup(<House size={18} />);
  }

  if (marker.kind === "parking") {
    innerMarkup = renderToStaticMarkup(<CircleParking size={18} />);
  }

  if (marker.kind === "lockbox") {
    innerMarkup = renderToStaticMarkup(<KeyRound size={18} />);
  }

  if (marker.kind === "step") {
    innerMarkup = `<span style="font:700 12px/1 system-ui,sans-serif;">${marker.stepNumber ?? "•"}</span>`;
  }

  const icon = L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:999px;border:2px solid;box-shadow:0 10px 24px rgba(15,23,42,0.18);${accentClass}">${innerMarkup}</div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -18],
  });

  markerIconCache.set(cacheKey, icon);
  return icon;
}

type PropertyMapProps = {
  center: [number, number];
  markers: PopupMarkerData[];
};

function getMarkerKey(marker: PopupMarkerData) {
  return `${marker.label}-${marker.position.join("-")}-${marker.stepNumber ?? "base"}-${marker.kind ?? "default"}`;
}

function getPopupImage(marker: PopupMarkerData) {
  if (marker.steps?.length) {
    const popupStep = marker.steps.find((step) => step.id === marker.activeStepId) ?? marker.steps.find((step) => step.imageUrl);

    if (!popupStep?.imageUrl) {
      return null;
    }

    return {
      src: popupStep.imageUrl,
      alt: popupStep.title,
    };
  }

  if (!marker.imageUrl) {
    return null;
  }

  return {
    src: marker.imageUrl,
    alt: marker.label,
  };
}

export function PropertyMap({ center, markers }: PropertyMapProps) {
  const key = useMemo(() => `${center[0]}-${center[1]}`, [center]);
  const mapRef = useRef<L.Map | null>(null);
  const markerRefs = useRef<Record<string, L.Marker | null>>({});
  const [fullscreenImage, setFullscreenImage] = useState<{ src: string; alt: string } | null>(null);
  const activePopupKey = useMemo(() => {
    const activeMarker = markers.find((marker) => marker.isActive);

    if (activeMarker) {
      return getMarkerKey(activeMarker);
    }

    const preferredMarker = markers.find((marker) => marker.kind !== "home" && (marker.imageUrl || marker.summary || marker.steps?.length));

    if (preferredMarker) {
      return getMarkerKey(preferredMarker);
    }

    return markers[0] ? getMarkerKey(markers[0]) : null;
  }, [markers]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    let cancelled = false;

    const openActivePopup = (attempt = 0) => {
      if (cancelled) {
        return;
      }

      map.invalidateSize();

      if (!activePopupKey) {
        return;
      }

      const marker = markerRefs.current[activePopupKey];

      if (!marker) {
        if (attempt < 6) {
          requestAnimationFrame(() => openActivePopup(attempt + 1));
        }
        return;
      }

      map.closePopup();
      marker.openPopup();
      const position = marker.getLatLng();
      map.setView([position.lat, position.lng], map.getZoom(), { animate: false });
    };

    requestAnimationFrame(() => openActivePopup());

    return () => {
      cancelled = true;
    };
  }, [activePopupKey, key, markers]);

  return (
    <>
      <MapContainer
        key={key}
        center={center}
        zoom={16}
        scrollWheelZoom
        className="h-full w-full"
        ref={mapRef}
        whenReady={() => {
          const map = mapRef.current;

          if (!map || !activePopupKey) {
            return;
          }

          requestAnimationFrame(() => {
            const marker = markerRefs.current[activePopupKey];

            if (!marker) {
              return;
            }

            map.invalidateSize();
            map.setView(marker.getLatLng(), map.getZoom(), { animate: false });
            marker.openPopup();
          });
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {markers.map((marker) => {
          const popupImage = getPopupImage(marker);

          return (
            <Marker
              key={getMarkerKey(marker)}
              position={marker.position}
              icon={buildMarkerIcon(marker)}
              ref={(instance) => {
                markerRefs.current[getMarkerKey(marker)] = instance;
              }}
            >
              <Popup minWidth={220}>
                <div className="space-y-3 text-sm text-slate-700">
                  {popupImage ? (
                    <button
                      type="button"
                      className="block w-full overflow-hidden rounded-xl"
                      onClick={() => setFullscreenImage(popupImage)}
                      aria-label={`Open ${popupImage.alt} image fullscreen`}
                    >
                      <Image src={popupImage.src} alt={popupImage.alt} className="h-28 w-full rounded-xl object-cover transition hover:scale-[1.02]" width={320} height={112} />
                    </button>
                  ) : null}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {fullscreenImage ? (
        <button
          type="button"
          className="absolute inset-0 z-[1200] flex items-center justify-center bg-slate-950/88 p-4"
          onClick={() => setFullscreenImage(null)}
          aria-label="Close fullscreen image"
        >
          <Image
            src={fullscreenImage.src}
            alt={fullscreenImage.alt}
            className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
            width={800}
            height={600}
          />
        </button>
      ) : null}
    </>
  );
}