import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { legalPreview } from '@/lib/legal-preview';
import Link from 'next/link';
import { SiteFooter } from '@/components/SiteFooter';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: '개인정보처리방침 초안 | LabSync', description: 'LabSync 인증, 문의, 선택적 분석의 실제 처리 범위와 대표자 확인 항목입니다.', alternates: { canonical: '/privacy' }, robots: { index: false, follow: true } };
export default function Privacy() {
  if (!legalPreview) notFound();
  return <><main className="legal-page container"><Link href="/" className="back-link">← LabSync 홈페이지</Link><p className="eyebrow">정책 검토 문서</p><h1>개인정보처리방침 초안</h1><p className="draft-notice">승인 전 초안 · 2026년 10월 11일 작성<br />대표자의 실제 처리 내역과 법적 근거 확인 전이며, 확정된 정책이나 심사 승인본이 아닙니다.</p>
    <section><h2>검토용 문의 입력 기능</h2><p>2026년 10월 12일: 운영 웹 접수는 비활성입니다. 문의 도우미는 브라우저 메모리에 입력 내용을 보관하고 메일 앱으로 넘기며, 자동 전송하지 않습니다. 로컬 테스트에서는 가상 이메일·문의·Calendar 수와 선택한 이름·소속을 Firestore Emulator에 저장합니다. 로컬 데이터는 내보내지 않으며 Emulator 종료 시 삭제됩니다. 동의를 거부하면 테스트 저장하지 않습니다. 운영 Firestore 생성·실제 개인정보 수집은 별도 승인 전입니다.</p></section>
    <section><h2>1. 운영자와 문의</h2><p>LabSync 대표 이동빈(Lee Dongbin). 개인정보 관련 문의·열람·정정·삭제·처리 정지 요청은 <a href="mailto:dongbeen@gm.gist.ac.kr">dongbeen@gm.gist.ac.kr</a>로 보낼 수 있습니다. 담당자는 본인 확인 후 처리 절차를 안내합니다.</p></section>
    <section><h2>2. 현재 확인된 처리</h2><ul><li><strong>Google 로그인:</strong> Firebase Authentication이 UID, 제공업체 식별 정보, 이메일, 표시 이름, 제공되는 프로필 이미지 URL과 인증 메타데이터를 관리합니다. 홈페이지는 이름과 이메일을 계정 안내에 사용합니다.</li><li><strong>카카오 로그인 준비:</strong> 설정 완료 후 카카오의 고유 ID를 Firebase UID에 연결합니다. 이메일·프로필 권한은 요청하지 않고, 기본 표시 이름을 사용합니다. Google 계정과 자동 병합하지 않습니다.</li><li><strong>이메일 문의:</strong> 버튼은 메일 앱을 엽니다. 사용자가 전송한 이메일 주소와 문의 내용은 수신 메일함에서 상담을 위해 처리됩니다. 홈페이지에 문의 저장 DB는 없습니다.</li><li><strong>요청 체험:</strong> 예시 선택 상태는 페이지 메모리에만 있으며 실제 연구실 데이터나 Calendar 내용을 수집·수정하지 않습니다.</li></ul></section>
    <section><h2>3. 브라우저 저장과 보유기간</h2><p>Firebase SDK는 로그인 유지를 위해 브라우저 저장소에 인증 상태를 보관합니다. 로그아웃하면 현재 브라우저 인증 상태가 해제되지만 Firebase 계정 자체가 삭제되는 것은 아닙니다.</p><p>카카오 연결 시 위조 방지용 암호화 HttpOnly 쿠키는 최대 10분, Firebase 연결용 암호화 쿠키는 최대 1분 유지하며 사용 후 삭제합니다. Firebase custom token 및 provider token은 URL·분석 이벤트에 넣지 않습니다.</p><p className="draft-notice">대표자 확인 필요: 계정 및 문의의 실제 보유기간, 삭제 담당자·절차, 법정 보관 대상과 근거. 확인 전 임의의 기간을 확정하지 않았습니다.</p></section>
    <section><h2>4. 선택적 분석</h2><p>현재 GA4와 Microsoft Clarity 수집은 기본 비활성입니다. 정책·속성 확인 및 활성화 이후에도 사용자가 동의한 경우에만 공개 홈페이지에서 로드하도록 준비했습니다. 거부해도 로그인과 문의를 이용할 수 있습니다.</p><p>예정 이벤트는 페이지 조회, 문의 버튼 클릭, 로그인 시작·성공입니다. UID·이름·이메일·토큰·예약 내용은 이벤트에 넣지 않습니다. 문의 버튼 클릭은 실제 접수 완료로 처리하지 않습니다. 화면 하단의 분석 수집 설정에서 선택을 변경할 수 있습니다.</p></section>
    <section><h2>5. 외부 서비스 및 국외 처리 확인</h2><p>인증에는 Google Firebase, 호스팅에는 Vercel, 문의에는 운영자의 이메일 서비스가 관여합니다. Kakao는 연동 활성화 후 관여합니다. GA4·Clarity는 아직 수집하지 않습니다. 호스팅·인증 제공업체가 별도로 처리하는 접속 기록의 설정도 확인해야 합니다.</p><p className="draft-notice">대표자 확인 필요: 수탁자·수령자, 이전 국가·시점·방법·항목·목적·기간, 적용 법적 근거와 거부 방법, 메일 서비스·서버 로그 보관 설정. 현재 확인되지 않은 업체 소재지나 기간을 확정하지 않았습니다.</p></section>
    <section><h2>6. 안전조치와 변경</h2><p>관리자 credential은 서버 전용 환경변수로 제한하고, 로그인과 연구실 권한을 구분합니다. 새 DB나 관리자 기능을 추가하기 전에는 별도 접근 제어 검증이 필요합니다. 실제 정책 시행일과 변경 안내 방식은 대표자 승인 시 확정합니다.</p></section>
  </main><SiteFooter /></>;
}
