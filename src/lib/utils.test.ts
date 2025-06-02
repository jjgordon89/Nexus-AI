import { 
  cn, 
  debounce, 
  formatDate, 
  truncateText, 
  isValidUrl, 
  getFileExtension, 
  formatFileSize 
} from './utils';

describe('Utility functions', () => {
  describe('cn function', () => {
    it('combines class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
      expect(cn('class1', null, undefined, 'class2')).toBe('class1 class2');
      expect(cn('class1', { 'class2': true, 'class3': false })).toBe('class1 class2');
    });
  });

  describe('debounce function', () => {
    it('debounces function calls', async () => {
      jest.useFakeTimers();
      
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      // Call multiple times
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      // Function shouldn't be called yet
      expect(mockFn).not.toHaveBeenCalled();
      
      // Fast-forward time
      jest.advanceTimersByTime(100);
      
      // Now it should be called once
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      jest.useRealTimers();
    });
  });

  describe('formatDate function', () => {
    it('formats dates correctly', () => {
      const date = new Date('2023-01-01T12:00:00Z');
      const formatted = formatDate(date);
      
      // The exact format might vary by locale, but it should be a string
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('truncateText function', () => {
    it('truncates text when too long', () => {
      const longText = 'This is a very long text that should be truncated';
      const truncated = truncateText(longText, 10);
      
      expect(truncated).toBe('This is a ...');
      expect(truncated.length).toBeLessThan(longText.length);
    });
    
    it('does not truncate text when short enough', () => {
      const shortText = 'Short text';
      const result = truncateText(shortText, 20);
      
      expect(result).toBe(shortText);
    });
  });

  describe('isValidUrl function', () => {
    it('validates URLs correctly', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('ftp://files.example.com')).toBe(true);
      
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('http:/example.com')).toBe(false);
    });
  });

  describe('getFileExtension function', () => {
    it('extracts file extensions correctly', () => {
      expect(getFileExtension('document.pdf')).toBe('pdf');
      expect(getFileExtension('image.png')).toBe('png');
      expect(getFileExtension('file.name.with.multiple.dots.txt')).toBe('txt');
      expect(getFileExtension('no-extension')).toBe('');
    });
  });

  describe('formatFileSize function', () => {
    it('formats file sizes with appropriate units', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
      
      // Test decimal precision
      expect(formatFileSize(1.5 * 1024, 1)).toBe('1.5 KB');
    });
  });
});