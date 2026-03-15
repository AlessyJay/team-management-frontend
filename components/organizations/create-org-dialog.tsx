"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateOrgPayload } from "@/types/orgs.types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (payload: CreateOrgPayload) => Promise<void>;
  submitting: boolean;
  error: string | null;
}

const slugify = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

export function CreateOrgDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting,
  error,
}: Props) {
  const [name, setName] = useState("");
  const [manualSlug, setManualSlug] = useState("");
  const [description, setDescription] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const slug = slugManuallyEdited ? manualSlug : slugify(name);

  if (!open) return null;

  const resetForm = () => {
    setName("");
    setManualSlug("");
    setDescription("");
    setSlugManuallyEdited(false);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    await onSubmit({
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || undefined,
    });

    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#181b1f] p-6 shadow-2xl">
        <h2 className="mb-1 font-mono text-sm font-semibold text-white">
          Create Organization
        </h2>
        <p className="mb-5 font-mono text-xs text-zinc-500">
          Organizations let you group projects and invite your team.
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="font-mono text-[11px] font-medium tracking-widest text-zinc-500 uppercase">
              Name *
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Inc."
              className="border-white/10 bg-white/5 font-mono text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="font-mono text-[11px] font-medium tracking-widest text-zinc-500 uppercase">
              Slug
            </Label>
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3">
              <span className="font-mono text-xs text-zinc-600 select-none">
                org/
              </span>
              <input
                value={slug}
                onChange={(e) => {
                  setManualSlug(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  );
                  setSlugManuallyEdited(true);
                }}
                placeholder="acme-inc"
                className="flex-1 bg-transparent py-2 font-mono text-sm text-white placeholder:text-zinc-600 focus:outline-none"
              />
            </div>
            <p className="font-mono text-[10px] text-zinc-700">
              Auto-generated from name. Only lowercase letters, digits, and
              hyphens.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="font-mono text-[11px] font-medium tracking-widest text-zinc-500 uppercase">
              Description{" "}
              <span className="ml-2 text-zinc-700 normal-case">optional</span>
            </Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this organization do?"
              rows={2}
              className="w-full resize-none rounded-md border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white placeholder:text-zinc-600 focus:border-white/25 focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 font-mono text-xs text-red-400">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 font-mono text-xs"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="font-mono text-xs"
            onClick={handleSubmit}
            disabled={!name.trim() || submitting}
          >
            {submitting ? "Creating…" : "Create Organization"}
          </Button>
        </div>
      </div>
    </div>
  );
}
