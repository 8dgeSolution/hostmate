
"use client";
import Image from "next/image";

import { useRef, useState, useTransition } from "react";
import { Building2, ImageUp, LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type BrandingSettingsProps = {
  currentLogoUrl: string | null;
};

export function BrandingSettings({ currentLogoUrl }: BrandingSettingsProps) {
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  async function saveLogo(nextLogoUrl: string | null) {
    const response = await fetch("/api/account/logo", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyLogoUrl: nextLogoUrl }),
    });

    const payload = (await response.json()) as { error?: string; companyLogoUrl?: string | null };

    if (!response.ok) {
      throw new Error(payload.error || "Unable to save logo.");
    }

    setLogoUrl(payload.companyLogoUrl ?? null);
    router.refresh();
  }

  function handleFileChange(file: File | null) {
    if (!file) {
      return;
    }

    startTransition(async () => {
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", "branding");

        const uploadResponse = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        });

        const uploadPayload = (await uploadResponse.json()) as { error?: string; url?: string };

        if (!uploadResponse.ok || !uploadPayload.url) {
          throw new Error(uploadPayload.error || "Unable to upload logo.");
        }

        await saveLogo(uploadPayload.url);
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "Unable to upload logo.");
      }
    });
  }

  function removeLogo() {
    startTransition(async () => {
      setError(null);

      try {
        await saveLogo(null);
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "Unable to remove logo.");
      }
    });
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-xl font-semibold text-slate-900">Branding</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">Upload your company logo once and it will appear on public guest guides automatically.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/heic,image/heif"
            className="hidden"
            onChange={(event) => {
              handleFileChange(event.target.files?.[0] ?? null);
              event.currentTarget.value = "";
            }}
          />
          <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={isPending}>
            {isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <ImageUp className="mr-2 h-4 w-4" />}
            {logoUrl ? "Replace logo" : "Upload logo"}
          </Button>
          {logoUrl ? (
            <Button type="button" variant="secondary" onClick={removeLogo} disabled={isPending}>
              <Trash2 className="mr-2 h-4 w-4" />
              Remove logo
            </Button>
          ) : null}
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-5">
        {logoUrl ? (
          <Image src={logoUrl} alt="Company logo preview" className="h-16 w-auto max-w-[220px] object-contain" width={220} height={64} />
        ) : (
          <p className="text-sm text-slate-500">No logo uploaded yet.</p>
        )}
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </Card>
  );
}