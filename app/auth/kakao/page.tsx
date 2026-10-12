import type { Metadata } from 'next';
import Link from 'next/link';
import { KakaoCompletion } from '@/components/KakaoCompletion';
export const metadata: Metadata = { title: '로그인 확인 | LabSync', robots: { index: false, follow: false }, referrer: 'no-referrer' };
export default function KakaoResult() {
  return <main className="legal-page container" data-clarity-mask="true"><h1>카카오 로그인</h1><KakaoCompletion /><Link className="secondary-button" href="/">홈페이지로 돌아가기</Link></main>;
}
