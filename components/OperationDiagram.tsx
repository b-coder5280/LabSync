export function OperationDiagram() {
  return <figure className="operation" aria-label="가상의 운영 예시: SEM-1 예약을 15시에서 16시로 변경하고 결과를 검증한 모습">
    <figcaption><span className="example-line" aria-hidden="true" />OPERATION EXAMPLE<span>운영 예시</span></figcaption>
    <div className="request-card">
      <div className="request-heading"><span className="equipment-symbol" aria-hidden="true"><span /><span /><span /></span><div><span className="equipment-name">SEM-1</span><h2>예약 시간 변경</h2></div><span className="request-type">일정 변경</span></div>
      <div className="time-change"><div className="time-before"><span>변경 전</span><time>15:00 — 16:00</time></div><div className="time-arrow" aria-hidden="true">↓</div><div className="time-after"><span>변경 후</span><time>16:00 — 17:00</time></div></div>
      <div className="request-meta"><div><span className="meta-label">요청자</span><p>Researcher A</p></div><div className="request-status"><span className="meta-label">처리 상태</span><p><span className="status-dot" aria-hidden="true" />Verified <span className="verified-check" aria-hidden="true">✓</span></p></div></div>
      <div className="request-result"><span aria-hidden="true">✓</span> Calendar 변경 결과 확인 완료</div>
    </div>
    <ol className="request-process" aria-label="예시 처리 과정"><li>요청 접수</li><li>권한 확인</li><li>Calendar 변경</li><li>결과 검증</li></ol>
  </figure>;
}
