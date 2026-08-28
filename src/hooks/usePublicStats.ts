import { useQuery } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_URL;

export interface PublicStats {
  activeCampaigns: number;
  beneficiaries: number;
  donations: number;
  totalRaised: number;
  impactStories: number;
  communityComments: number;
}

export function usePublicStats() {
  return useQuery<PublicStats>({
    queryKey: ["public-stats"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/stats`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      return data.data as PublicStats;
    },
    staleTime: 5 * 60 * 1000,   // treat as fresh for 5 min
    gcTime: 10 * 60 * 1000,     // keep in cache 10 min
    refetchOnWindowFocus: false,
  });
}

/** Format a number into a compact display string, e.g. 2500 → "2,500+" */
export function fmtStat(n: number | undefined, suffix = "+"): string {
  if (n === undefined || n === null) return "…";
  if (n === 0) return "0";
  return n.toLocaleString() + suffix;
}

/** Format money compactly, e.g. 1200000 → "$1.2M" */
export function fmtMoney(n: number | undefined): string {
  if (n === undefined || n === null) return "…";
  if (n === 0) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}
