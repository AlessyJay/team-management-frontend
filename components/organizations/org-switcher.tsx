"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconChevronDown,
  IconPlus,
  IconCheck,
  IconLoader2,
  IconSettings,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { useOrgStore } from "@/store/orgs.store";
import { getMyOrgs, createOrg } from "@/queries/orgs.query";
import type { Org, CreateOrgPayload } from "@/types/orgs.types";
import { CreateOrgDialog } from "./create-org-dialog";

export function OrgSwitcher() {
  const qc = useQueryClient();
  const router = useRouter();
  const { activeOrg, setActiveOrg } = useOrgStore();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: orgs = [], isLoading } = useQuery<Org[]>({
    queryKey: ["orgs"],
    queryFn: getMyOrgs,
  });

  if (!activeOrg && orgs.length > 0) {
    setActiveOrg(orgs[0]);
  }

  const createMut = useMutation({
    mutationFn: (payload: CreateOrgPayload) => createOrg(payload),
    onSuccess: (org) => {
      qc.invalidateQueries({ queryKey: ["orgs"] });
      setActiveOrg(org);
      setCreateOpen(false);
    },
  });

  const display = activeOrg ?? { name: "Personal", slug: "", id: "" };
  const initials = display.name.slice(0, 2).toUpperCase();

  console.log(activeOrg);

  return (
    <React.Fragment>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 items-center justify-center rounded-lg font-mono text-xs font-bold">
                  {isLoading ? (
                    <IconLoader2 size={14} className="animate-spin" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{display.name}</span>
                  {activeOrg && (
                    <span className="text-muted-foreground truncate text-xs">
                      {activeOrg.myRole.charAt(0) +
                        activeOrg.myRole.slice(1).toLowerCase()}
                    </span>
                  )}
                </div>
                <IconChevronDown className="ml-auto size-4 opacity-50" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side="bottom"
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Organizations
              </DropdownMenuLabel>

              {orgs.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => setActiveOrg(org)}
                  className="cursor-pointer gap-2 p-2"
                >
                  <div className="bg-muted flex size-6 items-center justify-center rounded-md border font-mono text-[10px] font-bold">
                    {org.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="flex-1 text-sm">{org.name}</span>
                  {activeOrg?.id === org.id && (
                    <IconCheck size={14} className="text-primary" />
                  )}
                </DropdownMenuItem>
              ))}

              {orgs.length === 0 && !isLoading && (
                <DropdownMenuItem
                  disabled
                  className="text-muted-foreground text-xs"
                >
                  No organizations yet
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              {activeOrg && (
                <DropdownMenuItem
                  onClick={() => router.push(`/org/${activeOrg.id}`)}
                  className="cursor-pointer gap-2 p-2"
                >
                  <div className="bg-muted flex size-6 items-center justify-center rounded-md border">
                    <IconSettings size={12} />
                  </div>
                  <span className="text-sm">Organization settings</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setCreateOpen(true)}
                className="cursor-pointer gap-2 p-2"
              >
                <div className="bg-muted flex size-6 items-center justify-center rounded-md border">
                  <IconPlus size={12} />
                </div>
                <span className="text-sm">Create organization</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateOrgDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={async (payload) => {
          await createMut.mutateAsync(payload);
        }}
        submitting={createMut.isPending}
        error={createMut.error?.message ?? null}
      />
    </React.Fragment>
  );
}
