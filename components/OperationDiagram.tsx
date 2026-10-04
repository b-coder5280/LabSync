export function OperationDiagram() {
  return <figure className="operation" aria-label="기존 Google Calendar의 변경, 취소, 권한, 오류 요청을 LabSync가 확인하고 처리한 뒤 결과를 검증합니다.">
    <figcaption><span className="diagram-dot" />기존 Calendar, 새로운 운영 방식<span className="diagram-no">01 / 04</span></figcaption>
    <div className="diagram-content">
      <div className="calendar-node"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h3m2 0h3m-8 3h3"/></svg><div><strong>Google Calendar</strong><small>연구실이 쓰던 예약은 그대로</small></div><span className="tag">유지</span></div>
      <div className="connector" aria-hidden="true">↓</div>
      <div className="request-tags"><span>예약 변경</span><span>취소</span><span>권한</span><span>오류</span></div>
      <div className="connector" aria-hidden="true">↓</div>
      <div className="labsync-node"><span className="monogram">LS</span><strong>LabSync</strong><span>운영을 맡습니다</span></div>
      <div className="connector" aria-hidden="true">↓</div>
      <div className="verification"><span>✓ 확인</span><i aria-hidden="true"/><span>✓ 처리</span><i aria-hidden="true"/><span>✓ 결과 검증</span></div>
    </div><div className="diagram-foot">연구실은 연구에. 운영 요청은 LabSync에.</div>
  </figure>;
}
