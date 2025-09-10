'use client';

import Script from 'next/script';
import { GA_TRACKING_ID } from '@/lib/analytics';

export function GoogleAnalytics() {
  if (!GA_TRACKING_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  );
}

// Web Vitals tracking component
export function WebVitalsTracker() {
  return (
    <Script
      id="web-vitals"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            // Simple web vitals tracking without external dependencies
            function trackWebVital(name, value, id) {
              if (window.gtag) {
                window.gtag('event', name, {
                  event_category: 'Web Vitals',
                  event_label: id,
                  value: Math.round(name === 'CLS' ? value * 1000 : value),
                  non_interaction: true,
                });
              }
            }

            // Track LCP (Largest Contentful Paint)
            if ('PerformanceObserver' in window) {
              try {
                const lcpObserver = new PerformanceObserver((list) => {
                  const entries = list.getEntries();
                  const lastEntry = entries[entries.length - 1];
                  trackWebVital('LCP', lastEntry.startTime, lastEntry.id);
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
              } catch (e) {
                // LCP not supported
              }

              // Track FID (First Input Delay)
              try {
                const fidObserver = new PerformanceObserver((list) => {
                  const entries = list.getEntries();
                  entries.forEach((entry) => {
                    trackWebVital('FID', entry.processingStart - entry.startTime, entry.id);
                  });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
              } catch (e) {
                // FID not supported
              }

              // Track CLS (Cumulative Layout Shift)
              try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                  const entries = list.getEntries();
                  entries.forEach((entry) => {
                    if (!entry.hadRecentInput) {
                      clsValue += entry.value;
                    }
                  });
                  trackWebVital('CLS', clsValue, 'cls-' + Date.now());
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
              } catch (e) {
                // CLS not supported
              }

              // Track FCP (First Contentful Paint)
              try {
                const fcpObserver = new PerformanceObserver((list) => {
                  const entries = list.getEntries();
                  entries.forEach((entry) => {
                    trackWebVital('FCP', entry.startTime, entry.id);
                  });
                });
                fcpObserver.observe({ entryTypes: ['paint'] });
              } catch (e) {
                // FCP not supported
              }
            }
          })();
        `,
      }}
    />
  );
}
