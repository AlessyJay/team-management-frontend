import { Projects } from "@/types/home.types";
import { differenceInDays, parseISO } from "date-fns";

export const isUrgent = (p: Projects): boolean => {
  if (p.hasUrgentIssues) return true;
  if (p.activeSprint?.endDate) {
    const days = differenceInDays(parseISO(p.activeSprint.endDate), new Date());
    return days >= 0 && days <= 7;
  }
  return false;
};

export const urgentReason = (p: Projects): string => {
  if (p.activeSprint?.endDate) {
    const days = differenceInDays(parseISO(p.activeSprint.endDate), new Date());
    if (days >= 0 && days <= 7) return `Sprint ends in ${days}d`;
  }
  if (p.hasUrgentIssues) return "High priority issues";
  return "";
};
