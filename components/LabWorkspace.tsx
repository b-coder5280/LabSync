'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { onIdTokenChanged, type User } from 'firebase/auth';
import { inquirySources } from '@/lib/inquiry';
import { firebaseConfigured, prepareAuth } from '@/lib/firebase-client';
import {
  nextStatuses, requestStatuses, requestTypes,
  type Lab, type LabRequest, type RequestEvent, type RequestStatus, type RequestType,
} from '@/lib/operations';

const errors: Record<string, string> = {
  'auth/invalid-token': '로그인 세션이 만료되었습니다. 다시 로그인해 주세요.',
  'lab/forbidden': '이 연구실에 접근할 권한이 없습니다.',
  'lab/admin-required': '연구실 관리자만 처리할 수 있습니다.',
  'invite/invalid': '초대 코드 형식을 확인해 주세요.',
  'invite/unavailable': '이 Google 계정에 유효한 초대가 없습니다. 담당자에게 확인해 주세요.',
  'invite/verified-email-required': '이메일이 확인된 계정으로 초대를 사용해 주세요.',
  'request/not-found': '볼 수 있는 요청을 찾지 못했습니다.',
  'request/conflict': '요청 상태가 변경되었거나 중복되었습니다. 목록을 새로 확인해 주세요.',
  'request/transition': '현재 요청 상태에서 선택할 수 없는 처리입니다.',
  'operations/configuration': '이 환경의 저장소 설정을 확인해 주세요.',
  'operations/disabled': '이 환경의 연구실 저장소가 아직 연결되지 않았습니다.',
  'operations/invalid-input': '필수 항목, 이메일, 기존·변경 시간을 확인해 주세요.',
};
const messageFor = (error: unknown) =>
  error instanceof Error && errors[error.message] || '처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';

