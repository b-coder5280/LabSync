import { canonicalOrigin } from '@/lib/seo';

export const dynamic = 'force-static';

export function GET() {
  const origin = canonicalOrigin();
  const text = [
    '# LabSync',
    '',
    '> LabSync는 대학과 연구기관의 공용장비 예약 변경·취소와 접근 권한 요청을 정리하는 운영 지원 서비스입니다.',
    '',
    '예약은 기존 Google Calendar에 유지합니다. 공개 체험은 샘플로 진행됩니다.',
    '',
    '## 공식 페이지',
    '',
    `- [LabSync 홈페이지](${origin}/)`,
    `- [요청 체험](${origin}/#request-assistant)`,
    `- [자주 묻는 질문](${origin}/#faq)`,
    `- [파일럿 상담](${origin}/#contact)`,
    '',
  ].join('\n');
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
