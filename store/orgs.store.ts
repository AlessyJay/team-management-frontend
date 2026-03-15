import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Org } from "@/types/orgs.types";

interface OrgState {
  activeOrg: Org | null;
  setActiveOrg: (org: Org | null) => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      activeOrg: null,
      setActiveOrg: (org) => set({ activeOrg: org }),
    }),
    { name: "active-org" },
  ),
);
