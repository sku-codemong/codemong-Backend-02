// src/auth/dto/auth.response.dto.js

function pick(obj = {}, keys = []) {
  const out = {};
  for (const k of keys) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

/** user 객체를 응답용 형태로 정제 */
export function toUserDTO(user = {}) {
  const base = pick(user, [
    "id",
    "email",
    "nickname",
    "grade",
    "gender",
    "is_completed",
    "created_at",
    "updated_at",
  ]);

  if (base.nickname === undefined) base.nickname = null;
  if (base.grade === undefined) base.grade = null;
  if (base.gender === undefined) base.gender = null;

  return base;
}

/** 회원가입/로그인 공통 성공 응답 */
export function AuthSuccessDTO({ user, accessToken }) {
  return {
    user: toUserDTO(user),
    accessToken,
  };
}

/** 리프레시 재발급 성공 응답 — accessToken만 반환 */
export function RefreshSuccessDTO({ accessToken }) {
  return { accessToken };
}

/** /me 등 단순 유저 조회 응답 */
export function MeSuccessDTO(user) {
  return { user: toUserDTO(user) };
}
