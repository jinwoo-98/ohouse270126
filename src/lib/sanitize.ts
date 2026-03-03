import DOMPurify from 'dompurify';

/**
 * Sanitizes an HTML string to prevent XSS attacks while preserving safe tags and attributes.
 * Also cleans up hidden characters that cause word-breaking issues in Vietnamese.
 */
export const sanitizeHtml = (html: string | null | undefined): string => {
  if (!html) return "";
  
  // 1. LỌC SẠCH KÝ TỰ ẨN VÀ KÝ TỰ ĐẶC BIỆT GÂY LỖI NGẮT DÒNG
  // \u200B-\u200D: Zero-width spaces/joiners
  // \uFEFF: BOM
  // \u00AD: Soft hyphen (thủ phạm chính gây ngắt đôi từ)
  // \u2028-\u2029: Line/Paragraph separators
  let cleanHtml = html.replace(/[\u200B-\u200D\uFEFF\u00AD\u2028\u2029]/g, '');
  
  // Thay thế non-breaking space (&nbsp;) thành space thường để trình duyệt ngắt dòng đúng quy tắc
  cleanHtml = cleanHtml.replace(/\u00A0/g, ' ');
  
  return DOMPurify.sanitize(cleanHtml, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
      'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
      'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'span'
    ],
    ALLOWED_ATTR: ['href', 'name', 'target', 'src', 'alt', 'title', 'class', 'style', 'id'],
  });
};

/**
 * Sanitizes tracking scripts to allow only necessary tags for analytics/tracking.
 */
export const sanitizeTrackingScript = (html: string | null | undefined): string => {
  if (!html) return "";
  
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['script', 'noscript', 'iframe'],
    ADD_ATTR: ['async', 'defer', 'frameborder', 'allow', 'allowfullscreen', 'target'],
    FORBID_ATTR: [
      'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 
      'onchange', 'onsubmit', 'onmouseenter', 'onmouseleave', 'onkeydown', 'onkeyup'
    ],
  });
};