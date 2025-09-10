import { MetadataRoute } from 'next'

export async function GET(): Promise<Response> {
  const robotsTxt = `User-agent: *
Allow: /
Allow: /create
Allow: /forms
Allow: /analytics/overview
Allow: /pricing
Allow: /feedback
Allow: /privacy
Allow: /terms
Disallow: /api/
Disallow: /dashboard/
Disallow: /analytics/
Disallow: /submissions/
Disallow: /custom-url-domain/
Disallow: /admin/
Disallow: /billing/
Disallow: /branding/
Disallow: /subscription/

User-agent: Googlebot
Allow: /
Allow: /create
Allow: /forms
Allow: /analytics/overview
Allow: /pricing
Allow: /feedback
Allow: /privacy
Allow: /terms
Disallow: /api/
Disallow: /dashboard/
Disallow: /analytics/
Disallow: /submissions/
Disallow: /custom-url-domain/
Disallow: /admin/
Disallow: /billing/
Disallow: /branding/
Disallow: /subscription/

Crawl-delay: 1

Sitemap: https://alurai.com/sitemap.xml`

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}