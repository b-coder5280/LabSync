import { ContactCTA } from "@/components/ContactCTA";
import { OperationDiagram } from "@/components/OperationDiagram";
import { siteConfig as s } from "@/lib/site-config";

const problems = [
  ["변경과 취소", "예약이 바뀔 때마다 누군가 현재 상태를 확인하고 다시 정리합니다."],
  ["구성원 권한", "사람이 들어오고 나갈 때마다 Calendar 접근 권한을 관리해야 합니다."],
  ["운영 오류", "문제가 생기면 결국 연구실 안의 누군가가 해결합니다."],
];
const steps = [
  ["요청", "변경·취소·권한 등 운영 요청을 전달합니다."],
  ["확인", "요청자, 대상 Calendar, 현재 상태를 확인합니다."],
  ["처리", "필요한 Calendar 작업을 LabSync가 수행합니다."],
  ["검증", "실제 Calendar 상태를 다시 읽고 요청한 결과와 같은지 확인합니다."],
];

function Wordmark() {
  return <a className="wordmark" href="#" aria-label="LabSync 홈">Lab<span className="brand-link" aria-hidden="true" />Sync</a>;
}

export default function Home() {
  return <>
    <a className="skip-link" href="#main">본문으로 바로가기</a>
    <header className="header">
      <div className="container header-inner">
        <Wordmark />
        <nav aria-label="주요 메뉴"><a href="#problem">문제</a><a href="#how-it-works">운영 방식</a><a href="#pilot">Pilot</a></nav>
        <ContactCTA label="6주 Pilot 문의" />
      </div>
    </header>
    <main id="main">
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero-layout">
          <div className="hero-copy">
            <p className="eyebrow">FOR GOOGLE CALENDAR–BASED LABS</p>
            <h1 id="hero-title"><span>{s.headlineLead}</span><span>운영 문제는<br /><em>LabSync가</em> 맡습니다.</span></h1>
            <p className="hero-description">Google Calendar를 바꾸지 않고,<br className="wide-break" /> 예약 변경·취소, 구성원 권한 설정, 운영 오류 대응을 대신 처리합니다.</p>
            <p className="hero-purpose">연구원이 시스템 관리까지 맡지 않도록.</p>
            <div className="hero-action"><ContactCTA /><p className="offer-note"><strong>{s.pilotPrice}</strong><span>·</span> 최대 {s.pilotCalendarLimit}개 Calendar <span>·</span> {s.pilotObservationPeriod}</p></div>
          </div>
          <OperationDiagram />
        </div>
      </section>

      <section id="problem" className="section problem-section" aria-labelledby="problem-title">
        <div className="container">
          <div className="section-intro"><h2 id="problem-title">문제는 예약이 아니라,<br />예약 뒤의 운영입니다.</h2><p>Google Calendar는 예약을 기록합니다.<br />하지만 변경, 취소, 권한 설정, 오류가 생기면<br className="wide-break" /> 누군가는 직접 확인하고 해결해야 합니다.</p></div>
          <div className="problem-list">{problems.map(([title, text], i) => <article key={title}><span className="index">0{i + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
          <figure className="workflow-comparison">
            <div className="workflow-current"><p className="workflow-label">지금의 운영</p><div className="tool-chain"><span>Calendar</span><b>+</b><span>Sheet</span><b>+</b><span>메신저</span><b>+</b><span>구두 요청</span></div><div className="workflow-funnel" aria-hidden="true"><span>↓</span></div><div className="researcher"><span className="person-icon" aria-hidden="true" /><strong>한 명의 연구원</strong><span>비공식 관리자</span></div></div>
            <div className="workflow-arrow" aria-hidden="true">→</div>
            <div className="workflow-with"><p className="workflow-label">LabSync와 함께</p><div className="new-workflow"><span className="calendar-icon" aria-hidden="true" /><strong>Google Calendar</strong><span className="workflow-plus">+</span><span className="operations-mark">L<span>↗</span></span><strong>LabSync <small>Operations</small></strong></div></div>
            <figcaption>도구를 하나 더 추가하는 것이 아니라,<br className="mobile-break" /> 사람에게 몰려 있던 운영을 분리합니다.</figcaption>
          </figure>
        </div>
      </section>

      <section id="how-it-works" className="section how-section" aria-labelledby="how-title">
        <div className="container">
          <h2 id="how-title">Calendar를 바꾸지 않고,<br />운영 방식만 바꿉니다.</h2>
          <ol className="timeline">{steps.map(([title, text], i) => <li key={title}><span className="timeline-point">0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>
          <aside className="trust-strip" aria-label="운영 확인 원칙"><p>운영을 대신하는 만큼,<br />처리보다 확인을 먼저 합니다.</p><ul>{["권한 확인", "등록 범위 확인", "처리 후 재확인"].map(text => <li key={text}><span aria-hidden="true">✓</span>{text}</li>)}</ul></aside>
        </div>
      </section>

      <section id="pilot" className="section pilot-section" aria-labelledby="pilot-title">
        <div className="container">
          <div className="pilot-offer">
            <div className="pilot-summary"><h2 id="pilot-title">6주 Paid Pilot</h2><p className="price">{s.pilotPrice}</p><p className="pilot-description">실제 운영 부담과 반복 업무가 있는지<br />함께 확인하기 위한 초기 Pilot입니다.</p><ContactCTA label="Pilot 문의하기" /></div>
            <div className="pilot-details"><h3>포함되는 내용</h3><ul className="included-list">{["초기 설정 및 온보딩", `최대 ${s.pilotCalendarLimit}개 공용장비 Google Calendar`, `운영 시작 후 ${s.pilotObservationPeriod} 운영 관찰`, s.serviceHours, s.ackTarget, "자동 갱신 없음"].map(text => <li key={text}><span aria-hidden="true">✓</span>{text}</li>)}</ul><p className="pilot-note">4시간은 해결 시간이 아닌 접수 확인 목표입니다.<br />처리 시간은 요청 내용과 확인 과정에 따라 달라지며, 보장하지 않습니다.</p></div>
          </div>
          <div className="pilot-fit"><h3>이런 연구실을 찾고 있습니다.</h3><ul>{["여러 사람이 공용장비를 함께 사용", "Google Calendar로 예약 관리", "전담 운영 관리자 없음", "변경·취소·권한 요청이 반복됨"].map(text => <li key={text}>{text}</li>)}</ul><p>연구실 규모보다 운영 복잡도가 중요합니다.</p></div>
          <div className="scope-note"><h3>서비스 범위</h3><p>LabSync는 현재 공용장비 Google Calendar 운영에 집중합니다.<br />연구실 전체 IT 관리, 장비 유지보수, 연구 데이터 관리 서비스는 제공하지 않습니다.</p></div>
        </div>
      </section>

      <section id="contact" className="final-cta" aria-labelledby="contact-title"><div className="container final-layout"><div><p className="final-label">Keep the Calendar.<br />Offload the operations.</p><h2 id="contact-title">공용장비 운영,<br />계속 한 사람이 맡고 있나요?</h2></div><div className="final-action"><p>반복되는 운영 업무를 줄일 수 있는지,<br />6주 Pilot으로 확인해 보세요.</p><ContactCTA label="6주 Pilot 문의하기" /></div></div></section>
    </main>
    <footer className="footer container"><Wordmark /><p>Google Calendar operations for shared-equipment labs.</p><span>© 2026 LabSync</span></footer>
  </>;
}
