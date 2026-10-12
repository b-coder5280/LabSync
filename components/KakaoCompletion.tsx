"use client";
import { useEffect, useRef, useState } from 'react';
import { signInWithCustomToken } from 'firebase/auth';
import { prepareAuth } from '@/lib/firebase-client';

const messages: Record<string, string> = {
  cancelled: '카카오 로그인이 취소되었습니다.', 'invalid-state': '로그인 요청이 만료되었거나 일치하지 않습니다. 처음부터 다시 시도해 주세요.',
  'token-exchange-failed': '카카오 인증 코드를 확인하지 못했습니다. 다시 시도해 주세요.',
  'profile-failed': '카카오 계정을 확인하지 못했습니다.', 'user-disabled': '사용이 중지된 계정입니다. 운영자에게 문의해 주세요.',
  'missing-code': '인증 코드가 없습니다. 다시 로그인해 주세요.', 'invalid-identity': '카카오 계정 식별자를 확인하지 못했습니다.',
  'server-error': '서버의 로그인 연결 설정을 확인 중입니다.', 'provider-error': '카카오 인증 제공업체에서 오류가 발생했습니다.',
};
export function KakaoCompletion() {
  const [message, setMessage] = useState('카카오 인증 결과를 확인하고 있습니다…');
  const task = useRef<Promise<void> | null>(null);
  useEffect(() => {
    let active = true;
    async function complete() {
      const reason = new URLSearchParams(location.search).get('error');
      if (reason) throw new Error(`${messages[reason] || '카카오 로그인을 완료하지 못했습니다.'} (kakao/${Object.hasOwn(messages, reason) ? reason : 'unknown-error'})`);
      const auth = await prepareAuth();
      const response = await fetch('/api/auth/kakao/session', { method: 'POST', credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) throw new Error('로그인 연결이 만료되었거나 준비되지 않았습니다. 홈페이지에서 다시 시도해 주세요.');
      const result = await response.json();
      await signInWithCustomToken(auth, result.token);
      location.replace(result.returnTo || '/');
    }
    task.current ??= complete();
    task.current.catch(error => { if (active) setMessage(error instanceof Error ? error.message : '카카오 로그인에 실패했습니다.'); });
    return () => { active = false; };
  }, []);
  return <p role="status">{message}</p>;
}
