import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_BASE = import.meta.env.VITE_API_URL || '';
const SERVER_URL = API_BASE.replace('/api/v1', '');

/**
 * Symbol for a currency code. Amounts carry their own currency, so a hardcoded
 * "$" in front of one renders KES 35,000 as "$35,000 KES" — which reads as
 * dollars or shillings depending on which half you believe.
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  KES: "KSh\u00a0",
  EUR: "\u20ac",
  GBP: "\u00a3",
};

export function getCurrencySymbol(currency?: string | null): string {
  const code = currency?.trim().toUpperCase();
  if (!code) return "";
  return CURRENCY_SYMBOLS[code] ?? `${code}\u00a0`;
}

/** Formats an amount with the symbol belonging to its own currency. */
export function formatMoney(amount: number | string | null | undefined, currency?: string | null): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  const safe = Number.isFinite(value as number) ? (value as number) : 0;
  return `${getCurrencySymbol(currency)}${safe.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

/** Neutral profile silhouette, for a person with no photo of their own. */
export const PLACEHOLDER_AVATAR = "/placeholder-avatar.svg";

/**
 * Image URL for a person (beneficiary, storyteller, commenter). Falls back to
 * the silhouette rather than the generic image placeholder, so a record with
 * no photo still reads as a person.
 */
export function getAvatarUrl(path: string | undefined): string {
  return getImageUrl(path, PLACEHOLDER_AVATAR);
}

/**
 * Swaps in the silhouette when a person's image fails to load — a deleted or
 * expired remote URL would otherwise render as a broken image.
 */
export function handleAvatarError(event: React.SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;
  if (img.src.endsWith(PLACEHOLDER_AVATAR)) return;
  img.src = PLACEHOLDER_AVATAR;
}

export function getImageUrl(path: string | undefined, placeholder: string = "/placeholder.jpg"): string {
  if (!path) return placeholder;

  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }

  // Ensure the path starts with / if it doesn't
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // If path starts with /images/, it's a static frontend asset (public folder)
  if (normalizedPath.startsWith('/images/')) {
    return normalizedPath;
  }

  return `${SERVER_URL}${normalizedPath}`;
}
