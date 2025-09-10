// Google Analytics 4 and Search Console integration

// Google Analytics 4 Configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-V3RL8RE9ZY';

// Google Search Console verification
export const GSC_VERIFICATION_CODE = process.env.GSC_VERIFICATION_CODE || 'googlebed3200569488cf4';

// Page view tracking
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Event tracking
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Form interaction tracking
export const trackFormEvent = (formType: string, action: string) => {
  event({
    action: action,
    category: 'Form',
    label: formType,
  });
};

// SEO performance tracking
export const trackSEOMetric = (metric: string, value: number) => {
  event({
    action: 'seo_metric',
    category: 'SEO',
    label: metric,
    value: value,
  });
};

// Core Web Vitals tracking
export const trackWebVitals = (metric: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }
};

// Search Console API integration (for server-side)
export const getSearchConsoleData = async () => {
  // This would integrate with Google Search Console API
  // to fetch search performance data
  return {
    clicks: 0,
    impressions: 0,
    ctr: 0,
    position: 0,
  };
};

// SEO monitoring functions
export const monitorSEOPerformance = {
  // Track page load performance
  trackPageLoad: (url: string, loadTime: number) => {
    event({
      action: 'page_load',
      category: 'Performance',
      label: url,
      value: loadTime,
    });
  },

  // Track search rankings
  trackRanking: (keyword: string, position: number, url: string) => {
    event({
      action: 'ranking',
      category: 'SEO',
      label: `${keyword} - ${url}`,
      value: position,
    });
  },

  // Track organic traffic
  trackOrganicTraffic: (source: string, medium: string) => {
    event({
      action: 'organic_traffic',
      category: 'Traffic',
      label: `${source} - ${medium}`,
    });
  },
};

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: any
    ) => void;
  }
}
