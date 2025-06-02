import { 
  sanitizeHtml, 
  sanitizeText, 
  sanitizeMarkdown, 
  sanitizeJson, 
  sanitizeSqlInput 
} from './sanitizer';
import DOMPurify from 'dompurify';

// Mock DOMPurify
jest.mock('dompurify', () => ({
  sanitize: jest.fn((content) => {
    // Simple implementation for testing
    if (typeof content !== 'string') return content;
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, 'safe:')
      .replace(/onerror=/gi, 'safe=')
      .replace(/onclick=/gi, 'safe=');
  }),
}));

describe('Sanitization utilities', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sanitizeHtml', () => {
    it('calls DOMPurify.sanitize with HTML content and options', () => {
      const html = '<p>Test</p><script>alert("xss")</script>';
      const options = { ALLOWED_TAGS: ['p'] };
      
      sanitizeHtml(html, options);
      
      expect(DOMPurify.sanitize).toHaveBeenCalledWith(html, options);
    });
    
    it('uses default options when none are provided', () => {
      const html = '<p>Test</p><script>alert("xss")</script>';
      
      sanitizeHtml(html);
      
      expect(DOMPurify.sanitize).toHaveBeenCalledWith(html, expect.any(Object));
    });
  });

  describe('sanitizeText', () => {
    it('removes all HTML tags from text', () => {
      const text = '<p>Test</p><script>alert("xss")</script>';
      
      sanitizeText(text);
      
      expect(DOMPurify.sanitize).toHaveBeenCalledWith(text, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });
    });
  });

  describe('sanitizeMarkdown', () => {
    it('sanitizes HTML within markdown', () => {
      const markdown = '# Title\n\n<script>alert("xss")</script>\n\n[Link](javascript:alert("xss"))';
      
      const result = sanitizeMarkdown(markdown);
      
      // Verify DOMPurify was called
      expect(DOMPurify.sanitize).toHaveBeenCalled();
      
      // Check that JavaScript protocols are replaced
      expect(result).not.toContain('javascript:');
    });
  });

  describe('sanitizeJson', () => {
    it('removes __proto__ and constructor keys', () => {
      const maliciousJson = {
        normal: 'data',
        __proto__: { polluted: true },
        nested: {
          constructor: { polluted: true }
        }
      };
      
      const sanitized = sanitizeJson(maliciousJson);
      
      expect(sanitized.normal).toBe('data');
      expect(sanitized.__proto__).toBeUndefined();
      expect(sanitized.nested.constructor).toBeUndefined();
    });
    
    it('preserves normal data structure', () => {
      const data = {
        id: 1,
        name: 'Test',
        nested: {
          value: 42,
          array: [1, 2, 3]
        }
      };
      
      const sanitized = sanitizeJson(data);
      
      expect(sanitized).toEqual(data);
    });
  });

  describe('sanitizeSqlInput', () => {
    it('removes SQL injection characters', () => {
      const maliciousInput = "Robert'); DROP TABLE Users;--";
      
      const sanitized = sanitizeSqlInput(maliciousInput);
      
      expect(sanitized).not.toContain("'");
      expect(sanitized).not.toContain(";");
      expect(sanitized).not.toContain("\\");
    });
  });
});