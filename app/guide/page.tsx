import Link from 'next/link';
import { PublicPage } from '@/components/PublicPage';
import { googleCalendarSource, guideAnswer, guideQuestion } from '@/lib/public-content';
import { publicPageMetadata } from '@/lib/seo';

export const metadata = publicPageMetadata('/guide', '연구실 Google Calendar 예약 변경 요청 가이드 | LabSync', guideAnswer);

export default function Guide() {
  return <PublicPage title={guideQuestion}>
    <p>{guideAnswer}</p>
    <section><h2>접수부터 처리 확인까지</h2><ol>
      <li>연구실 초대 후 요청 유형과 캘린더·장비 이름을 선택합니다.</li>
      <li>현재 예약 시간과 희망 시간, 이메일, 변경 사유를 제출합니다.</li>
      <li>담당 관리자의 검토 상태와 메모를 확인합니다.</li>
      <li>담당자는 필요한 Calendar 권한을 확인하고 실제 작업 뒤 완료를 기록합니다.</li>
    </ol></section>
    <section><h2>Calendar의 권한 기준</h2><p>공유 캘린더에서 일정을 변경하려면 Google Calendar의 일정 수정 권한이 필요합니다. 학교나 직장 계정에서는 조직 관리자가 공유 설정을 제한할 수 있습니다.</p><a href={googleCalendarSource}>Google Calendar 공식 공유 권한 안내</a><p>출처 확인일 2026년 11월 24일</p></section>
    <p>처리 시간이나 업무 절감 효과의 공개 실측 자료는 현재 없습니다.</p>
    <Link href="/#request-assistant" className="cta">샘플 요청 체험</Link>
  </PublicPage>;
}
