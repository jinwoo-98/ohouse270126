import DOMPurify from 'dompurify';

/**
 * Sanitizes an HTML string to prevent XSS attacks while preserving safe tags and attributes.
 * Used before rendering content with dangerouslySetInnerHTML.
 */
export const sanitizeHtml = (html: string | null | undefined): string => {
  if (!html) return "";
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
      'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
      'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'span'
    ],
    ALLOWED_ATTR: ['href', 'name', 'target', 'src', 'alt', 'title', 'class', 'style', 'id'],
  });
};