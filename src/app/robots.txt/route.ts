import { MetadataRoute } from 'next'

export async function GET(): Promise<Response> {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /analytics/
Disallow: /submissions/
Disallow: /custom-url-domain/

User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /analytics/
Disallow: /submissions/
Disallow: /custom-url-domain/

Sitemap: https://alurai.com/sitemap.xml`

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}