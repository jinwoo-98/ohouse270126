import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

/**
 * Định dạng số với dấu chấm phân cách hàng nghìn (VD: 1.000.000)
 */
export function formatNumberWithDots(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const number = typeof value === 'string' ? value.replace(/\D/g, '') : Math.floor(Number(value)).toString();
  if (!number) return "";
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Chuyển chuỗi có dấu chấm về số nguyên để lưu DB
 */
export function parseNumberFromDots(value: string): string {
  return value.replace(/\./g, "").replace(/\D/g, "");
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
 */
export function generateProductAltText(product: any, index: number = 0) {
  if (!product) return "Nội thất cao cấp OHOUSE";
  
  const parts = [];
  if (product.name) parts.push(product.name);
  if (product.category_id) {
    const catName = product.category_id.replace(/-/g, ' ');
    parts.push(catName);
  }
  
  let attrPart = "";
  if (product.material) attrPart = product.material;
  else if (product.style) attrPart = product.style;
  
  if (attrPart) parts.push(attrPart);
  const baseText = parts.join(' - ');
  return `${baseText} - ${index + 1}`.trim();
}

/**
 * Generates an optimized image URL using Supabase Image Transformation.
 */
export function getOptimizedImageUrl(url: string | null | undefined, options: { width: number; height?: number; quality?: number; format?: 'webp' }) {
  if (!url) return '/placeholder.svg';
  if (!url.includes('supabase.co')) return url;
  if (!url.includes('/object/public/')) return url;

  try {
    const transformedUrl = url.replace('/object/public/', '/render/image/public/');
    const params = new URLSearchParams();
    params.append('width', String(options.width));
    if (options.height) params.append('height', String(options.height));
    params.append('quality', String(options.quality || 75));
    params.append('format', options.format || 'webp');
    
    return `${transformedUrl}?${params.toString()}`;
  } catch (e) {
    return url;
  }
}

/**
 * Sanitizes a URL to prevent XSS attacks.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return "#";
  const trimmedUrl = url.trim();
  if (/^(https?|mailto|tel):/i.test(trimmedUrl) || trimmedUrl.startsWith('/') || trimmedUrl.startsWith('#')) {
    return trimmedUrl;
  }
  return "#";
}

/**
 * GIẢI PHÁP MẠNH MẼ CHO LỖI NGẮT TỪ TIẾNG VIỆT.
 * Chèn ký tự Zero-Width Space (&#8203;) vào giữa các ký tự.
 */
const insertZeroWidthSpaces = (text: string): string => {
  return text.split('').join('&#8203;');
};

/**
 * Duyệt qua cây DOM của chuỗi HTML và xử lý các nút văn bản để chống ngắt từ.
 */
export function formatVietnameseText(htmlString: string): string {
  if (typeof DOMParser === 'undefined' || !htmlString) return htmlString;

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  const walk = (node: Node) => {
    if (node.nodeType === 3) { // Text node
      const textContent = node.textContent || '';
      if (textContent.trim().length > 0) {
        const newNode = doc.createElement('span');
        newNode.innerHTML = insertZeroWidthSpaces(textContent);
        node.parentNode?.replaceChild(newNode, node);
      }
    } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
      Array.from(node.childNodes).forEach(walk);
    }
  };

  walk(doc.body);
  return doc.body.innerHTML;
}