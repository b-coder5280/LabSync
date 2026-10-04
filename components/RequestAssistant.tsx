"use client";

import { useEffect, useId, useRef, useState } from "react";

const requestTypes = ["예약 시간 변경", "예약 취소", "Calendar 권한", "운영 오류"] as const;
type RequestType = typeof requestTypes[number];
type Step = "type" | "equipment" | "details" | "summary" | "done";
const headings: Record<Step, string> = {
  type: "무엇을 도와드릴까요?", equipment: "어떤 장비의 요청인가요?",
  details: "필요한 정보를 확인할게요.", summary: "요청 내용을 확인해 주세요.", done: "예시 요청이 접수되었습니다.",
};

export function RequestAssistant({ summaryPreview = false }: { summaryPreview?: boolean }) {
  const [requestType, setRequestType] = useState<RequestType>("예약 시간 변경");
  const [equipment, setEquipment] = useState("SEM-1");
  const [currentTime, setCurrentTime] = useState("15:00–16:00");
  const [requestedTime, setRequestedTime] = useState("16:00–17:00");
  const [detail, setDetail] = useState("");
  const [step, setStep] = useState<Step>(summaryPreview ? "summary" : "type");
  const titleId = useId();
  const noteId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const interacted = useRef(false);
  useEffect(() => { if (interacted.current) titleRef.current?.focus({ preventScroll: true }); }, [step]);
  function go(next: Step) { interacted.current = true; setStep(next); }
  function reset() {
    setRequestType("예약 시간 변경"); setEquipment("SEM-1");
    setCurrentTime("15:00–16:00"); setRequestedTime("16:00–17:00"); setDetail(""); go("type");
  }
  function chooseType(type: RequestType) {
    setRequestType(type); setDetail(type === "Calendar 권한" ? "신규 구성원 접근 권한 요청" : type === "운영 오류" ? "변경한 일정이 보이지 않음" : ""); go("equipment");
  }
  const requestDescription = requestType === "예약 시간 변경" ? `${currentTime} → ${requestedTime}` : requestType === "예약 취소" ? `${currentTime} 예약 취소` : detail;
  return <div className="assistant" role="region" aria-label="LabSync Request Assistant 예시" aria-describedby={noteId}>
    <div className="assistant-header"><div><strong>LabSync</strong><span>Request Assistant</span></div><span className="preview-badge">PILOT UX PREVIEW</span></div>
    <div className="assistant-body">
      <div className="assistant-context"><span>예시 연구실 · 2026.10.07</span><button type="button" onClick={reset}>처음부터</button></div>
      {step !== "type" && <p className="request-message"><span>연구원</span>{equipment} · {requestType}</p>}
      <div className="assistant-speaker"><span aria-hidden="true">L</span>LabSync</div>
      <h3 ref={titleRef} id={titleId} tabIndex={-1}>{headings[step]}</h3>
      <div className="assistant-stage" aria-labelledby={titleId}>
        {step === "type" && <><p className="assistant-hint">필요한 운영 요청을 선택해 보세요.</p><div className="assistant-options">{requestTypes.map(type => <button type="button" key={type} aria-pressed={requestType === type} onClick={() => chooseType(type)}>{type}<span aria-hidden="true">↗</span></button>)}</div><div className="assistant-start-note">요청 선택 <span>→</span> 정보 확인 <span>→</span> 요약 확인</div></>}
        {step === "equipment" && <><p className="assistant-hint">아래 장비와 예약은 모두 가상의 예시입니다.</p><div className="assistant-options equipment-options">{["SEM-1", "SEM-2", "XRD-1"].map(item => <button type="button" key={item} onClick={() => { setEquipment(item); go("details"); }}>{item}<span aria-hidden="true">→</span></button>)}</div></>}
        {step === "details" && <>
          {(requestType === "예약 시간 변경" || requestType === "예약 취소") ? <>
            <label className="assistant-field">{requestType === "예약 취소" ? "취소할 예약" : "변경할 예약"}<span>2026.10.07 · {equipment}</span><select value={currentTime} onChange={event => setCurrentTime(event.target.value)}><option>15:00–16:00</option><option>13:00–14:00</option></select></label>
            {requestType === "예약 시간 변경" && <label className="assistant-field">변경할 시간<select value={requestedTime} onChange={event => setRequestedTime(event.target.value)}><option>16:00–17:00</option><option>17:00–18:00</option></select></label>}
            {requestType === "예약 취소" && <p className="assistant-hint">선택한 예약의 취소를 요청하는 예시입니다.</p>}
          </> : <><p className="assistant-hint">{requestType === "Calendar 권한" ? "대상 구성원: Researcher A (가상 인물)" : `${equipment}에서 어떤 문제가 있었나요?`}</p><label className="assistant-field">요청 내용<select value={detail} onChange={event => setDetail(event.target.value)}>{(requestType === "Calendar 권한" ? ["신규 구성원 접근 권한 요청", "퇴실 구성원 접근 권한 회수"] : ["변경한 일정이 보이지 않음", "예약이 중복으로 표시됨"]).map(option => <option key={option}>{option}</option>)}</select></label></>}
          <button className="assistant-primary" type="button" onClick={() => go("summary")}>요청 요약 확인 <span aria-hidden="true">→</span></button>
        </>}
        {step === "summary" && <><dl className="assistant-summary"><div><dt>장비 / 요청</dt><dd>{equipment} · {requestType}</dd></div><div><dt>대상</dt><dd>{requestType === "Calendar 권한" ? "Researcher A · 가상 구성원" : "2026.10.07 · 예시 예약"}</dd></div>{requestType === "예약 시간 변경" ? <><div><dt>현재 시간</dt><dd>{currentTime}</dd></div><div className="summary-change"><dt>요청 시간</dt><dd>{requestedTime}</dd></div></> : <div className="summary-change"><dt>요청 내용</dt><dd>{requestDescription}</dd></div>}</dl><button className="assistant-primary" type="button" onClick={() => go("done")}>요청 보내기 <span>예시</span><span aria-hidden="true">→</span></button><p className="no-transmission">실제 전송이나 Calendar 변경은 발생하지 않습니다.</p></>}
        {step === "done" && <div role="status"><p className="assistant-hint">{equipment} · {requestDescription}</p><p className="simulation-note">아래는 운영자가 확인·처리한 뒤의 결과 예시입니다.</p><ol className="demo-results">{["요청 접수", "권한 및 현재 상태 확인", requestType === "운영 오류" ? "운영 오류 확인·대응" : "Calendar 작업 처리", "처리 결과 재확인"].map((label, i) => <li key={label}><span aria-hidden="true">{i === 3 ? "●" : "○"}</span>{label}<small>예시</small></li>)}</ol><p className="no-transmission">데모가 완료되었습니다. 실제 요청은 전송되지 않았습니다.</p></div>}
      </div>
      {step !== "type" && step !== "done" && <button className="assistant-back" type="button" onClick={() => go(step === "equipment" ? "type" : step === "details" ? "equipment" : "details")}>← 이전 단계</button>}
    </div>
    <p className="assistant-disclaimer" id={noteId}>예시 화면입니다. 실제 Pilot에서는 LabSync 운영자가 요청과 권한을 확인한 뒤 처리합니다.</p>
  </div>;
}
