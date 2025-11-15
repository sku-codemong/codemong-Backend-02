import { prisma } from "../../db.config.js";

// 클라이언트로 보내도 되는 필드들 (안전 필드)
const userSelectSafe = {
  id: true,
  email: true,
  nickname: true,
  grade: true,
  gender: true,
  is_completed: true,
  created_at: true,
  updated_at: true,
};

// 로그인 검증용: 비밀번호 해시까지 포함
const userSelectWithPassword = {
  ...userSelectSafe,
  password_hash: true,
};

/**
 * **[Auth]**
 * **<📦 Repository>**
 * ***findUserByEmail***
 * '이메일로 유저 조회' 기능의 레포지토리 레이어입니다.
 * 로그인/중복검사에 사용되며, 비밀번호 검증을 위해 password_hash도 조회합니다.
 */
export const findUserByEmail = (email) => {
  return prisma.users.findUnique({
    where: { email },
    select: userSelectWithPassword, // ✅ 비번 해시 포함
  });
};

/**
 * **[Auth]**
 * **<📦 Repository>**
 * ***findUserById***
 * 'ID로 유저 조회' 기능의 레포지토리 레이어입니다.
 * /me 같은 응답용으로 사용되며, password_hash는 포함하지 않습니다.
 */
export const findUserById = (id) => {
  return prisma.users.findUnique({
    where: { id },
    select: userSelectSafe, // ✅ 안전 필드만
  });
};

/**
 * **[Auth]**
 * **<📦 Repository>**
 * ***createUser***
 * '회원가입' 기능의 레포지토리 레이어입니다.
 * 새 유저를 만들고, 클라이언트 응답용 필드만 반환합니다.
 */
export const createUser = ({
  email,
  passwordHash,
  nickname,
  grade,
  gender,
}) => {
  return prisma.users.create({
    data: {
      email,
      password_hash: passwordHash,
      nickname,
      grade,
      gender,
    },
    select: userSelectSafe, // ✅ 안전 필드만
  });
};

/**
 * **[Auth]**
 * **<📦 Repository>**
 * ***createRefreshToken***
 */
export const createRefreshToken = ({ userId, token }) => {
  return prisma.refresh_token.create({
    data: {
      user_id: userId,
      token,
    },
    select: { id: true, user_id: true, updated_at: true },
  });
};

/**
 * **[Auth]**
 * **<📦 Repository>**
 * ***findRefreshToken***
 */
export const findRefreshToken = ({ token, userId }) => {
  return prisma.refresh_token.findFirst({
    where: userId ? { token, user_id: userId } : { token },
    orderBy: { updated_at: "desc" },
  });
};

/**
 * **[Auth]**
 * **<📦 Repository>**
 * ***updateRefreshToken***
 */
export const updateRefreshToken = ({ id, newToken }) => {
  return prisma.refresh_token.update({
    where: { id },
    data: { token: newToken },
    select: { id: true, updated_at: true },
  });
};

/**
 * **[Auth]**
 * **<📦 Repository>**
 * ***deleteRefreshToken***
 */
export const deleteRefreshToken = (token) => {
  return prisma.refresh_token.deleteMany({
    where: { token },
  });
};

/**
 * **[Auth]**
 * **<📦 Repository>**
 * ***deleteRefreshTokenForUser***
 */
export const deleteRefreshTokenForUser = (userId) => {
  return prisma.refresh_token.deleteMany({
    where: { user_id: userId },
  });
};
