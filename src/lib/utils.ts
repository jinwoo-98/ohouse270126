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
 * Structure: [Name] - [Category] - [Attribute/Variant] - [Index]
 */
export function generateProductAltText(product: any, index: number = 0) {
  if (!product) return "Nội thất cao cấp OHOUSE";
  
  const parts = [];

  // 1. Tên sản phẩm
  if (product.name) parts.push(product.name);
  
  // 2. Danh mục (Làm sạch slug)
  if (product.category_id) {
    const catName = product.category_id.replace(/-/g, ' ');
    parts.push(catName);
  }
  
  // 3. Thuộc tính hoặc Phân loại
  let attrPart = "";
  if (product.material) {
    attrPart = product.material;
  } else if (product.style) {
    attrPart = product.style;
  } else if (product.tier_variants_config && Array.isArray(product.tier_variants_config)) {
    // Nếu không có thuộc tính tĩnh, lấy tên các nhóm phân loại (VD: Màu sắc, Kích thước)
    attrPart = product.tier_variants_config.map((t: any) => t.name).join(", ");
  }
  
  if (attrPart) parts.push(attrPart);

  // Kết hợp các phần bằng dấu gạch ngang
  const baseText = parts.join(' - ');

  // 4. Số thứ tự (Bắt đầu từ 1)
  return `${baseText} - ${index + 1}`.trim();
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