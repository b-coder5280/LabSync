import { kakaoConfig } from '@/lib/kakao-security';
export const dynamic = 'force-dynamic';
export function GET() {
  return Response.json({ enabled: Boolean(kakaoConfig()) }, { headers: { 'Cache-Control': 'no-store' } });
}
