import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ContactCTA } from '@/components/ContactCTA';
import { RequestAssistant } from '@/components/RequestAssistant';
import { PilotInquiry } from '@/components/PilotInquiry';
import { OperationsPreview } from '@/components/OperationsPreview';
import { faqs } from '@/lib/public-content';
import { canonicalOrigin, structuredData } from '@/lib/seo';
import { siteConfig as s } from '@/lib/site-config';

export default function Home() {
  return <><a className="skip-link" href="#main">본문으로 바로가기</a><SiteHeader /><main id="main">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData({ '@context': 'https://schema.org', '@graph': [
      { '@type': 'Organization', '@id': canonicalOrigin() + '/#organization', name: 'LabSync', url: canonicalOrigin(), email: 'dongbeen@gm.gist.ac.kr', founder: { '@type': 'Person', name: '이동빈' } },
      { '@type': 'Service', name: '공용장비 Google Calendar 운영 지원', provider: { '@id': canonicalOrigin() + '/#organization' }, description: s.description },
      { '@type': 'FAQPage', mainEntity: faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
    ] }) }} />
    <section className="hero release-hero" aria-labelledby="hero-title"><div className="container hero-layout">
      <div className="hero-copy"><p className="eyebrow"><span className="pilot-dot" /> 6주 유료 파일럿 · 도입 상담</p><p className="hero-buyer">PI·연구실 책임자를 위한 공용장비 운영 지원</p><h1 id="hero-title">예약은 Calendar에.<br /><em>운영 요청은<br />LabSync에.</em></h1><p className="release-description">예약 도구를 바꾸지 않아도 됩니다.<br />변경·취소·권한 요청을 정리하고,<br className="mobile-break" /> 운영자가 확인해 처리합니다.</p><div className="hero-buttons"><ContactCTA /><a className="secondary-button" href="#request-assistant">운영 방식 체험하기 <span aria-hidden="true">↓</span></a></div><p className="offer-note">₩300,000 <span>·</span> Calendar 최대 5개 <span>·</span> 온보딩 포함</p><p className="buyer-note">운영 시작 후 6주 · 자동 갱신 없음</p></div><OperationsPreview />
    </div><div className="container service-boundary"><span>KEEP YOUR CALENDAR</span><p>예약 시스템 교체 없이 <b>요청 정리 → 운영자 확인 → 처리 결과 기록</b></p></div></section>
    <section id="problem" className="section release-problem"><div className="container problem-layout"><div><p className="eyebrow">AFTER THE BOOKING</p><h2>예약보다 번거로운 건,<br />예약 이후의 일.</h2></div><div className="problem-list">{[['흩어지는 요청','메일, 메신저, 구두 요청을 담당자가 다시 모읍니다.'],['반복되는 권한 확인','누가 어떤 장비를 쓸 수 있는지 매번 확인합니다.'],['남지 않는 처리 결과','무엇이 바뀌었는지 다시 묻고, 다시 확인합니다.']].map(([t,d],i)=><div key={t}><span>0{i+1}</span><div><h3>{t}</h3><p>{d}</p></div></div>)}</div></div></section>
    <section id="how-it-works" className="section release-demo" aria-labelledby="how-title"><div className="container"><div className="demo-heading"><div><p className="eyebrow">ONE REQUEST, A CLEAR NEXT STEP</p><h2 id="how-title">요청은 간단하게.<br />처리는 확인을 거쳐서.</h2></div><p>필요한 정보를 순서대로 묻고 정리합니다.<br />실제 파일럿에서는 운영자가 권한과 예약을 확인합니다.</p></div><div className="demo-layout" id="request-assistant"><div className="demo-explainer"><span className="mode-label">방문자용 체험</span><h3>한 번 요청해 보세요.</h3><p>가상의 장비와 예약으로<br />요청이 정리되는 과정을 살펴보세요.</p><ol>{[['요청 선택','변경, 취소, 접근 권한, 운영 오류'],['필요한 정보 확인','장비·예약·요청 내용을 한 번에'],['요약과 결과 예시','운영자가 확인할 내용을 명확하게']].map(([t,d],i)=><li key={t}><b>0{i+1}</b><div><strong>{t}</strong><p>{d}</p></div></li>)}</ol><div className="pilot-mode-note"><strong>실제 운영 요청은?</strong><p>승인된 파일럿 연구실에 별도로 제공합니다. 현재 홈페이지 체험은 요청 접수·Calendar 변경을 하지 않습니다.</p></div></div><RequestAssistant /></div></div></section>
    <section id="pilot" className="section release-pilot"><div className="container"><div className="pilot-offer"><div className="pilot-summary"><p className="eyebrow">START SMALL, LEARN TOGETHER</p><h2 id="pilot-title">우리 연구실에 맞는지,<br />6주 동안 확인하세요.</h2><p className="pilot-description">첫 Paid Pilot으로 실제 운영 수요와<br />지원 범위를 함께 검증합니다.</p><ContactCTA /></div><div className="pilot-details"><div className="pilot-price-row"><span>6주 Paid Pilot</span><strong>{s.pilotPrice}</strong></div><ul className="included-list">{['최대 5개 공용장비 Google Calendar','초기 설정 및 온보딩 포함','운영 시작 후 6주',s.serviceHours,s.ackTarget,'자동 갱신 없음'].map(t=><li key={t}><span aria-hidden="true">✓</span>{t}</li>)}</ul><p className="pilot-note">4시간은 해결 시간이 아닌 접수 확인 목표입니다.<br />연구실 전체 IT 관리·장비 유지보수는 포함하지 않습니다.</p></div></div></div></section>
    <section id="faq" className="section faq-section"><div className="container faq-grid"><div><p className="eyebrow">BEFORE YOUR PILOT</p><h2>도입 전에<br />궁금한 점</h2></div><div>{faqs.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></div></section>
    <section id="contact" className="section release-contact"><div className="container intake-layout"><div><p className="eyebrow">LET’S TALK ABOUT YOUR LAB</p><h2>운영의 어떤 부분이<br />가장 번거로운가요?</h2><p>연구실 상황을 알려주시면<br />파일럿 지원 범위를 함께 확인하겠습니다.</p><div className="contact-person"><span className="owner-avatar">L</span><div><strong>이동빈 · LabSync</strong><a href="mailto:dongbeen@gm.gist.ac.kr">dongbeen@gm.gist.ac.kr</a></div></div><p className="contact-note">상담으로 바로 결제되거나<br />파일럿 계약이 체결되지 않습니다.</p></div><PilotInquiry /></div></section>
  </main><SiteFooter /></>;
}
