"use client";
import { useState } from "react";
import Link from "next/link";
import { AuthControl } from "./AuthControl";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="header"><div className="container header-inner">
    <Link className="wordmark" href="/" aria-label="LabSync 홈">Lab<span className="brand-link" aria-hidden="true" />Sync</Link>
    <nav id="main-navigation" className={open ? "navigation is-open" : "navigation"} aria-label="주요 메뉴" onClick={() => setOpen(false)}><a href="#how-it-works">운영 방식</a><a href="#request-assistant">요청 체험</a><a href="#pilot">파일럿 안내</a></nav>
    <AuthControl />
    <button type="button" className="menu-toggle" aria-expanded={open} aria-controls="main-navigation" aria-label={open ? "메뉴 닫기" : "메뉴 열기"} onClick={() => setOpen(!open)} onKeyDown={event => { if (event.key === "Escape") setOpen(false); }}>{open ? "✕" : "☰"}</button>
  </div></header>;
}
