import { generateRobotsTxt } from '@/lib/seoUtils';

export const dynamic = 'force-static';

export async function GET() {
  const robots = generateRobotsTxt();
  
  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24 hours
    },
  });
} 