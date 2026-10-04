import { ContactCTA } from "@/components/ContactCTA";
import { RequestAssistant } from "@/components/RequestAssistant";
import { siteConfig as s } from "@/lib/site-config";

const steps = [
  ["요청", "Request Assistant에서 필요한 운영 요청을 보냅니다."],
  ["확인", "LabSync가 요청자, 대상 Calendar, 현재 상태를 확인합니다."],
  ["처리", "확인된 요청에 필요한 Calendar 작업을 수행합니다."],
  ["검증", "작업 후 실제 Calendar를 다시 읽고 요청한 결과와 같은지 확인합니다."],
];
const usageSteps = [
  ["요청", "예약 변경, 취소, 권한, 운영 오류 중 필요한 항목을 선택합니다."],
  ["필요한 정보 확인", "장비, 예약, 시간 등 처리에 필요한 정보만 단계적으로 확인합니다."],
  ["요청 요약", "실행 전에 무엇을 바꾸려는지 사용자가 한 번 더 확인합니다."],
  ["LabSync 처리", "운영자가 권한과 현재 상태를 확인한 뒤 필요한 Calendar 작업을 처리합니다."],
  ["결과 확인", "작업 후 실제 Calendar 상태를 다시 확인하고 요청자에게 결과를 알려줍니다."],
];
const layers = [
  ["연구원", "변경·취소·권한·오류 요청"],
  ["Request Assistant", "필요한 정보를 단계적으로 수집"],
  ["LabSync Operations", "대상·권한·현재 상태 확인"],
  ["Google Calendar", "기존 예약 시스템 그대로 사용"],
  ["처리 결과", "처리 후 실제 상태 재확인"],
];
function Wordmark() {
  return <a className="wordmark" href="#" aria-label="LabSync 홈">Lab<span className="brand-link" aria-hidden="true" />Sync</a>;
}
export default function Home() {
  return <>
    <a className="skip-link" href="#main">본문으로 바로가기</a>
    <header className="header"><div className="container header-inner"><Wordmark /><nav aria-label="주요 메뉴"><a href="#request-assistant">이용 방식</a><a href="#how-it-works">운영 방식</a><a href="#pilot">Pilot</a></nav><ContactCTA label="6주 Pilot 문의" /></div></header>
    <main id="main">
      <section className="hero" aria-labelledby="hero-title"><div className="container hero-layout">
        <div className="hero-copy"><p className="eyebrow">GOOGLE CALENDAR OPERATIONS FOR SHARED-EQUIPMENT LABS</p><h1 id="hero-title"><span>{s.headlineLead}</span><span>운영 요청은<br /><em>LabSync로.</em></span></h1><div className="hero-description"><p>Google Calendar를 새로 바꾸지 않습니다.</p><p>예약 변경·취소, 권한 설정, 운영 오류를 채팅하듯 요청하세요.</p><p>LabSync는 대상과 현재 상태를 확인해 처리하고, 실제 Calendar 결과까지 다시 확인합니다.</p></div><div className="hero-action"><ContactCTA /><p className="offer-note"><strong>{s.pilotPrice}</strong><span>·</span> 최대 {s.pilotCalendarLimit}개 Calendar <span>·</span> {s.pilotObservationPeriod}</p></div></div>
        <RequestAssistant />
      </div></section>

      <section id="request-assistant" className="section usage-section" aria-labelledby="usage-title"><div className="container">
        <div className="section-intro"><h2 id="usage-title">요청은 채팅처럼.<br />처리는 운영 절차대로.</h2><p>복잡한 관리 화면을 배울 필요 없이,<br />필요한 요청을 선택하고 질문에 답하세요.<br />확인·처리·검증은 LabSync가 맡습니다.</p></div>
        <div className="usage-layout"><RequestAssistant summaryPreview /><ol className="usage-steps">{usageSteps.map(([title, text], i) => <li key={title}><span>0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></div>
        <p className="human-review-note">자연어 요청이 곧바로 Calendar 변경으로 이어지지 않습니다.<br className="mobile-break" /> 실제 Pilot에서는 LabSync 운영자가 요청을 확인한 뒤 처리합니다.</p>
      </div></section>

      <section id="problem" className="section problem-section compact-problem" aria-labelledby="problem-title"><div className="container"><h2 id="problem-title">문제는 예약이 아니라,<br />예약 뒤의 운영입니다.</h2><ul className="problem-topics"><li>예약 변경·취소</li><li>구성원 권한</li><li>운영 오류</li></ul><p>결국 누군가는 연구 대신 시스템 운영까지 맡게 됩니다.</p></div></section>

      <section className="section layer-section" aria-labelledby="layer-title"><div className="container"><h2 id="layer-title">Calendar 위에 하나의<br className="mobile-break" /> 운영 레이어를 더합니다.</h2><ol className="service-layers">{layers.map(([title, text]) => <li key={title}><strong>{title}</strong><p>{text}</p></li>)}</ol><p className="layer-note">새로운 예약 시스템을 도입하는 것이 아니라, 기존 Calendar 뒤의 운영을 분리합니다.</p></div></section>

      <section id="how-it-works" className="section how-section" aria-labelledby="how-title"><div className="container"><h2 id="how-title">LabSync 운영 방식</h2><ol className="timeline">{steps.map(([title, text], i) => <li key={title}><span className="timeline-point">0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></div></section>

      <section id="pilot" className="section pilot-section" aria-labelledby="pilot-title"><div className="container"><div className="pilot-offer">
        <div className="pilot-summary"><h2 id="pilot-title">6주 Paid Pilot</h2><p className="price">{s.pilotPrice}</p><p className="pilot-description">실제 운영 요청이 얼마나 발생하고,<br />그 부담을 얼마나 대신할 수 있는지<br />6주 동안 확인합니다.</p><ContactCTA /></div>
        <div className="pilot-details"><h3>포함되는 내용</h3><ul className="included-list">{["초기 설정 및 온보딩", `최대 ${s.pilotCalendarLimit}개 공용장비 Google Calendar`, `운영 시작 후 ${s.pilotObservationPeriod} 운영 관찰`, s.serviceHours, s.ackTarget, "자동 갱신 없음"].map(text => <li key={text}><span aria-hidden="true">✓</span>{text}</li>)}</ul><p className="pilot-note">4시간은 해결 시간이 아닌 접수 확인 목표입니다.<br />처리 시간은 요청 내용과 확인 과정에 따라 달라지며, 보장하지 않습니다.</p></div>
      </div><div className="scope-note"><h3>서비스 범위</h3><p>공용장비 Google Calendar 운영에 집중합니다.<br />연구실 전체 IT 관리, 장비 유지보수, 연구 데이터 관리는 제공하지 않습니다.</p></div></div></section>

      <section className="section audience-section" aria-label="Pilot 문의와 운영 요청 구분"><div className="container audience-grid"><div><p className="audience-label">도입 문의</p><h2>처음 방문하셨나요?</h2><p>6주 Paid Pilot을 통해<br />현재 운영 부담이 줄어드는지 확인합니다.</p><ContactCTA /></div><div><p className="audience-label">운영 요청 · 예시 체험</p><h2>Pilot 이용자</h2><p>예약 변경·취소·권한·운영 오류를<br />Request Assistant에서 요청하는 방식입니다.</p><a className="preview-link" href="#request-assistant">Request Assistant 미리보기 <span aria-hidden="true">↑</span></a><small>현재는 예시 체험입니다. 실제 고객 포털이 아닙니다.</small></div></div></section>

      <section id="contact" className="final-cta" aria-labelledby="contact-title"><div className="container final-layout"><div><p className="final-label">Keep the Calendar.<br />Offload the operations.</p><h2 id="contact-title">공용장비 운영,<br />계속 한 사람이 맡고 있나요?</h2></div><div className="final-action"><p>기존 Google Calendar를 그대로 유지하면서<br />반복되는 운영 요청을 LabSync로 분리할 수 있는지<br />6주 Pilot으로 확인해 보세요.</p><ContactCTA /></div></div></section>
    </main>
    <footer className="footer container"><Wordmark /><p>Google Calendar operations for shared-equipment labs.</p><span>© 2026 LabSync</span></footer>
  </>;
}
