'use client';

import { useEffect } from 'react';
import { trackWebVitals, monitorSEOPerformance } from '@/lib/analytics';

export function PerformanceMonitor() {
  useEffect(() => {
    // Monitor page load performance
    const startTime = performance.now();
    
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      monitorSEOPerformance.trackPageLoad(window.location.pathname, loadTime);
    };

    // Monitor Core Web Vitals
    const observeWebVitals = () => {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        trackWebVitals({
          name: 'LCP',
          value: lastEntry.startTime,
          id: 'lcp',
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEventTiming;
          trackWebVitals({
            name: 'FID',
            value: fidEntry.processingStart - fidEntry.startTime,
            id: 'fid',
          });
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          const clsEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!clsEntry.hadRecentInput) {
            clsValue += clsEntry.value || 0;
          }
        });
        trackWebVitals({
          name: 'CLS',
          value: clsValue,
          id: 'cls',
        });
      }).observe({ entryTypes: ['layout-shift'] });

      // First Contentful Paint (FCP)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          trackWebVitals({
            name: 'FCP',
            value: entry.startTime,
            id: 'fcp',
          });
        });
      }).observe({ entryTypes: ['paint'] });
    };

    // Monitor resource loading
    const observeResources = () => {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            monitorSEOPerformance.trackPageLoad(
              window.location.pathname,
              navEntry.loadEventEnd - navEntry.fetchStart
            );
          }
        });
      }).observe({ entryTypes: ['navigation', 'resource'] });
    };

    // Monitor user interactions
    const trackUserInteractions = () => {
      let interactionCount = 0;
      const trackInteraction = () => {
        interactionCount++;
        if (interactionCount === 1) {
          // Track first user interaction
          monitorSEOPerformance.trackOrganicTraffic('user', 'interaction');
        }
      };

      ['click', 'scroll', 'keydown'].forEach(eventType => {
        document.addEventListener(eventType, trackInteraction, { once: true });
      });
    };

    // Initialize monitoring
    if (typeof window !== 'undefined') {
      window.addEventListener('load', handleLoad);
      observeWebVitals();
      observeResources();
      trackUserInteractions();
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('load', handleLoad);
      }
    };
  }, []);

  return null; // This component doesn't render anything
}

// SEO Performance Dashboard Component
export function SEOPerformanceDashboard() {
  useEffect(() => {
    // Track SEO metrics
    const trackSEOMetrics = () => {
      // Track page visibility
      if (document.visibilityState === 'visible') {
        monitorSEOPerformance.trackOrganicTraffic('page', 'visible');
      }

      // Track scroll depth
      let maxScrollDepth = 0;
      const trackScrollDepth = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollDepth = Math.round((scrollTop / scrollHeight) * 100);
        
        if (scrollDepth > maxScrollDepth) {
          maxScrollDepth = scrollDepth;
          if (maxScrollDepth >= 25 && maxScrollDepth < 50) {
            monitorSEOPerformance.trackOrganicTraffic('scroll', '25%');
          } else if (maxScrollDepth >= 50 && maxScrollDepth < 75) {
            monitorSEOPerformance.trackOrganicTraffic('scroll', '50%');
          } else if (maxScrollDepth >= 75 && maxScrollDepth < 90) {
            monitorSEOPerformance.trackOrganicTraffic('scroll', '75%');
          } else if (maxScrollDepth >= 90) {
            monitorSEOPerformance.trackOrganicTraffic('scroll', '90%');
          }
        }
      };

      window.addEventListener('scroll', trackScrollDepth);
      
      return () => {
        window.removeEventListener('scroll', trackScrollDepth);
      };
    };

    trackSEOMetrics();
  }, []);

  return null;
}
