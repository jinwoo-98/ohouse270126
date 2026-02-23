import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

/**
 * Converts a string to a URL-friendly slug.
 * @param text The input string.
 * @returns The slugified string.
 */
export function slugify(text: string) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize("NFD") // Normalize to decompose combined characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove all non-word chars except spaces and hyphens
    .replace(/[\s_-]+/g, "-") // Replace spaces, underscores, and multiple hyphens with a single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Generates an optimized image URL using Supabase Image Transformation.
 * @param url The original Supabase Storage public URL.
 * @param options Transformation options (width, height, quality, format).
 * @returns The transformed image URL.
 */
export function getOptimizedImageUrl(url: string | null | undefined, options: { width: number; height?: number; quality?: number; format?: 'webp' }) {
  if (!url || !url.includes('supabase.co')) {
    return url || '/placeholder.svg';
  }
  // Replace the path segment for image transformation
  // from /object/public/ to /render/image/public/
  const transformedUrl = url.replace('/object/public/', '/render/image/public/');
  
  const params = new URLSearchParams();
  params.append('width', String(options.width));
  if (options.height) {
    params.append('height', String(options.height));
  }
  params.append('quality', String(options.quality || 75));
  params.append('format', options.format || 'webp');
  
  return `${transformedUrl}?${params.toString()}`;
}