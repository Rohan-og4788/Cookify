import DOMPurify from "isomorphic-dompurify";

/** Sanitize user-generated HTML/text content */
export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

/** Sanitize and trim with max length */
export function sanitizeText(input: string, maxLength = 5000): string {
  return sanitizeInput(input).trim().slice(0, maxLength);
}
