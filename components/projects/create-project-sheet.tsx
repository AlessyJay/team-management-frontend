"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createProject } from "@/queries/project.query";

interface CreateProjectSheetProps {
  trigger: React.ReactNode;
}

export function CreateProjectSheet({ trigger }: CreateProjectSheetProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: createProject,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(`"${variables.name}" created`, {
        position: "bottom-right",
      });
      setName("");
      setDescription("");
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to create project", { position: "bottom-right" });
    },
  });

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    mutate({ name: trimmedName, description: description.trim() || undefined });
  };

  const handleOpenChange = (next: boolean) => {
    if (!isPending) {
      setOpen(next);
      if (!next) {
        setName("");
        setDescription("");
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle>Create a new project</SheetTitle>
          <SheetDescription>
            Give your project a name and an optional description to get started.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 px-6 py-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="project-name"
              placeholder="e.g. Sprint Cleanup"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) handleSubmit();
              }}
              disabled={isPending}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="project-description">
              Description{" "}
              <span className="text-muted-foreground text-xs font-normal">
                optional
              </span>
            </Label>
            <textarea
              id="project-description"
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              rows={4}
              className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-20 w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <SheetFooter className="border-t px-6 py-4">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || isPending}>
            {isPending ? "Creating..." : "Create Project"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
