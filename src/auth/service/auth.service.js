// src/auth/service/auth.service.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  findUserByEmail,
  createUser,
  findRefreshToken,
  createRefreshToken,
  updateRefreshToken,
  deleteRefreshToken,
  deleteRefreshTokenForUser,
} from "../repository/auth.repository.js";
import { isAllowedSchoolEmail } from "../../utils/domain.js";

// ── Helpers ──────────────────────────────────────────────────────────
const signAT = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_TTL || "15m",
  });

const signRT = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_TTL || "7d",
  });

/**
 * **[Auth]**
 * **<🧠 Service>**
 * ***register***
 * '회원가입' 기능의 서비스 레이어입니다.
 */
export const register = async ({
  email,
  password,
  nickname,
  grade,
  gender,
}) => {
  if (!isAllowedSchoolEmail(email)) {
    const err = new Error("School email required");
    err.status = 400;
    err.code = "NOT_SCHOOL_EMAIL";
    throw err;
  }

  const exists = await findUserByEmail(email);
  if (exists) {
    const err = new Error("Email already in use");
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // createUser는 이제 userSelect로 전체 필요한 필드를 반환함
  const user = await createUser({
    email,
    passwordHash,
    nickname,
    grade,
    gender,
  });

  // 🔽 여기서 필요한 필드 전부 그대로 넘겨주기
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    grade: user.grade,
    gender: user.gender,
    is_completed: user.is_completed, // ✅ 추가
    created_at: user.created_at, // (DTO에서 기대하던 필드)
    updated_at: user.updated_at,
  };
};

/**
 * **[Auth]**
 * **<🧠 Service>**
 * ***login***
 * '로그인' 기능의 서비스 레이어입니다.
 */
export const login = async ({ email, password }) => {
  if (!isAllowedSchoolEmail(email)) {
    const err = new Error("School email required");
    err.status = 400;
    err.code = "NOT_SCHOOL_EMAIL";
    throw err;
  }

  const user = await findUserByEmail(email);
  if (!user) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const accessToken = signAT(user.id);
  const refreshTokenValue = signRT(user.id);
  await createRefreshToken({ userId: user.id, token: refreshTokenValue });

  // 🔽 여기서도 is_completed 포함해서 반환
  return {
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      grade: user.grade,
      gender: user.gender,
      is_completed: user.is_completed, // ✅ 추가
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
    accessToken,
    refreshTokenValue,
  };
};

/**
 * **[Auth]**
 * **<🧠 Service>**
 * ***refresh***
 */
export const refresh = async ({ refreshTokenValue }) => {
  if (!refreshTokenValue) {
    const err = new Error("Missing refresh token");
    err.status = 401;
    throw err;
  }

  let payload;
  try {
    payload = jwt.verify(refreshTokenValue, process.env.JWT_REFRESH_SECRET);
  } catch {
    const err = new Error("Invalid or expired refresh token");
    err.status = 401;
    throw err;
  }

  const row = await findRefreshToken({
    token: refreshTokenValue,
    userId: payload.sub,
  });
  if (!row) {
    const err = new Error("Invalid refresh token");
    err.status = 401;
    throw err;
  }

  const accessToken = signAT(payload.sub);
  const newRefreshTokenValue = signRT(payload.sub);

  await updateRefreshToken({ id: row.id, newToken: newRefreshTokenValue });

  return {
    accessToken,
    refreshTokenValue: newRefreshTokenValue,
  };
};

/**
 * **[Auth]**
 * **<🧠 Service>**
 * ***logout***
 */
export const logout = async ({
  refreshTokenValue,
  allDevices = false,
  userId = null,
}) => {
  if (allDevices && userId != null) {
    await deleteRefreshTokenForUser(userId);
    return;
  }
  if (refreshTokenValue) {
    await deleteRefreshToken(refreshTokenValue);
  }
};

export const authService = { register, login, refresh, logout };
