import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { LabWorkspace } from '@/components/LabWorkspace';

export const metadata: Metadata = {
  title: '연구실 요청 관리 | LabSync',
  alternates: { canonical: '/dashboard' },
  robots: { index: false, follow: false },
};

export default function Dashboard() {
  return <><SiteHeader /><main id="main" className="container workspace">
    <h1>연구실 요청 관리</h1>
    <p>운영 요청을 접수하고 처리 상태를 확인하세요. 관리자가 상태를 저장해도 Google Calendar 일정은 그대로 유지됩니다.</p>
    <LabWorkspace />
    <Link href="/account-deletion">계정 및 데이터 삭제 신청</Link>
  </main><SiteFooter /></>;
}
