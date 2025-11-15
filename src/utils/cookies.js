// src/utils/cookies.js

// ── 1) TTL 문자열 → ms 변환 ("7d" | "12h" | "30m" | "45s" | "5000ms" | "3600")
export function parseTTL(v) {
  if (v == null) return 0;
  if (typeof v === "number") return v; // 이미 ms면 그대로
  const s = String(v).trim();
  if (/^\d+$/.test(s)) return Number(s) * 1000; // 숫자만 오면 '초'로 보고 ms 변환
  const m = s.match(/^(\d+)\s*(ms|s|m|h|d)$/i);
  if (!m) throw new Error(`Invalid TTL format: ${v}`);
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  const factor = { ms: 1, s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[
    unit
  ];
  return n * factor;
}

// ── 2) 환경별 공통
const isProd = process.env.NODE_ENV === "production";
const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || "15m";
const REFRESH_TTL = process.env.REFRESH_TOKEN_TTL || "7d";

// 로컬에서는 domain을 넣지 않는 게 안전함(브라우저가 막는 경우 多)
function resolveDomain() {
  const d = process.env.COOKIE_DOMAIN?.trim();
  if (!d || d === "localhost" || d === "127.0.0.1") return undefined;
  return d;
}
const cookieDomain = resolveDomain();

// ── 3) 쿠키 이름
export const accessCookieName = "at";
export const refreshCookieName = "rt";

// ── 4) 옵션 (SameSite/secure 규칙 일관화)
// * cross-site(SPA 다른 도메인)면 SameSite=None + secure:true 필수
// * same-origin이면 Lax로도 충분
// 필요 시 환경변수 COOKIE_SAMESITE/COOKIE_SECURE로 강제 가능
const sameSite = (
  process.env.COOKIE_SAMESITE ?? (isProd ? "none" : "lax")
).toLowerCase(); // 'none'|'lax'|'strict'
const secure =
  (
    process.env.COOKIE_SECURE ?? (sameSite === "none" ? "true" : String(isProd))
  ).toString() === "true";

// 공통 base
const base = {
  httpOnly: true,
  sameSite, // 'none'이면 반드시 secure:true
  secure,
  domain: cookieDomain, // 로컬이면 undefined로 빠짐
};

// ── 5) 개별 쿠키 옵션
export const accessCookieOptions = {
  ...base,
  path: "/", // 전역
  maxAge: parseTTL(ACCESS_TTL),
};

export const refreshCookieOptions = {
  ...base,
  // refresh 라우트만 쓰고 싶으면 "/api/auth"로, 전역에서 회수하면 "/" 권장
  path: "/",
  maxAge: parseTTL(REFRESH_TTL),
};

// ── 6) 편의 함수
export function setAuthCookies(res, accessToken, refreshToken) {
  if (accessToken != null) {
    res.cookie(accessCookieName, accessToken, accessCookieOptions);
  }
  if (refreshToken != null) {
    res.cookie(refreshCookieName, refreshToken, refreshCookieOptions);
  }
}

export function clearAuthCookies(res) {
  res.clearCookie(accessCookieName, { ...accessCookieOptions, maxAge: 0 });
  res.clearCookie(refreshCookieName, { ...refreshCookieOptions, maxAge: 0 });
}
