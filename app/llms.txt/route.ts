import { canonicalOrigin } from '@/lib/seo';
import { definition, scope } from '@/lib/public-content';

export const dynamic = 'force-static';
export function GET() {
  const origin = canonicalOrigin();
  return new Response(`# LabSync

> ${definition} ${scope}

공개 데모는 샘플 데이터로 동작합니다. Calendar 수정은 권한이 있는 담당자가 직접 수행합니다.

- [홈 및 데모](${origin}/)
- [파일럿 요금 및 범위](${origin}/pricing)
- [자주 묻는 질문](${origin}/faq)
- [예약 변경 요청 가이드](${origin}/guide)
`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
