import { Projects } from "@/types/home.types";
import { differenceInDays, parseISO } from "date-fns";

export const isNewForMe = (p: Projects): boolean => {
  return differenceInDays(new Date(), parseISO(p.joinedAt)) <= 14;
};
