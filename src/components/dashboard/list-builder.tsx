"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMultilineList, stringifyTextList } from "@/lib/utils";

type ListBuilderProps = {
  name: string;
  label: string;
  description: string;
  emptyMessage: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export function ListBuilder({ name, label, description, emptyMessage, placeholder, value, onChange }: ListBuilderProps) {
  const [draft, setDraft] = useState("");
  const items = useMemo(() => formatMultilineList(value), [value]);

  function addItem() {
    const nextValue = draft.trim();

    if (!nextValue) {
      return;
    }

    onChange(stringifyTextList([...items, nextValue]));
    setDraft("");
  }

  function removeItem(itemToRemove: string) {
    onChange(stringifyTextList(items.filter((item) => item !== itemToRemove)));
  }

  return (
    <div className="space-y-4 rounded-[1.5rem] border border-[var(--line)] bg-white/70 p-5">
      <div>
        <h3 className="text-base font-semibold text-slate-900">{label}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input value={draft} placeholder={placeholder} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            addItem();
          }
        }} />
        <Button type="button" onClick={addItem} className="sm:self-start">
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      {items.length ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item} className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-slate-700">
              <span className="leading-6">{item}</span>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-1 text-sm text-rose-600 transition hover:text-rose-700"
                onClick={() => removeItem(item)}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-500">{emptyMessage}</p>
      )}

      <input type="hidden" name={name} value={value} readOnly />
    </div>
  );
}