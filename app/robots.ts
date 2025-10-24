import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://personalacademy.com' // Update with your actual domain
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/account/settings',
          '/account/credits',
          '/account/purchases',
          '/padmin/',
        ],
      },
      {
        userAgent: 'GPTBot', // OpenAI crawler
        disallow: ['/'],
      },
      {
        userAgent: 'CCBot', // Common Crawl
        disallow: ['/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
