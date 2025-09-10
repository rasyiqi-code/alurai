import type {Metadata, Viewport} from 'next';
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { GoogleAnalytics, WebVitalsTracker } from '@/components/analytics/GoogleAnalytics';
import { PerformanceMonitor, SEOPerformanceDashboard } from '@/components/analytics/PerformanceMonitor';
import { SkipToContent } from '@/components/accessibility/SkipLink';
import { AccessibilityEnhancer, HighContrastMode, ReducedMotionSupport } from '@/components/accessibility/AccessibilityEnhancer';

export const metadata: Metadata = {
  title: {
    default: 'AlurAI - Create Conversational Forms with AI',
    template: '%s | AlurAI'
  },
  description: 'Create beautiful, intelligent conversational forms powered by AI. Build engaging surveys, feedback forms, and data collection tools with advanced analytics and seamless user experience.',
  keywords: ['AI forms', 'conversational forms', 'survey builder', 'form creator', 'AI survey', 'feedback forms', 'data collection', 'form analytics'],
  authors: [{ name: 'AlurAI Team' }],
  creator: 'AlurAI',
  publisher: 'AlurAI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://alurai.com'),
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://alurai.com',
    title: 'AlurAI - Create Conversational Forms with AI',
    description: 'Create beautiful, intelligent conversational forms powered by AI. Build engaging surveys, feedback forms, and data collection tools with advanced analytics.',
    siteName: 'AlurAI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AlurAI - AI-Powered Form Builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AlurAI - Create Conversational Forms with AI',
    description: 'Create beautiful, intelligent conversational forms powered by AI. Build engaging surveys and feedback forms with advanced analytics.',
    images: ['/twitter-image.png'],
    creator: '@alurai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'googlebed3200569488cf4',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
    other: {
      'msvalidate.01': 'your-bing-verification-code',
    },
  },
  category: 'technology',
  classification: 'AI Form Builder',
  applicationName: 'AlurAI',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'AlurAI',
    'msapplication-TileColor': '#1E3A8A',
    'msapplication-config': '/browserconfig.xml',
    'msapplication-TileImage': '/mstile-144x144.png',
    'apple-touch-icon': '/apple-touch-icon.png',
    'mobile-web-app-status-bar-style': 'black-translucent',
    'msapplication-starturl': '/',
    'msapplication-navbutton-color': '#1E3A8A',
    'msapplication-window': 'width=1024;height=768',
    'msapplication-task': 'name=Create Form;action-uri=/create;icon-uri=/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1E3A8A' },
    { media: '(prefers-color-scheme: dark)', color: '#1E3A8A' }
  ],
  colorScheme: 'light dark',
};

const fontHeading = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  preload: true,
  adjustFontFallback: false,
});

const fontBody = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  preload: true,
  adjustFontFallback: false,
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://alurai.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preload" href="/fonts/Plus_Jakarta_Sans.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/og-image.png" as="image" />
        <link rel="preload" href="/twitter-image.png" as="image" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AlurAI" />
        <meta name="msapplication-TileColor" content="#1E3A8A" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={cn(
          "antialiased",
          fontHeading.variable,
          fontBody.variable
        )}>
        <SkipToContent />
        <ThemeProvider
          defaultTheme="system"
          storageKey="alurai-theme"
        >
          <StackProvider app={stackServerApp}>
            <StackTheme>
              {children}
              <Toaster />
            </StackTheme>
          </StackProvider>
        </ThemeProvider>
        <GoogleAnalytics />
        <WebVitalsTracker />
        <PerformanceMonitor />
        <SEOPerformanceDashboard />
        <AccessibilityEnhancer />
        <HighContrastMode />
        <ReducedMotionSupport />
      </body>
    </html>
  );
}
