import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/client/',
          '/dashboard/',
          '/workspace/',
          '/*/admin/',
          '/*/client/',
          '/*/dashboard/',
        ],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'Claude-Web', 'PerplexityBot'],
        allow: '/',
      }
    ],
    sitemap: 'https://growxlabs.tech/sitemap.xml',
  };
}
