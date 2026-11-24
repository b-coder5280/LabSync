import type { Metadata } from 'next';
import { PublicPage } from '@/components/PublicPage';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: '취소·환불 안내 | LabSync',
  alternates: { canonical: '/refund' },
  robots: { index: false },
};
export default function Refund() {
  return <PublicPage title="취소·환불 안내">
    <p>무료 데모 이용과 문의에는 비용이 발생하지 않습니다. 현재 웹사이트에서 상품 결제를 받지 않습니다.</p>
    <p>파일럿의 취소, 중도 종료와 환불 조건은 계약 체결 전에 개별 안내합니다.</p>
    <p>이용 문의는 <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>로 보내 주세요.</p>
  </PublicPage>;
}
