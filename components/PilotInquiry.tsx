"use client";
import { useEffect, useRef, useState } from 'react';
import { parseInquiry } from '@/lib/inquiry';
import { siteConfig } from '@/lib/site-config';

export function PilotInquiry() {
  const [step, setStep] = useState(1);
  const [values, setValues] = useState({ name: '', email: '', organization: '', calendarCount: '2–5', message: '', consent: false, website: '' });
  const [challenge, setChallenge] = useState<{ enabled: boolean; nonce?: string }>({ enabled: false });
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [receipt, setReceipt] = useState('');
  const id = useRef(''), locked = useRef(false), title = useRef<HTMLHeadingElement>(null);
  useEffect(() => { fetch('/api/inquiries/status', { cache: 'no-store' }).then(r => r.json()).then(setChallenge).catch(() => {}); }, []);
  function go(next: number) { setStep(next); setError(''); requestAnimationFrame(() => title.current?.focus({ preventScroll: true })); }
  function change(key: keyof typeof values, value: string | boolean) { setValues(v => ({ ...v, [key]: value })); id.current = ''; setError(''); }
  async function submit() {
    if (locked.current || !challenge.enabled) return;
    if (!parseInquiry(values)) { setError('이메일, 문의 내용(10자 이상), 동의를 확인해 주세요.'); return; }
    locked.current = true; setBusy(true); setError('');
    id.current ||= crypto.randomUUID();
    try {
      const response = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, id: id.current, nonce: challenge.nonce }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error === 'inquiry/rate-limit' ? '짧은 시간에 여러 번 시도했습니다. 잠시 후 다시 시도해 주세요.' : '저장하지 못했습니다. 입력은 유지됩니다. 잠시 후 다시 시도해 주세요.');
      if (result.id !== id.current || result.testOnly !== true) throw new Error('접수 결과를 확인하지 못했습니다.');
      setReceipt(result.id); setValues({ name: '', email: '', organization: '', calendarCount: '2–5', message: '', consent: false, website: '' });
    } catch (e) { setError(e instanceof Error ? e.message : '저장하지 못했습니다.'); }
    finally { locked.current = false; setBusy(false); }
  }
  const mail = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent('LabSync 파일럿 문의')}&body=${encodeURIComponent(`이름: ${values.name || '(미입력)'}\n이메일: ${values.email}\n소속: ${values.organization || '(미입력)'}\nCalendar: ${values.calendarCount}\n\n${values.message}`)}`;
  return <div className="intake" data-clarity-mask="true">
    <div className="intake-top"><span>파일럿 상담</span><span>{challenge.enabled ? '로컬 저장 테스트' : '문의 작성 도우미'}</span></div>
    {receipt ? <div className="intake-result" role="status"><span className="result-symbol">✓</span><h3>테스트 문의를 저장했습니다.</h3><p>로컬 Firestore Emulator 저장이 확인되었습니다.<br />실제 상담 접수나 운영자 이메일 발송은 아닙니다.</p><code>{receipt}</code><button className="secondary-button" onClick={() => { setReceipt(''); id.current = ''; go(1); }}>새 테스트 작성</button></div> : <>
      <ol className="intake-progress" aria-label="문의 작성 단계">{['연구실 상황', '연락처', '확인'].map((label, i) => <li key={label} aria-current={step === i + 1 ? 'step' : undefined}><span>{i + 1}</span>{label}</li>)}</ol>
      <form onSubmit={e => { e.preventDefault(); if (step < 3) go(step + 1); else void submit(); }}>
        <h3 ref={title} tabIndex={-1}>{step === 1 ? '어떤 운영 부담이 있나요?' : step === 2 ? '답변받을 연락처를 알려주세요.' : '전달할 내용을 확인해 주세요.'}</h3>
        <p className="intake-caption">{challenge.enabled ? '테스트 환경입니다. 가상의 정보만 입력해 주세요.' : '현재 웹 접수는 준비 중입니다. 입력 내용은 전송되지 않으며, 마지막에 메일로 보낼 수 있습니다.'}</p>
        {step === 1 && <><label>운영 중인 Calendar 수<select value={values.calendarCount} onChange={e => change('calendarCount', e.target.value)}>{['1', '2–5', '6+', '미정'].map(v => <option key={v}>{v}</option>)}</select></label><label>운영상 어려움 또는 문의 <span>필수</span><textarea required minLength={10} maxLength={2000} rows={4} placeholder="예: 장비 예약 변경을 담당자에게 개별 연락하고 있어 요청이 자주 누락됩니다." value={values.message} onChange={e => change('message', e.target.value)} /></label><small>{values.message.length} / 2,000 · 민감한 연구 정보는 입력하지 마세요.</small></>}
        {step === 2 && <><label>이메일 <span>필수</span><input type="email" required maxLength={254} autoComplete="email" value={values.email} onChange={e => change('email', e.target.value)} /></label><div className="intake-pair"><label>이름 <span>선택</span><input maxLength={80} autoComplete="name" value={values.name} onChange={e => change('name', e.target.value)} /></label><label>연구실 / 기관 <span>선택</span><input maxLength={120} autoComplete="organization" value={values.organization} onChange={e => change('organization', e.target.value)} /></label></div></>}
        {step === 3 && <><dl className="intake-summary"><div><dt>연락처</dt><dd>{values.email}</dd></div><div><dt>Calendar</dt><dd>{values.calendarCount}개</dd></div><div><dt>문의</dt><dd>{values.message}</dd></div></dl><p className="intake-privacy">{challenge.enabled ? '목적: 로컬 저장 기능 검증. 항목: 이메일·문의·Calendar 수, 선택한 이름·소속. 보관: Emulator 종료 시 삭제(내보내기 없음). 거부 시 저장하지 않습니다. 가상 정보만 사용합니다.' : '작성 내용은 브라우저 메모리에만 유지됩니다. 메일로 보내면 수신자는 이동빈(dongbeen@gm.gist.ac.kr)입니다. 메일 앱에서 직접 전송하기 전에는 접수되지 않습니다.'}</p>{challenge.enabled && <label className="intake-consent"><input type="checkbox" required checked={values.consent} onChange={e => change('consent', e.target.checked)} />위 테스트용 정보 처리에 동의합니다.</label>}</>}
        <label className="intake-trap" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={values.website} onChange={e => change('website', e.target.value)} /></label>
        {error && <p role="alert" className="intake-error">{error}</p>}
        <div className="intake-actions">{step > 1 && <button type="button" className="text-button" disabled={busy} onClick={() => go(step - 1)}>← 이전</button>}{step < 3 ? <button className="cta" type="submit">다음 <span>→</span></button> : challenge.enabled ? <button className="cta" disabled={busy} type="submit">{busy ? '저장 확인 중…' : '테스트 문의 저장'}</button> : <a className="cta" href={mail}>메일 앱에서 이어 보내기 <span>↗</span></a>}</div>
      </form></>}
  </div>;
}
