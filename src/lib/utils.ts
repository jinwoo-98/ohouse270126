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
 */
export function slugify(text: string) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generates a smart, unique SEO-friendly alt text for product images.
 * Structure: [Name] - [Category] - [Attributes] - [Unique Suffix]
 */
export function generateProductAltText(product: any, index: number = 0) {
  if (!product) return "Nội thất cao cấp OHOUSE";
  
  // 1. Lấy phần thân (Base Text)
  let baseText = product.image_alt_text;

  if (!baseText) {
    const parts = [];
    if (product.name) parts.push(product.name);
    
    if (product.category_id) {
      const catName = product.category_id.replace(/-/g, ' ');
      parts.push(catName);
    }
    
    // Lấy thuộc tính (ưu tiên chất liệu hoặc phong cách có sẵn trong object)
    if (product.material) parts.push(product.material);
    else if (product.style) parts.push(product.style);

    baseText = parts.join(' - ');
  }

  // 2. Tạo hậu tố chống trùng lặp (Unique Suffix)
  // Giúp mỗi bức ảnh trong gallery có một alt riêng biệt dù cùng 1 sản phẩm
  const suffixes = [
    "", // Ảnh chính không cần hậu tố
    "góc nhìn nghiêng",
    "chi tiết thiết kế",
    "phối cảnh không gian",
    "cận cảnh chất liệu",
    "kích thước thực tế",
    "góc nhìn từ trên",
    "hoàn thiện bề mặt"
  ];

  const suffix = suffixes[index] || `hình ảnh số ${index + 1}`;
  
  return suffix ? `${baseText} - ${suffix}` : baseText;
}

/**
 * Generates an optimized image URL using Supabase Image Transformation.
 */
export function getOptimizedImageUrl(url: string | null | undefined, options: { width: number; height?: number; quality?: number; format?: 'webp' }) {
  if (!url || !url.includes('supabase.co')) {
    return url || '/placeholder.svg';
  }
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