async function api<T>(user: User, query = '', data?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  const response = await fetch('/api/operations' + query, {
    method: data ? 'POST' : 'GET',
    headers: { Authorization: 'Bearer ' + await user.getIdToken(), ...(data && { 'Content-Type': 'application/json' }) },
    body: data ? JSON.stringify(data) : undefined,
    cache: 'no-store', signal,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

export function LabWorkspace({ deletion = false }: { deletion?: boolean }) {
  const [user, setUser] = useState<User | null | undefined>(firebaseConfigured ? undefined : null);
  const [authError, setAuthError] = useState(false);
  useEffect(() => {
    if (!firebaseConfigured) return;
    let active = true;
    let stop: (() => void) | undefined;
    const fail = () => { if (active) { setAuthError(true); setUser(null); } };
    prepareAuth().then(auth => {
      if (active) stop = onIdTokenChanged(auth, setUser, fail);
    }).catch(fail);
    return () => { active = false; stop?.(); };
  }, []);
  if (user === undefined) return <p role="status">Google 로그인 상태를 확인하고 있습니다.</p>;
  if (!user) return <div className="workspace-card"><p>{authError ? 'Google 로그인 상태를 확인하지 못했습니다.' : '상단에서 Google로 로그인해 주세요.'}</p><Link href="/#request-assistant">로그인 없이 무료 데모 보기</Link></div>;
  return deletion ? <DeletionRequest key={user.uid} user={user} /> : <Workspace key={user.uid} user={user} />;
}

function DeletionRequest({ user }: { user: User }) {
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      await api(user, '', { action: 'account-deletion', confirm: true });
      setSubmitted(true);
      setNotice('계정 삭제 요청을 접수했습니다. 본인 확인 및 처리 완료 전까지 계정은 유지됩니다.');
    } catch (error) { setNotice(messageFor(error)); }
    finally { setBusy(false); }
  }
  return <form className="workspace-card" onSubmit={submit}>
    <label className="workspace-check"><input type="checkbox" required disabled={submitted} /> 현재 로그인한 계정의 삭제를 신청합니다.</label>
    <button className="primary-button" disabled={busy || submitted}>삭제 요청 접수</button>
    {notice && <p role="status">{notice}</p>}
  </form>;
}

function Workspace({ user }: { user: User }) {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [labId, setLabId] = useState('');
  const [testOnly, setTestOnly] = useState(false);
  const [canOpenPreviewLab, setCanOpenPreviewLab] = useState(false);
  const [operator, setOperator] = useState(false);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const ctrl = new AbortController();
    api<{ labs: Lab[]; testOnly: boolean; operator: boolean; canOpenPreviewLab: boolean }>(user, '', undefined, ctrl.signal)
      .then(result => {
        if (ctrl.signal.aborted) return;
        setLabs(result.labs);
        setLabId(current => result.labs.some(lab => lab.id === current) ? current : result.labs[0]?.id || '');
        setTestOnly(result.testOnly);
        setCanOpenPreviewLab(result.canOpenPreviewLab);
        setOperator(result.operator);
        setLoadFailed(false);
      })
      .catch(error => {
        if (!ctrl.signal.aborted) { setLoadFailed(true); setNotice(messageFor(error)); }
      })
      .finally(() => { if (!ctrl.signal.aborted) setBusy(false); });
    return () => ctrl.abort();
  }, [user, revision]);

  async function join(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setNotice('');
    try {
      const { labId } = await api<{ labId: string }>(user, '', { action: 'join', code: String(new FormData(form).get('code')).trim() });
      setLabId(labId);
      form.reset();
      setNotice('연구실에 참여했습니다.');
      setRevision(current => current + 1);
    } catch (error) { setNotice(messageFor(error)); setBusy(false); }
  }

  async function openTestLab() {
    setBusy(true);
    setNotice('');
    try {
      const { labId } = await api<{ labId: string }>(user, '', { action: 'open-preview-lab' });
      setLabId(labId);
      setNotice('테스트 연구실이 열렸습니다. 아래에서 샘플 요청을 접수할 수 있습니다.');
      setRevision(current => current + 1);
    } catch (error) { setNotice(messageFor(error)); setBusy(false); }
  }

  const lab = labs.find(item => item.id === labId);
  return <>
    {testOnly && <p className="draft-notice">Demo / Sample data · 테스트 연구실</p>}
    {notice && <p role="status">{notice}</p>}
    {loadFailed ? <button className="secondary-button" disabled={busy} onClick={() => { setBusy(true); setNotice(''); setRevision(n => n + 1); }}>다시 불러오기</button> :
      <div className="workspace-card workspace-grid">
        <div><h2>연구실 선택</h2>
          {labs.length ? <label>내 연구실<select value={labId} onChange={event => setLabId(event.target.value)}>
            {labs.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select></label> : <p>{busy ? '연구실을 불러오는 중입니다.' : '아직 참여 중인 연구실이 없습니다.'}</p>}
          {canOpenPreviewLab && !labs.length && <button type="button" className="primary-button" disabled={busy} onClick={openTestLab}>내 테스트 연구실 열기</button>}
        </div>
        <form onSubmit={join}><h2>초대로 참여</h2><label>초대 코드<input name="code" required maxLength={32} minLength={32} autoComplete="off" /></label>
          <button className="secondary-button" disabled={busy}>참여하기</button>
        </form>
      </div>}
    {operator && !loadFailed && <OperatorPanel user={user} />}
    {lab && !loadFailed && <LabPanel key={lab.id} user={user} lab={lab} />}
  </>;
}

function OperatorPanel({ user }: { user: User }) {
  const [notices, setNotices] = useState<string[]>([]);
  const [records, setRecords] = useState<{ id: string; label: string }[]>([]);
  const [busy, setBusy] = useState(false);
  async function load() {
    setBusy(true);
    setNotices([]);
    setRecords([]);
    try {
      const inquiry = async () => {
        const response = await fetch('/api/inquiries', { headers: { Authorization: 'Bearer ' + await user.getIdToken() } });
        if (!response.ok) throw new Error('문의 접수함을 열 수 없습니다.');
        const result = await response.json() as { testOnly: boolean; inquiries: { id: string; email: string; message: string; source: string }[] };
        return result.inquiries.map(item => ({ id: item.id, label: `${result.testOnly ? '테스트 문의' : '파일럿 문의'} · ${item.email} · ${inquirySources[item.source as keyof typeof inquirySources] || '선택 안 함'} · ${item.message}` }));
      };
      const deletion = async () => {
        const result = await api<{ deletions: { uid: string; email: string | null; status: string }[] }>(user, '?operator=deletions');
        return result.deletions.map(item => ({ id: item.uid, label: `계정 삭제 신청 · ${item.email || item.uid} · ${item.status}` }));
      };
      const outcomes = await Promise.allSettled([inquiry(), deletion()]);
      setRecords(outcomes.flatMap(result => result.status === 'fulfilled' ? result.value : []));
      const failures = outcomes.flatMap((result, index) => result.status === 'rejected' ?
        [index === 0 ? '문의 접수함을 열 수 없습니다.' : '계정 삭제 접수함을 열 수 없습니다.'] : []);
      setNotices(failures.length ? failures : outcomes.every(result => result.status === 'fulfilled' && !result.value.length) ? ['접수된 항목이 없습니다.'] : []);
    } finally { setBusy(false); }
  }
  return <details className="workspace-card"><summary>서비스 운영자 접수함</summary>
    <p>파일럿 문의 및 계정 삭제 신청의 최근 접수 내역을 확인합니다.</p>
    <button className="secondary-button" onClick={load} disabled={busy}>접수함 불러오기</button>
    {notices.map(notice => <p key={notice} role="status">{notice}</p>)}
    {!!records.length && <ul>{records.map(item => <li key={item.id}>{item.label}</li>)}</ul>}
  </details>;
}

