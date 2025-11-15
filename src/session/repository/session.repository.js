import { prisma } from "../../db.config.js";

// 세션 생성
export const createSession = (user_id, subject_id, start_at) => {
  return prisma.sessions.create({
    data: { user_id, subject_id, start_at, status: "running" },
  });
};

// 세션 종료
export const stopSession = (session_id, end_at, duration_sec) => {
  return prisma.sessions.update({
    where: { id: session_id },
    data: { end_at, duration_sec, status: "stopped" },
  });
};

// 특정 날짜 세션 조회
export const findSessionsByDate = (user_id, start, end) => {
  return prisma.sessions.findMany({
    where: {
      user_id,
      start_at: { gte: start, lt: end },
    },
    orderBy: { start_at: "asc" },
  });
};

// 수동 입력 세션
export const createManualSession = (
  user_id,
  subject_id,
  start_at,
  end_at,
  duration_sec
) => {
  return prisma.sessions.create({
    data: {
      user_id,
      subject_id,
      start_at,
      end_at,
      duration_sec,
      source: "manual",
      status: "stopped",
    },
  });
};

export const updateSessionNote = (session_id, note) => {
  return prisma.sessions.update({
    where: { id: session_id },
    data: { note },
  });
};
