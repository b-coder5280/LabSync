import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { LabWorkspace } from '@/components/LabWorkspace';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: '계정 및 데이터 삭제 신청 | LabSync',
  description: 'LabSync 계정과 연결 데이터의 삭제를 신청하는 방법입니다.',
  alternates: { canonical: '/account-deletion' },
  robots: { index: false },
};

export default function AccountDeletion() {
  return <><SiteHeader /><main id="main" className="container workspace">
    <h1>계정 및 데이터 삭제 신청</h1>
    <p>앱에서 신청하거나 계정에 사용한 이메일로 <a href={`mailto:${siteConfig.contactEmail}?subject=LabSync%20계정%20삭제%20신청`}>{siteConfig.contactEmail}</a>에 요청하세요.</p>
    <p>운영자가 본인 확인 후 계정과 연결 데이터의 처리 범위를 안내합니다. 비밀번호나 인증번호는 보내지 마세요.</p>
    <LabWorkspace deletion />
  </main><SiteFooter /></>;
}