function LabPanel({ user, lab }: { user: User; lab: Lab }) {
  const [view, setView] = useState<'mine' | 'queue'>('mine');
  const [filter, setFilter] = useState<RequestStatus | ''>('');
  const [requests, setRequests] = useState<LabRequest[]>([]);
  const [selected, setSelected] = useState('');
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const query = '?lab=' + encodeURIComponent(lab.id);
  useEffect(() => {
    const ctrl = new AbortController();
    api<{ requests: LabRequest[] }>(user, query + '&view=' + view, undefined, ctrl.signal)
      .then(result => { if (!ctrl.signal.aborted) setRequests(result.requests); })
      .catch(error => { if (!ctrl.signal.aborted) { setRequests([]); setNotice(messageFor(error)); } })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, [user, query, view, revision]);
  function refresh() {
    setLoading(true);
    setNotice('');
    setRevision(current => current + 1);
  }
  const visible = requests.filter(request => !filter || request.status === filter);
  return <>
    {lab.role === 'admin' && <InviteForm user={user} labId={lab.id} />}
    <RequestForm user={user} labId={lab.id} onCreated={id => { setSelected(id); setFilter(''); setView('mine'); refresh(); }} />
    <section className="workspace-card">
      <h2>요청 목록</h2>
      <div className="workspace-actions">
        <button className="secondary-button" aria-pressed={view === 'mine'} onClick={() => { if (view !== 'mine') { setView('mine'); setSelected(''); refresh(); } }}>나의 요청</button>
        {lab.role === 'admin' && <button className="secondary-button" aria-pressed={view === 'queue'} onClick={() => { if (view !== 'queue') { setView('queue'); setSelected(''); refresh(); } }}>관리자 큐</button>}
        <button className="secondary-button" onClick={refresh}>새로고침</button>
      </div>
      <label>상태 필터<select value={filter} onChange={event => setFilter(event.target.value as RequestStatus | '')}>
        <option value="">전체</option>{Object.entries(requestStatuses).map(([status, label]) => <option key={status} value={status}>{label}</option>)}
      </select></label>
      {loading ? <p role="status">요청을 불러오는 중입니다.</p> : notice ? <p role="alert">{notice}</p> :
        visible.length ? <><p>최근 50건까지 표시합니다.</p><ul className="workspace-list">{visible.map(request =>
          <li key={request.id}><button type="button" aria-pressed={selected === request.id} onClick={() => setSelected(request.id)}>
            <span>{requestTypes[request.type]} · {request.calendar}</span><strong>{requestStatuses[request.status]}</strong>
          </button></li>)}</ul></> : <p>표시할 요청이 없습니다.</p>}
      {selected && <RequestDetails key={selected + ':' + revision} user={user} query={query} id={selected} lab={lab} onUpdate={refresh} />}
    </section>
  </>;
}

function InviteForm({ user, labId }: { user: User; labId: string }) {
  const [result, setResult] = useState('');
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get('email');
    setPending(true);
    setResult('');
    setCode('');
    try {
      const result = await api<{ code: string }>(user, '', { action: 'invite', labId, email });
      setCode(result.code);
    } catch (error) { setResult(messageFor(error)); }
    finally { setPending(false); }
  }
  return <details className="workspace-card"><summary>연구실 구성원 초대</summary><form onSubmit={submit}>
    <label>초대할 Google 계정 이메일<input type="email" name="email" required maxLength={254} /></label>
    <button className="secondary-button" disabled={pending}>초대 코드 만들기</button>
    {code && <label>초대할 사람에게 전달할 코드 · 7일 유효<input readOnly value={code} onFocus={e => e.currentTarget.select()} /></label>}
    {result && <p role="alert">{result}</p>}
  </form></details>;
}

