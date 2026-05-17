
"use client";
import Image from "next/image";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowDown, ArrowUp, ImageUp, LoaderCircle, MapPinned, Pencil, Plus, SquarePen, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { stringifyGuideSteps } from "@/lib/utils";
import type { GuideStep } from "@/types/property";

const LocationPicker = dynamic(
  () => import("@/components/map/location-picker").then((module) => module.LocationPicker),
  { ssr: false },
);

type StepEditorProps = {
  name: string;
  label: string;
  description: string;
  initialSteps?: GuideStep[];
  uploadCategory: string;
  propertySlug?: string;
  propertyId?: string;
  onChange?: (steps: GuideStep[]) => void;
};

function createStep(): GuideStep {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `step-${Date.now()}`,
    title: "",
    description: "",
    imageUrl: "",
    lat: null,
    lng: null,
  };
}

export function StepEditor({ name, label, description, initialSteps = [], uploadCategory, propertySlug, propertyId, onChange }: StepEditorProps) {
  const [steps, setSteps] = useState<GuideStep[]>(initialSteps.length ? initialSteps : []);
  const [uploadingStepId, setUploadingStepId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [stepDraft, setStepDraft] = useState<GuideStep | null>(null);
  const [editorTab, setEditorTab] = useState<"details" | "map">("details");
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  const serialized = useMemo(() => stringifyGuideSteps(steps), [steps]);

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  useEffect(() => {
    if (!stepDraft) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [stepDraft]);

  function updateSteps(nextSteps: GuideStep[]) {
    setSteps(nextSteps);
    onChange?.(nextSteps);
  }

  async function deleteImageUrl(url: string | null) {
    if (!url) return;

    try {
      await fetch("/api/uploads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
    } catch {
      // swallow errors; best-effort
      // console.debug("Failed to delete image");
    }
  }

  function updateStep(stepId: string, field: keyof GuideStep, value: string) {
    updateSteps(
      steps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              [field]: value,
            }
          : step,
      ),
    );
  }

  function openStepModal(step?: GuideStep) {
    const nextStep = step
      ? { ...step }
      : createStep();

    setEditingStepId(nextStep.id);
    setStepDraft(nextStep);
    setEditorTab("details");
    setError(null);
  }

  function closeStepModal() {
    setEditingStepId(null);
    setStepDraft(null);
    setUploadingStepId(null);
    setEditorTab("details");
  }

  function saveStepDraft() {
    if (!stepDraft) {
      return;
    }

    if (!stepDraft.title.trim() || !stepDraft.description.trim()) {
      setError("Each step needs a title and description.");
      return;
    }

    const exists = steps.some((step) => step.id === stepDraft.id);
    const nextSteps = exists
      ? steps.map((step) => (step.id === stepDraft.id ? { ...stepDraft } : step))
      : [...steps, { ...stepDraft }];

    updateSteps(nextSteps);
    closeStepModal();
  }

  function moveStep(stepId: string, direction: -1 | 1) {
    const currentIndex = steps.findIndex((step) => step.id === stepId);

    if (currentIndex < 0) {
      return;
    }

    const nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= steps.length) {
      return;
    }

    const reordered = [...steps];
    const [movedStep] = reordered.splice(currentIndex, 1);
    reordered.splice(nextIndex, 0, movedStep);
    updateSteps(reordered);
  }

  async function uploadStepImage(stepId: string, file: File | null) {
    if (!file) {
      return;
    }

    setError(null);
    setUploadingStepId(stepId);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", uploadCategory);

      if (propertySlug) {
        formData.append("propertySlug", propertySlug);
      }

      if (propertyId) {
        formData.append("propertyId", propertyId);
      }

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { error?: string; url?: string };

      if (!response.ok || !payload.url) {
        setError(payload.error || "Unable to upload image.");
        return;
      }
      // capture previous url to delete after successful upload
      const previousUrl = stepDraft && stepDraft.id === stepId ? stepDraft.imageUrl : steps.find(s => s.id === stepId)?.imageUrl ?? null;

      if (stepDraft && stepDraft.id === stepId) {
        setStepDraft({
          ...stepDraft,
          imageUrl: payload.url,
        });
      } else {
        updateStep(stepId, "imageUrl", payload.url);
      }

      // Best-effort: delete previous asset if it exists and differs from new one
      if (previousUrl && previousUrl !== payload.url) {
        void deleteImageUrl(previousUrl);
      }
    } catch {
      setError("Unable to upload image.");
    } finally {
      setUploadingStepId(null);
    }
  }


  return (
    <div className="space-y-4 rounded-[1.5rem] border border-[var(--line)] bg-white/70 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{label}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <Button type="button" variant="secondary" onClick={() => openStepModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Add step
        </Button>
      </div>

      {steps.length ? (
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="rounded-[1.5rem] border border-[var(--line)] bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Step {index + 1}</div>
                  <div className="mt-1 text-sm font-medium text-slate-900">{step.title || `Untitled step ${index + 1}`}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => moveStep(step.id, -1)}
                    disabled={index === 0}
                    aria-label={`Move step ${index + 1} up`}
                    title="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => moveStep(step.id, 1)}
                    disabled={index === steps.length - 1}
                    aria-label={`Move step ${index + 1} down`}
                    title="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] text-slate-600 transition hover:bg-slate-50"
                    onClick={() => openStepModal(step)}
                    aria-label={`Edit step ${index + 1}`}
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => updateSteps(steps.filter((item) => item.id !== step.id))}
                    aria-label={`Remove step ${index + 1}`}
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-500">
          No guided steps yet. Add steps to show guests exactly how to reach this location.
        </p>
      )}

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {stepDraft && portalRoot
        ? createPortal(
            <div className="fixed inset-0 z-[1000] bg-slate-950/45 p-0 backdrop-blur-sm sm:p-4">
              <div className="flex min-h-full items-stretch justify-center sm:items-center">
                <div className="flex h-screen w-full flex-col bg-[var(--card)] shadow-[0_30px_120px_rgba(15,23,42,0.28)] sm:h-[min(90vh,780px)] sm:max-w-4xl sm:rounded-[2rem] sm:border sm:border-[var(--line)]">
                  <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-4 py-4 sm:px-6 sm:py-5">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</div>
                      <h4 className="mt-2 text-xl font-semibold text-slate-900">{editingStepId && steps.some((step) => step.id === editingStepId) ? "Edit step" : "Add step"}</h4>
                      <p className="mt-1 text-sm text-slate-500">Edit one piece at a time without a long scrolling modal.</p>
                    </div>
                    <button type="button" className="rounded-full border border-[var(--line)] p-2 text-slate-500 transition hover:bg-white hover:text-slate-900" onClick={closeStepModal}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-3 sm:px-6">
                    <button
                      type="button"
                      className={`inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${editorTab === "details" ? "bg-[var(--accent)] text-white shadow-lg" : "bg-white text-slate-700 hover:bg-slate-50"}`}
                      onClick={() => setEditorTab("details")}
                      aria-label="Step details"
                    >
                      <SquarePen className="h-4 w-4" />
                      <span className="hidden sm:inline">Details</span>
                    </button>
                    <button
                      type="button"
                      className={`inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${editorTab === "map" ? "bg-[var(--accent)] text-white shadow-lg" : "bg-white text-slate-700 hover:bg-slate-50"}`}
                      onClick={() => setEditorTab("map")}
                      aria-label="Step map"
                    >
                      <MapPinned className="h-4 w-4" />
                      <span className="hidden sm:inline">Map</span>
                    </button>
                  </div>

                  <div className="min-h-0 flex-1 px-4 py-4 sm:px-6 sm:py-5">
                    {editorTab === "details" ? (
                      <div className="grid h-full gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                        <div className="space-y-4 rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-4 sm:p-5">
                          <Input
                            placeholder="Step title"
                            value={stepDraft.title}
                            onChange={(event) => setStepDraft({ ...stepDraft, title: event.target.value })}
                          />
                          <Textarea
                            placeholder="What should the guest do at this step?"
                            value={stepDraft.description}
                            onChange={(event) => setStepDraft({ ...stepDraft, description: event.target.value })}
                            className="min-h-[180px]"
                          />
                          <div className="rounded-[1.25rem] border border-dashed border-[var(--line)] bg-slate-50/80 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <div className="text-sm font-medium text-slate-900">Step image</div>
                                <div className="text-sm text-slate-500">Optional photo to help guests identify the step.</div>
                              </div>
                              {stepDraft.imageUrl ? (
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-slate-800"
                                  onClick={async () => {
                                    const prev = stepDraft.imageUrl;
                                    setStepDraft({ ...stepDraft, imageUrl: "" });
                                    if (prev) await deleteImageUrl(prev);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                  Remove
                                </button>
                              ) : null}
                            </div>
                            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                              {uploadingStepId === stepDraft.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />}
                              {uploadingStepId === stepDraft.id ? "Uploading..." : "Upload image"}
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/gif"
                                className="hidden"
                                onChange={(event) => {
                                  void uploadStepImage(stepDraft.id, event.target.files?.[0] ?? null);
                                  event.currentTarget.value = "";
                                }}
                                disabled={uploadingStepId === stepDraft.id}
                              />
                            </label>
                          </div>
                        </div>
                        <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-3 sm:p-4">
                          {stepDraft.imageUrl ? (
                            <Image src={stepDraft.imageUrl} alt={stepDraft.title || "Step preview"} className="h-full max-h-[320px] w-full rounded-2xl object-cover" width={480} height={320} />
                          ) : (
                            <div className="flex h-full min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-[var(--line)] bg-slate-50 text-sm text-slate-500">
                              Image preview appears here.
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {editorTab === "map" ? (
                      <LocationPicker
                        label="Step map point"
                        latName={`${name}-${stepDraft.id}-lat`}
                        lngName={`${name}-${stepDraft.id}-lng`}
                        defaultLat={stepDraft.lat ?? null}
                        defaultLng={stepDraft.lng ?? null}
                        searchPlaceholder="Search step location"
                        mapHeightClass="h-[220px] sm:h-[300px]"
                        onChange={(value) => {
                          setStepDraft({
                            ...stepDraft,
                            lat: value?.[0] ?? null,
                            lng: value?.[1] ?? null,
                          });
                        }}
                      />
                    ) : null}
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t border-[var(--line)] px-4 py-4 sm:flex-row sm:justify-end sm:px-6 sm:py-5">
                    <Button type="button" variant="secondary" onClick={closeStepModal}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={saveStepDraft}>
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>,
            portalRoot,
          ) : null}

      <input type="hidden" name={name} value={serialized} readOnly />
    </div>
  );
}