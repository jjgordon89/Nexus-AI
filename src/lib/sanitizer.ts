/**
 * Content sanitization utilities
 * 
 * This module provides functions for sanitizing user-generated content
 * to prevent XSS attacks and other security issues.
 */

import DOMPurify from 'dompurify';

/**
 * Options for DOMPurify configuration
 */
const DEFAULT_SANITIZE_OPTIONS = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'ul', 'ol', 'li',
    'b', 'i', 'strong', 'em', 'a', 'pre', 'code', 'hr', 'blockquote', 
    'img', 'span'
  ],
  ALLOWED_ATTR: ['href', 'target', 'class', 'id', 'alt', 'src'],
  ALLOW_DATA_ATTR: false,
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'textarea', 'select', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * 
 * @param content - The content to sanitize
 * @param options - Optional DOMPurify options
 * @returns Sanitized content
 */
export function sanitizeHtml(content: string, options = DEFAULT_SANITIZE_OPTIONS): string {
  return DOMPurify.sanitize(content, options);
}

/**
 * Sanitize plain text content
 * 
 * @param content - The text content to sanitize
 * @returns Sanitized text content
 */
export function sanitizeText(content: string): string {
  // For plain text, we strip HTML entirely
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
  });
}

/**
 * Sanitize a Markdown string
 * 
 * @param markdown - The markdown content to sanitize
 * @returns Sanitized markdown
 */
export function sanitizeMarkdown(markdown: string): string {
  // For markdown, we need to be careful not to break the syntax
  // but still prevent XSS
  
  // First, sanitize any HTML within the markdown
  let sanitized = DOMPurify.sanitize(markdown, {
    ALLOWED_TAGS: ['a', 'b', 'i', 'strong', 'em', 'code', 'pre'],
    ALLOWED_ATTR: ['href'],
  });
  
  // Additional sanitization for markdown-specific syntax
  sanitized = sanitized
    // Remove potentially dangerous URL protocols
    .replace(/\]\(javascript:/gi, '](https:')
    .replace(/\]\(data:/gi, '](https:')
    .replace(/\]\(vbscript:/gi, '](https:')
    
    // Remove HTML comments that might contain malicious code
    .replace(/<!--[\s\S]*?-->/g, '')
    
    // Escape backticks in inline code that might be used for injection
    .replace(/(`)(.*?[<>].*?)(`)/g, (match, p1, p2, p3) => 
      `${p1}${p2.replace(/</g, '&lt;').replace(/>/g, '&gt;')}${p3}`
    );
  
  return sanitized;
}

/**
 * Sanitize JSON data to prevent prototype pollution
 * 
 * @param json - The JSON object to sanitize
 * @returns Sanitized JSON object
 */
export function sanitizeJson<T>(json: T): T {
  // Prevent prototype pollution by removing __proto__ and constructor
  const sanitized = JSON.parse(
    JSON.stringify(json, (key, value) => {
      if (key === '__proto__' || key === 'constructor') {
        return undefined;
      }
      return value;
    })
  );
  
  return sanitized;
}

/**
 * Sanitize user input for database queries to prevent SQL injection
 * 
 * @param input - The input to sanitize
 * @returns Sanitized input
 */
export function sanitizeSqlInput(input: string): string {
  // Basic SQL injection prevention
  // Note: This is not a replacement for prepared statements/parameterized queries
  return input.replace(/['";\\]/g, '');
}