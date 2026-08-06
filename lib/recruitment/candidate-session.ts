import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'candidate_session';
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function secret() {
  return process.env.CANDIDATE_SESSION_SECRET || process.env.NEXTAUTH_SECRET || 'candidate-session-development-secret';
}

function sign(value: string) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}

export function createCandidateSession(email: string) {
  const payload = Buffer.from(JSON.stringify({ email: email.toLowerCase(), exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function getCandidateSession(request: Request | NextRequest): { email: string } | null {
  const raw = request.headers.get('cookie')?.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`))?.[1];
  if (!raw) return null;
  const [payload, signature] = raw.split('.');
  const expected = payload ? sign(payload) : '';
  if (!payload || !signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return parsed.email && Number(parsed.exp) > Math.floor(Date.now() / 1000) ? { email: String(parsed.email).toLowerCase() } : null;
  } catch { return null; }
}

export function setCandidateSession(response: NextResponse, email: string) {
  response.cookies.set(COOKIE_NAME, createCandidateSession(email), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: MAX_AGE_SECONDS });
  response.cookies.delete('candidate_session_email');
}

export function clearCandidateSession(response: NextResponse) {
  response.cookies.delete(COOKIE_NAME);
  response.cookies.delete('candidate_session_email');
}
