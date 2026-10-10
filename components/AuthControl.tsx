"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleAuthProvider, onIdTokenChanged, signInWithPopup, signOut, type User, type Auth } from "firebase/auth";
import { firebaseConfigured, prepareAuth } from "@/lib/firebase-client";
import { authErrorMessage } from "@/lib/auth-errors";

function GoogleIcon() {
  return <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.03 46.98 31.87 46.98 24.55Z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.78-4.59l-7.98-6.19A23.87 23.87 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg>;
}

export function AuthControl() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const auth = useRef<Auth | null>(null);
  const locked = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let disposed = false;
    let unsubscribe: (() => void) | undefined;
    if (!firebaseConfigured) return;
    prepareAuth().then(instance => {
      if (disposed) return;
      auth.current = instance;
      unsubscribe = onIdTokenChanged(instance, current => {
        setUser(current);
        setReady(true);
      }, error => { setUser(null); setMessage(authErrorMessage(error)); setReady(true); });
    }).catch(error => { if (!disposed) { setMessage(authErrorMessage(error)); setReady(true); } });
    return () => { disposed = true; unsubscribe?.(); };
  }, []);

  useEffect(() => {
    function dismiss(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      // A blocked popup can blur the now-disabled trigger. Handle Escape even
      // when focus has fallen back to the document rather than the account UI.
      if (event.key === "Escape" && (open || message)) {
        setOpen(false);
        setMessage("");
        trigger.current?.focus();
      }
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open, message]);

  async function login() {
    if (locked.current) return;
    if (!firebaseConfigured) { setMessage("Google 로그인 연결을 준비 중입니다. 파일럿 안내는 아래에서 확인해 주세요."); return; }
    if (!auth.current) { setMessage("로그인을 초기화하지 못했습니다. 페이지를 새로고침해 주세요."); return; }
    locked.current = true;
    setBusy(true); setMessage("");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      // Popup keeps the exact page, query and hash; no untrusted return URL.
      // GoogleAuthProvider only requests identity scopes, never Calendar scopes.
      await signInWithPopup(auth.current, provider);
      setOpen(true);
    } catch (error) { setMessage(authErrorMessage(error)); }
    finally { locked.current = false; setBusy(false); }
  }
  async function logout() {
    if (!auth.current || locked.current) return;
    locked.current = true; setBusy(true); setMessage("");
    try { await signOut(auth.current); setUser(null); setOpen(false); setMessage("로그아웃되었습니다."); trigger.current?.focus(); }
    catch { setMessage("로그아웃하지 못했습니다. 다시 시도해 주세요."); }
    finally { locked.current = false; setBusy(false); }
  }

  return <div className="auth-control" ref={root}>
    {user ? <>
      <button ref={trigger} type="button" className="auth-button" aria-expanded={open} aria-controls="account-panel" onClick={() => setOpen(!open)}><span className="avatar" aria-hidden="true">{(user.displayName || "사용자").slice(0, 1)}</span><span className="account-name">{user.displayName || "내 계정"}</span><span aria-hidden="true">⌄</span></button>
      {open && <div id="account-panel" className="account-panel"><strong>{user.displayName || "Google 계정"}</strong><p className="account-email">{user.email}</p><div className="access-notice"><strong>이용 권한 확인 전</strong><p>로그인이 완료되었습니다. 연구실 이용 권한은 별도로 확인하며, 현재 연결된 연구실 데이터는 없습니다.</p></div><button className="auth-button" type="button" disabled={busy} onClick={logout}>{busy ? "로그아웃 중…" : "로그아웃"}</button></div>}
    </> : <button ref={trigger} type="button" className="auth-button" disabled={busy || (firebaseConfigured && !ready)} onClick={login}><GoogleIcon /><span>{busy ? "로그인 중…" : firebaseConfigured && !ready ? "계정 확인 중…" : "Google로 로그인"}</span></button>}
    {message && <div className="auth-message" role="status"><p>{message}</p><button type="button" aria-label="로그인 알림 닫기" onClick={() => setMessage("")}>닫기</button></div>}
  </div>;
}
