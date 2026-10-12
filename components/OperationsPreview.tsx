export function OperationsPreview() {
  return <figure className="workflow-preview" aria-label="예약을 유지하고 운영자가 요청을 확인하는 파일럿 흐름 예시">
    <div className="workflow-bar"><span><i /> LabSync 요청 정리</span><span className="preview-label">흐름 예시</span></div>
    <div className="calendar-strip"><span className="calendar-symbol">31</span><div><strong>Google Calendar</strong><small>예약은 기존 방식 그대로</small></div><span className="kept-label">유지</span></div>
    <div className="workflow-bridge">변경 · 취소 · 권한 · 운영 오류 <span>↓</span></div>
    <div className="request-ticket"><div className="ticket-meta"><span>예약 변경</span><span>예시 · SEM-2</span></div><h2>오후 예약 시간을<br />한 시간 옮기고 싶어요.</h2><div className="ticket-time"><span>15:00–16:00</span><b>→</b><strong>16:00–17:00</strong></div><div className="ticket-owner"><span className="owner-avatar">L</span><div><strong>운영자 확인</strong><small>권한과 현재 예약을 확인한 뒤 처리</small></div><span className="status-pill">확인 대기</span></div></div>
    <ol className="workflow-status"><li className="current"><b>01</b>요청 정리</li><li><b>02</b>운영자 검토</li><li><b>03</b>결과 기록</li></ol>
    <figcaption>파일럿 운영 절차 예시 · 자동 처리되지 않습니다.</figcaption>
  </figure>;
}
