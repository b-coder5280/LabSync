import { SiteHeader } from "@/components/SiteHeader";
import Link from "next/link";
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
function Wordmark() {
  return <Link className="wordmark" href="/" aria-label="LabSync 홈">Lab<span className="brand-link" aria-hidden="true" />Sync</Link>;
}
export default function Home() {
  return <>
    <a className="skip-link" href="#main">본문으로 바로가기</a>
    <SiteHeader />
    <main id="main">
      <section className="hero" aria-labelledby="hero-title"><div className="container hero-layout">
        <div className="hero-copy"><p className="eyebrow">Shared Equipment Operations</p><h1 id="hero-title"><span>장비 예약은 그대로,</span><span>운영은 더<br /><em>간단하게.</em></span></h1><div className="hero-description"><p>기존 Google Calendar를 유지하면서 예약 변경, 접근 권한, 운영 오류 대응에 드는 연구실의 수작업을 줄입니다.</p></div><div className="hero-action"><div className="hero-buttons"><ContactCTA /><a className="secondary-button" href="#how-it-works">운영 방식 보기 <span aria-hidden="true">↓</span></a></div><p className="offer-note">6주 유료 파일럿 <span>·</span> 기존 Calendar 그대로</p></div></div>
        <figure className="operations-visual" aria-label="기존 Google Calendar에 LabSync 운영 지원을 더하는 방식"><div className="visual-heading"><span>YOUR LAB, IN SYNC</span><span className="visual-tag">운영 구조</span></div><div className="calendar-block"><div className="calendar-symbol" aria-hidden="true">31</div><div><p>예약은 익숙한 곳에서</p><h2>기존 Google Calendar</h2></div></div><div className="connection-line" aria-hidden="true"><span>+</span></div><div className="operations-block"><div className="operations-title"><span className="ls-symbol" aria-hidden="true">LS</span><div><p>반복되는 운영은 함께</p><h2>LabSync 운영 지원</h2></div></div><ul><li><span>01</span>예약 변경·취소<span aria-hidden="true">↗</span></li><li><span>02</span>접근 권한 관리<span aria-hidden="true">↗</span></li><li><span>03</span>운영 오류 대응<span aria-hidden="true">↗</span></li></ul><p className="visual-process">요청 확인 <span>→</span> 운영자 처리 <span>→</span> 결과 검증</p></div><figcaption>예약 도구를 바꾸지 않고, 운영 부담을 나눕니다.</figcaption></figure>
      </div></section>

      <section id="request-assistant" className="section usage-section" aria-labelledby="usage-title"><div className="container">
        <div className="section-intro"><h2 id="usage-title">요청은 채팅처럼.<br />처리는 운영 절차대로.</h2><p>복잡한 관리 화면을 배울 필요 없이,<br />필요한 요청을 선택하고 질문에 답하세요.<br />확인·처리·검증은 LabSync가 맡습니다.</p></div>
        <div className="usage-layout"><RequestAssistant /><ol className="usage-steps">{usageSteps.map(([title, text], i) => <li key={title}><span>0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></div>
        <p className="human-review-note">자연어 요청이 곧바로 Calendar 변경으로 이어지지 않습니다.<br className="mobile-break" /> 실제 Pilot에서는 LabSync 운영자가 요청을 확인한 뒤 처리합니다.</p>
      </div></section>

      <section id="problem" className="section problem-section compact-problem" aria-labelledby="problem-title"><div className="container"><h2 id="problem-title">문제는 예약이 아니라,<br />예약 뒤의 운영입니다.</h2><ul className="problem-topics"><li>예약 변경·취소</li><li>구성원 권한</li><li>운영 오류</li></ul><p>결국 누군가는 연구 대신 시스템 운영까지 맡게 됩니다.</p></div></section>

      <section id="how-it-works" className="section how-section" aria-labelledby="how-title"><div className="container"><h2 id="how-title">LabSync 운영 방식</h2><ol className="timeline">{steps.map(([title, text], i) => <li key={title}><span className="timeline-point">0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></div></section>

      <section id="pilot" className="section pilot-section" aria-labelledby="pilot-title"><div className="container"><div className="pilot-offer">
        <div className="pilot-summary"><h2 id="pilot-title">6주 Paid Pilot</h2><p className="price">{s.pilotPrice}</p><p className="pilot-description">실제 운영 요청이 얼마나 발생하고,<br />그 부담을 얼마나 대신할 수 있는지<br />6주 동안 확인합니다.</p><ContactCTA /></div>
        <div className="pilot-details"><h3>포함되는 내용</h3><ul className="included-list">{["초기 설정 및 온보딩", `최대 ${s.pilotCalendarLimit}개 공용장비 Google Calendar`, `운영 시작 후 ${s.pilotObservationPeriod} 운영 관찰`, s.serviceHours, s.ackTarget, "자동 갱신 없음"].map(text => <li key={text}><span aria-hidden="true">✓</span>{text}</li>)}</ul><p className="pilot-note">4시간은 해결 시간이 아닌 접수 확인 목표입니다.<br />처리 시간은 요청 내용과 확인 과정에 따라 달라지며, 보장하지 않습니다.</p></div>
      </div><div className="scope-note"><h3>서비스 범위</h3><p>공용장비 Google Calendar 운영에 집중합니다.<br />연구실 전체 IT 관리, 장비 유지보수, 연구 데이터 관리는 제공하지 않습니다.</p></div></div></section>

      <section id="contact" className="final-cta" aria-labelledby="contact-title"><div className="container final-layout"><div><p className="final-label">Keep the Calendar.<br />Offload the operations.</p><h2 id="contact-title">공용장비 운영,<br />계속 한 사람이 맡고 있나요?</h2></div><div className="final-action"><p>기존 Google Calendar를 그대로 유지하면서<br />반복되는 운영 요청을 LabSync로 분리할 수 있는지<br />6주 Pilot으로 확인해 보세요.</p><ContactCTA />{!s.contactHref && <p id="contact-status" className="contact-status">파일럿 문의 채널을 준비 중입니다. 현재 이 홈페이지에서는 문의를 접수하지 않습니다.</p>}</div></div></section>
    </main>
    <footer className="footer container"><Wordmark /><p>Google Calendar operations for shared-equipment labs.</p><span>© 2026 LabSync</span></footer>
  </>;
}
