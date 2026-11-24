import type { Metadata } from 'next';
import Link from 'next/link';
import { ProviderCompletion } from '@/components/ProviderCompletion';

export const metadata: Metadata = { title: 'LINE 로그인 확인 | LabSync', robots: { index: false, follow: false }, referrer: 'no-referrer' };
export default function LineResult() {
  return <main className="legal-page container" data-clarity-mask="true">
    <h1>LINE 로그인</h1><ProviderCompletion provider="line" />
    <Link className="secondary-button" href="/">홈페이지로 돌아가기</Link>
  </main>;
}
