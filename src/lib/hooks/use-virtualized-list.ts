import { useState, useCallback, useEffect, useRef } from 'react';
import { useSettingsStore } from '../../store/settings-store';

interface UseVirtualizedListOptions {
  itemCount: number;
  defaultItemHeight?: number;
  overscanCount?: number;
  estimateItemHeight?: (index: number) => number;
}

/**
 * Custom hook for creating virtualized lists without external dependencies
 * 
 * This hook provides a lightweight virtualization solution for simple use cases
 * when a full library like react-window isn't necessary.
 */
export function useVirtualizedList({
  itemCount,
  defaultItemHeight = 150,
  overscanCount = 2,
  estimateItemHeight,
}: UseVirtualizedListOptions) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);
  const { settings } = useSettingsStore();
  const reducedMotion = settings.appearance.reducedMotion;
  
  // Helper function to estimate the height of an item
  const getItemHeight = useCallback((index: number) => {
    if (estimateItemHeight) {
      return estimateItemHeight(index);
    }
    return defaultItemHeight;
  }, [estimateItemHeight, defaultItemHeight]);
  
  // Calculate the total height of all items
  const totalHeight = useCallback(() => {
    let height = 0;
    for (let i = 0; i < itemCount; i++) {
      height += getItemHeight(i);
    }
    return height;
  }, [itemCount, getItemHeight]);
  
  // Calculate which items should be visible based on scroll position
  const calculateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;
    
    const { scrollTop, clientHeight } = containerRef.current;
    scrollPositionRef.current = scrollTop;
    
    // Find the first visible item
    let start = 0;
    let accumulatedHeight = 0;
    
    while (start < itemCount) {
      const height = getItemHeight(start);
      if (accumulatedHeight + height > scrollTop) {
        break;
      }
      accumulatedHeight += height;
      start++;
    }
    
    // Apply overscan
    start = Math.max(0, start - overscanCount);
    
    // Find the last visible item
    let end = start;
    let visibleHeight = 0;
    
    while (end < itemCount && visibleHeight < clientHeight) {
      visibleHeight += getItemHeight(end);
      end++;
    }
    
    // Apply overscan
    end = Math.min(itemCount, end + overscanCount);
    
    setVisibleRange({ start, end });
  }, [itemCount, getItemHeight, overscanCount]);
  
  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (reducedMotion) {
      // For reduced motion, update less frequently to improve performance
      requestAnimationFrame(calculateVisibleRange);
    } else {
      calculateVisibleRange();
    }
  }, [calculateVisibleRange, reducedMotion]);
  
  // Set up scroll event listener and recalculate on dependency changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', handleScroll);
    
    // Calculate initial visible range
    calculateVisibleRange();
    
    // Recalculate on resize
    const resizeObserver = new ResizeObserver(() => {
      calculateVisibleRange();
    });
    
    resizeObserver.observe(container);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [handleScroll, calculateVisibleRange]);
  
  // Scroll to a specific item
  const scrollToItem = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
    if (!containerRef.current) return;
    
    let targetPosition = 0;
    
    // Calculate position of the target item
    for (let i = 0; i < index; i++) {
      targetPosition += getItemHeight(i);
    }
    
    // Adjust based on alignment
    const itemHeight = getItemHeight(index);
    const containerHeight = containerRef.current.clientHeight;
    
    if (align === 'center') {
      targetPosition = targetPosition - (containerHeight / 2) + (itemHeight / 2);
    } else if (align === 'end') {
      targetPosition = targetPosition - containerHeight + itemHeight;
    }
    
    // Clamp to valid scroll range
    targetPosition = Math.max(0, Math.min(targetPosition, containerRef.current.scrollHeight - containerHeight));
    
    // Scroll to the position
    containerRef.current.scrollTo({
      top: targetPosition,
      behavior: reducedMotion ? 'auto' : 'smooth'
    });
    
  }, [getItemHeight, reducedMotion]);
  
  return {
    containerProps: {
      ref: containerRef,
      style: {
        overflow: 'auto',
        position: 'relative',
        height: '100%',
      },
    },
    virtualItems: Array.from({ length: visibleRange.end - visibleRange.start })
      .map((_, index) => {
        const actualIndex = visibleRange.start + index;
        return {
          index: actualIndex,
          start: Array.from({ length: actualIndex })
            .reduce((sum, _, i) => sum + getItemHeight(i), 0),
          height: getItemHeight(actualIndex),
        };
      }),
    totalHeight: totalHeight(),
    scrollToItem,
  };
}