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
 * Generates a smart, SEO-friendly alt text for product images.
 * Priority: Manual Alt Text > (Name - Category - Material/Style) > Name
 */
export function generateProductAltText(product: any) {
  if (!product) return "Nội thất cao cấp OHOUSE";
  
  // 1. Ưu tiên hàng đầu: Alt text nhập tay (Chiến lược 1)
  if (product.image_alt_text) return product.image_alt_text;

  // 2. Tự động tạo chuỗi đa dạng (Chiến lược 2)
  const parts = [];
  
  if (product.name) parts.push(product.name);
  
  if (product.category_id) {
    // Chuyển slug danh mục thành tên hiển thị đẹp hơn (VD: sofa-da -> sofa da)
    const catName = product.category_id.replace(/-/g, ' ');
    parts.push(catName);
  }
  
  if (product.material) parts.push(product.material);
  else if (product.style) parts.push(product.style);

  // Nếu có đủ thông tin thì ghép lại bằng dấu gạch ngang
  if (parts.length > 1) {
    return parts.join(' - ');
  }

  // 3. Fallback cuối cùng: Chỉ dùng tên sản phẩm
  return product.name || "Sản phẩm nội thất OHOUSE";
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