function RequestForm({ user, labId, onCreated }: { user: User; labId: string; onCreated: (id: string) => void }) {
  const [type, setType] = useState<RequestType>('change');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState<{ id: string; payload: string }>();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    const payload = JSON.stringify(fields);
    const id = retry?.payload === payload ? retry.id : crypto.randomUUID();
    setBusy(true);
    setRetry({ id, payload });
    setNotice('');
    try {
      await api(user, '', { ...fields, action: 'create', labId, id });
      setRetry(undefined);
      form.reset();
      setType('change');
      setNotice('요청을 접수했습니다.');
      onCreated(id);
    } catch (error) { setNotice(messageFor(error)); }
    finally { setBusy(false); }
  }
  return <form className="workspace-card" onSubmit={submit}><h2>Request Assistant</h2>
    <p>관리자가 처리할 요청을 작성하세요. 예약 시각은 한국시간(KST) 기준입니다.</p>
    <fieldset disabled={busy}><legend className="workspace-hidden">요청 필수 항목</legend><div className="workspace-grid">
      <label>요청 유형<select name="type" value={type} onChange={e => setType(e.target.value as RequestType)}>{Object.entries(requestTypes).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label>
      <label>캘린더 또는 장비 이름<input name="calendar" required maxLength={120} /></label>
      <label>기존 예약 시간<input name="scheduledAt" type="datetime-local" required={type === 'change' || type === 'cancel'} /></label>
      {type === 'change' && <label>변경할 시간<input name="desiredAt" type="datetime-local" required /></label>}
      <label>연락 이메일<input type="email" name="contact" defaultValue={user.email || ''} required maxLength={254} /></label>
    </div><label>요청 사유<textarea name="reason" required minLength={5} maxLength={1000} rows={3} /></label>
    <button className="primary-button">요청 접수</button></fieldset>
    {notice && <p role="status">{notice}</p>}
  </form>;
}

function RequestDetails({ user, query, id, lab, onUpdate }: { user: User; query: string; id: string; lab: Lab; onUpdate: () => void }) {
  const [detail, setDetail] = useState<{ request: LabRequest; events: RequestEvent[] }>();
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const ctrl = new AbortController();
    api<{ request: LabRequest; events: RequestEvent[] }>(user, query + '&request=' + encodeURIComponent(id), undefined, ctrl.signal)
      .then(result => { if (!ctrl.signal.aborted) setDetail(result); })
      .catch(error => { if (!ctrl.signal.aborted) setNotice(messageFor(error)); });
    return () => ctrl.abort();
  }, [user, query, id]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!detail) return;
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setNotice('');
    try {
      await api(user, '', { ...fields, action: 'update', labId: lab.id, id, version: detail.request.version });
      onUpdate();
    } catch (error) { setNotice(messageFor(error)); setBusy(false); }
  }
  if (!detail) return <p role="status">{notice || '처리 이력을 불러오는 중입니다.'}</p>;
  const { request, events } = detail;
  const allowed = nextStatuses(request.status);
  return <section className="workspace-detail" aria-label="선택한 요청 상세">
    <h3>{requestTypes[request.type]} · {request.calendar}</h3>
    {request.scheduledAt && <p>기존 예약 {request.scheduledAt.replace('T', ' ')} KST</p>}
    {request.desiredAt && <p>변경 희망 {request.desiredAt.replace('T', ' ')} KST</p>}
    <p>{request.reason}</p><p>{request.contact}</p>
    <h4>처리 이력</h4><ol>{events.map((event, index) => <li key={index}><strong>{requestStatuses[event.status]}</strong>
      {' · '}{new Intl.DateTimeFormat('ko-KR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Seoul' }).format(new Date(event.at))}
      {event.note && <p>{event.note}</p>}</li>)}</ol>
    {lab.role === 'admin' && allowed.length > 0 && <form onSubmit={submit}>
      <fieldset disabled={busy}><legend>관리자 처리</legend>
        <label>다음 상태<select name="status">{allowed.map(status => <option value={status} key={status}>{requestStatuses[status]}</option>)}</select></label>
        <label>신청자에게 표시될 처리 메모<textarea name="note" required minLength={3} maxLength={1000} rows={2} /></label>
        <button className="primary-button">처리 상태 저장</button>
      </fieldset></form>}
    {notice && <p role="alert">{notice}</p>}
  </section>;
}
