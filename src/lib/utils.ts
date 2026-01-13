import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL;
const SERVER_URL = API_BASE.replace('/api/v1', '');

export function getImageUrl(path: string | undefined, placeholder: string = "/placeholder.jpg"): string {
  if (!path) return placeholder;

  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }

  // Ensure the path starts with / if it doesn't
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SERVER_URL}${normalizedPath}`;
}
