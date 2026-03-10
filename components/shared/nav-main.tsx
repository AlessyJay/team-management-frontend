"use client";

import { useState } from "react";
import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { createProject } from "@/queries/project.query";
import Link from "next/link";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: createProject,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(`"${variables.name}" created`, {
        position: "bottom-right",
      });
      setName("");
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to create project", { position: "bottom-right" });
    },
  });

  const handleQuickCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    mutate({ name: trimmed });
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 cursor-pointer duration-200 ease-linear"
                >
                  <IconCirclePlusFilled />
                  <span>Quick Create</span>
                </SidebarMenuButton>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <p className="mb-3 text-sm font-medium">Quick create project</p>
                <div className="flex flex-col gap-2">
                  <Input
                    placeholder="Project name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleQuickCreate();
                      if (e.key === "Escape") setOpen(false);
                    }}
                    autoFocus
                    disabled={isPending}
                  />
                  <Button
                    size="sm"
                    onClick={handleQuickCreate}
                    disabled={!name.trim() || isPending}
                    className="w-full"
                  >
                    {isPending ? "Creating..." : "Create →"}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          {items.map((item, index) => (
            <Link key={index} href={item.url}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={item.title}
                  className="cursor-pointer"
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
