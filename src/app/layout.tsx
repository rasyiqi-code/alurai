import type {Metadata} from 'next';
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';

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
    google: 'your-google-verification-code',
  },
};

const fontHeading = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
});

const fontBody = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(
          "antialiased",
          fontHeading.variable,
          fontBody.variable
        )}>
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
      </body>
    </html>
  );
}
