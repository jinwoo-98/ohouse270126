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
 * Structure: [Manual Alt or (Name - Category - Attr)] | [Short ID] - [Index]
 */
export function generateProductAltText(product: any, index: number = 0) {
  if (!product) return "Nội thất cao cấp OHOUSE";
  
  // 1. Lấy phần nội dung mô tả (Base Text)
  let baseText = product.image_alt_text;

  if (!baseText) {
    const parts = [];
    if (product.name) parts.push(product.name);
    
    if (product.category_id) {
      const catName = product.category_id.replace(/-/g, ' ');
      parts.push(catName);
    }
    
    // Lấy thuộc tính từ các trường có sẵn
    if (product.material) parts.push(product.material);
    else if (product.style) parts.push(product.style);

    baseText = parts.join(' - ');
  }

  // 2. Tạo hậu tố định danh để đảm bảo tính chính xác và duy nhất
  // Sử dụng 5 ký tự đầu của ID sản phẩm để phân biệt với các sản phẩm trùng tên
  const shortId = product.id ? product.id.toString().substring(0, 5).toUpperCase() : "";
  
  // Tạo chuỗi định danh: "Mã: ABCDE - Ảnh 1"
  const identifier = `| Mã: ${shortId} - Ảnh ${index + 1}`;
  
  return `${baseText} ${identifier}`.trim();
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