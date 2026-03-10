const ACCENTS = [
  {
    color: "#6366f1",
    bg: "rgba(99,102,241,0.07)",
    glow: "rgba(99,102,241,0.25)",
  },
  {
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.07)",
    glow: "rgba(139,92,246,0.25)",
  },
  {
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.07)",
    glow: "rgba(6,182,212,0.25)",
  },
  {
    color: "#10b981",
    bg: "rgba(16,185,129,0.07)",
    glow: "rgba(16,185,129,0.25)",
  },
  {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.07)",
    glow: "rgba(245,158,11,0.25)",
  },
  {
    color: "#f43f5e",
    bg: "rgba(244,63,94,0.07)",
    glow: "rgba(244,63,94,0.25)",
  },
  {
    color: "#0ea5e9",
    bg: "rgba(14,165,233,0.07)",
    glow: "rgba(14,165,233,0.25)",
  },
  {
    color: "#f97316",
    bg: "rgba(249,115,22,0.07)",
    glow: "rgba(249,115,22,0.25)",
  },
];

export function getAccent(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return ACCENTS[Math.abs(hash) % ACCENTS.length];
}
