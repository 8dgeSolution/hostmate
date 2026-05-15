"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconAnchor: [12, 41],
});

type LocationPickerProps = {
  label: string;
  latName: string;
  lngName: string;
  defaultLat?: number | null;
  defaultLng?: number | null;
  required?: boolean;
  searchSuggestion?: string;
  searchPlaceholder?: string;
  mapHeightClass?: string;
  onChange?: (value: [number, number] | null) => void;
};

type LocationSuggestion = {
  label: string;
  lat: number;
  lng: number;
};

function ClickHandler({ onChange }: { onChange: (value: [number, number]) => void }) {
  useMapEvents({
    click(event) {
      onChange([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

export function LocationPicker({
  label,
  latName,
  lngName,
  defaultLat,
  defaultLng,
  required,
  searchSuggestion,
  searchPlaceholder,
  mapHeightClass,
  onChange,
}: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fallback = useMemo<[number, number]>(() => {
    if (typeof defaultLat === "number" && typeof defaultLng === "number") {
      return [defaultLat, defaultLng];
    }

    return [-33.8688, 151.2093];
  }, [defaultLat, defaultLng]);

  const [position, setPosition] = useState<[number, number]>(fallback);
  const [hasSelection, setHasSelection] = useState(required || (typeof defaultLat === "number" && typeof defaultLng === "number"));
  const [searchQuery, setSearchQuery] = useState(searchSuggestion ?? "");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const mapKey = useMemo(() => `${label}-${position[0]}-${position[1]}-${hasSelection ? "selected" : "empty"}`, [hasSelection, label, position]);

  useEffect(() => {
    if (typeof defaultLat === "number" && typeof defaultLng === "number") {
      setPosition([defaultLat, defaultLng]);
      setHasSelection(true);
    }
  }, [defaultLat, defaultLng]);

  useEffect(() => {
    if (searchSuggestion) {
      setSearchQuery(searchSuggestion);
    }
  }, [searchSuggestion]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();

    if (query.length < 3) {
      setSuggestions([]);
      setActiveSuggestionIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/geocode/autocomplete?q=${encodeURIComponent(query)}&limit=5`, {
          signal: controller.signal,
        });

        const payload = (await response.json()) as { suggestions?: LocationSuggestion[]; error?: string };

        if (!response.ok) {
          setSearchError(payload.error || "Unable to search that address right now.");
          setSuggestions([]);
          return;
        }

        setSuggestions(payload.suggestions ?? []);
        setActiveSuggestionIndex(-1);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setSearchError("Unable to search that address right now.");
        setSuggestions([]);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  function updatePosition(nextPosition: [number, number]) {
    setPosition(nextPosition);
    setHasSelection(true);
    onChange?.(nextPosition);
    setSearchError(null);
  }

  function selectSuggestion(suggestion: LocationSuggestion) {
    setSearchQuery(suggestion.label);
    updatePosition([suggestion.lat, suggestion.lng]);
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
  }

  async function searchAddress() {
    const query = searchQuery.trim();

    if (!query) {
      setSearchError("Enter an address or place name.");
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(`/api/geocode/autocomplete?q=${encodeURIComponent(query)}&limit=1`);
      const payload = (await response.json()) as { suggestions?: LocationSuggestion[]; error?: string };

      if (!response.ok) {
        setSearchError(payload.error || "Unable to search that address right now.");
        return;
      }

      const firstMatch = payload.suggestions?.[0];

      if (!firstMatch) {
        setSearchError("No location match found.");
        return;
      }

      selectSuggestion(firstMatch);
    } catch {
      setSearchError("Unable to search that address right now.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="space-y-3 rounded-[1.5rem] border border-[var(--line)] bg-white/70 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <p className="text-sm font-medium text-slate-800">{label}</p>
          <p className="text-xs text-slate-500">Search by address, or click on the map to place or adjust the marker.</p>
        </div>
        {!required ? <span className="text-xs text-slate-400">Optional</span> : null}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1" ref={containerRef}>
          <Input
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setShowSuggestions(true);
              setSearchError(null);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(event) => {
              if (!showSuggestions || !suggestions.length) {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void searchAddress();
                }
                return;
              }

              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveSuggestionIndex((current) => (current + 1) % suggestions.length);
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveSuggestionIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
              }

              if (event.key === "Enter") {
                event.preventDefault();

                if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
                  selectSuggestion(suggestions[activeSuggestionIndex]);
                  return;
                }

                void searchAddress();
              }

              if (event.key === "Escape") {
                setShowSuggestions(false);
                setActiveSuggestionIndex(-1);
              }
            }}
            placeholder={searchPlaceholder ?? "Search address or place"}
          />
          {showSuggestions && suggestions.length ? (
            <div className="absolute z-[500] mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-[var(--line)] bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.14)]">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.label}-${suggestion.lat}-${suggestion.lng}`}
                  type="button"
                  className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition ${index === activeSuggestionIndex ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                  onClick={() => selectSuggestion(suggestion)}
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <Button type="button" variant="secondary" onClick={() => void searchAddress()} disabled={isSearching}>
          <Search className="mr-2 h-4 w-4" />
          {isSearching ? "Searching..." : "Find"}
        </Button>
      </div>
      {searchError ? <p className="text-sm text-rose-600">{searchError}</p> : null}
      <div className={`${mapHeightClass ?? "h-[220px] sm:h-[280px]"} overflow-hidden rounded-[1.5rem]`}>
        <MapContainer key={mapKey} center={position} zoom={16} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <ClickHandler onChange={updatePosition} />
          {hasSelection ? <Marker position={position} icon={icon} /> : null}
        </MapContainer>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          name={latName}
          type="number"
          step="any"
          value={hasSelection ? position[0] : ""}
          onChange={(event) => {
            const value = event.target.value;

            if (!value && !required) {
              setHasSelection(false);
              onChange?.(null);
              return;
            }

            updatePosition([Number(value), position[1]]);
          }}
          required={required}
        />
        <Input
          name={lngName}
          type="number"
          step="any"
          value={hasSelection ? position[1] : ""}
          onChange={(event) => {
            const value = event.target.value;

            if (!value && !required) {
              setHasSelection(false);
              onChange?.(null);
              return;
            }

            updatePosition([position[0], Number(value)]);
          }}
          required={required}
        />
      </div>
      {!required ? (
        <button
          type="button"
          className="text-sm font-medium text-slate-500 transition hover:text-slate-800"
          onClick={() => {
            setHasSelection(false);
            onChange?.(null);
          }}
        >
          Clear optional marker
        </button>
      ) : null}
    </div>
  );
}