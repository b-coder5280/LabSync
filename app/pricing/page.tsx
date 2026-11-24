import Link from 'next/link';
import { PublicPage } from '@/components/PublicPage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata = publicPageMetadata('/pricing', '파일럿 요금 | LabSync', '무료 데모, 연구실당 6주 30만원 파일럿 제안, 운영 지원 상담 조건을 확인하세요.');

export default function Pricing() {
  return <PublicPage title="LabSync 이용 범위와 파일럿 요금">
    <section><h2>무료 데모 · 0원</h2><p>가상 장비와 예약으로 요청 작성과 요약 흐름을 체험합니다.</p><Link href="/#request-assistant">무료 데모 체험</Link></section>
    <section><h2>6주 파일럿 · 연구실당 30만원 제안</h2><p>최대 5개 공용장비 Google Calendar, 초기 온보딩, 운영 요청 접수·검토·이력을 포함합니다. 자동 갱신은 없습니다.</p></section>
    <section><h2>맞춤 운영 지원 · 상담</h2><p>연구실의 캘린더 수와 운영 범위에 맞춰 지원 조건을 협의합니다.</p></section>
    <p>파일럿 가격은 제안 단계입니다. 계약, 세금 및 결제 조건은 상담 후 확정합니다.</p>
    <Link className="cta" href="/#contact">파일럿 문의</Link>
  </PublicPage>;
}
