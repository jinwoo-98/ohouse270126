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

/**
 * Sanitizes tracking scripts to allow only necessary tags for analytics/tracking.
 * This is more permissive than sanitizeHtml as it allows <script>, <noscript>, and <iframe>,
 * but it strictly strips dangerous 'on*' event handlers to prevent XSS via attributes.
 */
export const sanitizeTrackingScript = (html: string | null | undefined): string => {
  if (!html) return "";
  
  return DOMPurify.sanitize(html, {
    // Explicitly allow tags common in tracking snippets
    ADD_TAGS: ['script', 'noscript', 'iframe'],
    // Allow attributes required for tracking functionality
    ADD_ATTR: ['async', 'defer', 'frameborder', 'allow', 'allowfullscreen', 'target'],
    // Strictly forbid any inline event handlers
    FORBID_ATTR: [
      'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 
      'onchange', 'onsubmit', 'onmouseenter', 'onmouseleave', 'onkeydown', 'onkeyup'
    ],
  });
};