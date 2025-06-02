/**
 * Performance monitoring utilities
 * 
 * This module provides functions for monitoring and logging performance metrics.
 */

// Define performance mark names as constants
const MARKS = {
  APP_LOAD_START: 'app-load-start',
  APP_LOAD_END: 'app-load-end',
  MESSAGE_PROCESS_START: 'message-process-start',
  MESSAGE_PROCESS_END: 'message-process-end',
  RENDER_START: 'render-start',
  RENDER_END: 'render-end',
  FILE_PROCESS_START: 'file-process-start',
  FILE_PROCESS_END: 'file-process-end',
};

// Simple client-side performance monitoring
export const PerformanceMonitor = {
  /**
   * Start timing an operation
   */
  startMeasure(name: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(name);
    }
  },

  /**
   * End timing an operation and log the result
   */
  endMeasure(startName: string, endName: string, operationName: string): number | undefined {
    if (typeof performance !== 'undefined') {
      performance.mark(endName);
      
      try {
        // Create the measurement
        const measure = performance.measure(operationName, startName, endName);
        
        // Log if in development
        if (import.meta.env.DEV) {
          console.log(`[Performance] ${operationName}: ${measure.duration.toFixed(2)}ms`);
        }
        
        return measure.duration;
      } catch (e) {
        console.error('Performance measurement error:', e);
      }
    }
    return undefined;
  },

  /**
   * Measure app load time
   */
  measureAppLoad(): void {
    this.startMeasure(MARKS.APP_LOAD_START);
    
    window.addEventListener('load', () => {
      this.endMeasure(MARKS.APP_LOAD_START, MARKS.APP_LOAD_END, 'App Load Time');
      
      // Log navigation timing metrics
      if (performance.timing) {
        const navTiming = performance.timing;
        const pageLoadTime = navTiming.loadEventEnd - navTiming.navigationStart;
        const dnsTime = navTiming.domainLookupEnd - navTiming.domainLookupStart;
        const tcpTime = navTiming.connectEnd - navTiming.connectStart;
        const timeToFirstByte = navTiming.responseStart - navTiming.requestStart;
        const domInteractiveTime = navTiming.domInteractive - navTiming.navigationStart;
        const domContentLoadedTime = navTiming.domContentLoadedEventEnd - navTiming.navigationStart;
        
        if (import.meta.env.DEV) {
          console.group('Page Load Performance');
          console.log(`Total Page Load: ${pageLoadTime}ms`);
          console.log(`DNS Resolution: ${dnsTime}ms`);
          console.log(`TCP Connection: ${tcpTime}ms`);
          console.log(`Time to First Byte: ${timeToFirstByte}ms`);
          console.log(`DOM Interactive: ${domInteractiveTime}ms`);
          console.log(`DOM Content Loaded: ${domContentLoadedTime}ms`);
          console.groupEnd();
        }
      }
    });
  },

  /**
   * Measure message processing time
   */
  startMessageProcessing(): void {
    this.startMeasure(MARKS.MESSAGE_PROCESS_START);
  },

  endMessageProcessing(): number | undefined {
    return this.endMeasure(
      MARKS.MESSAGE_PROCESS_START,
      MARKS.MESSAGE_PROCESS_END,
      'Message Processing Time'
    );
  },

  /**
   * Measure component render time
   */
  startRenderMeasure(componentName: string): string {
    const markName = `${MARKS.RENDER_START}-${componentName}`;
    this.startMeasure(markName);
    return markName;
  },

  endRenderMeasure(startMarkName: string, componentName: string): number | undefined {
    const endMarkName = `${MARKS.RENDER_END}-${componentName}`;
    return this.endMeasure(
      startMarkName,
      endMarkName,
      `${componentName} Render Time`
    );
  },

  /**
   * Measure file processing time
   */
  startFileProcessing(): void {
    this.startMeasure(MARKS.FILE_PROCESS_START);
  },

  endFileProcessing(): number | undefined {
    return this.endMeasure(
      MARKS.FILE_PROCESS_START,
      MARKS.FILE_PROCESS_END,
      'File Processing Time'
    );
  },

  /**
   * Get performance metrics for analytics/debugging
   */
  getMetrics(): Record<string, number> {
    const metrics: Record<string, number> = {};
    
    if (typeof performance !== 'undefined') {
      // Get all performance entries
      const entries = performance.getEntriesByType('measure');
      
      // Extract metrics
      entries.forEach(entry => {
        metrics[entry.name] = entry.duration;
      });
      
      // Add memory usage if available
      if (performance.memory) {
        metrics.jsHeapSizeLimit = performance.memory.jsHeapSizeLimit;
        metrics.totalJSHeapSize = performance.memory.totalJSHeapSize;
        metrics.usedJSHeapSize = performance.memory.usedJSHeapSize;
      }
    }
    
    return metrics;
  },

  /**
   * Clear all performance marks and measures
   */
  clearMetrics(): void {
    if (typeof performance !== 'undefined') {
      performance.clearMarks();
      performance.clearMeasures();
    }
  },
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  PerformanceMonitor.measureAppLoad();
}

export default PerformanceMonitor;