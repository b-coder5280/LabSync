export const definition = 'LabSync는 대학 및 연구기관 연구실의 운영 요청을 한곳에서 접수·관리하는 서비스입니다.';
export const scope = '기존 Google Calendar를 유지하며 예약 변경·취소와 권한 요청의 처리 상태를 확인할 수 있도록 설계했습니다.';
export const guideQuestion = '연구실 Google Calendar를 유지하면서 예약 변경 요청을 어떻게 관리하나요?';
export const guideAnswer = '기존 일정은 Google Calendar에 두고, 변경할 캘린더와 예약 시간, 희망 시간, 사유를 LabSync 요청으로 접수합니다. 연구실 관리자는 요청을 검토해 승인·반려 상태와 메모를 남기며, Calendar 일정 변경은 권한이 있는 담당자가 직접 처리합니다.';
export const googleCalendarSource = 'https://support.google.com/calendar/answer/15716974';

export const faqs = [
  ['새로운 예약 시스템을 도입해야 하나요?', '기존 Google Calendar 예약 방식을 계속 사용합니다. LabSync는 예약 변경·취소, 접근 권한, 운영 오류 요청의 접수와 이력을 관리하도록 설계했습니다.'],
  ['누가 파일럿을 문의하면 되나요?', '공용장비 Calendar를 운영하는 PI, 연구실 책임자 또는 운영 담당자가 현재 운영 부담과 필요한 지원 범위를 상담할 수 있습니다.'],
  ['파일럿에 무엇이 포함되나요?', '제안가는 연구실당 6주 30만원입니다. 최대 5개 공용장비 Calendar와 초기 온보딩을 포함하며 자동 갱신은 없습니다. 계약 조건은 상담에서 확인합니다.'],
  ['요청 체험을 누르면 실제 예약이 바뀌나요?', '무료 데모는 샘플 데이터로 작동합니다. 파일럿 연구실에서도 관리자 승인·처리 기록과 Google Calendar에서 실제로 수행하는 일정 변경은 별도입니다.'],
  ['로그인하면 바로 연구실 데이터를 볼 수 있나요?', 'Google 로그인 후 연구실 담당자의 초대가 필요합니다. 각 신청자는 자신의 요청을 보고, 연구실 관리자는 담당 연구실의 요청을 검토합니다.'],
  ['파일럿 문의는 어떻게 전달되나요?', '웹 접수가 활성화된 환경에서는 동의 후 접수번호가 표시됩니다. 웹 접수가 준비 중인 경우에는 작성 내용을 메일 앱으로 옮겨 직접 보내면 됩니다.'],
] as const;

export const faqSchema = () => ({
  '@type': 'FAQPage',
  mainEntity: faqs.map(([question, answer]) => ({
    '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
});
