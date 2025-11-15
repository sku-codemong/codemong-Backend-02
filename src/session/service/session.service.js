import * as repo from "../repository/session.repository.js";
import { prisma } from "../../db.config.js";

export const startSession = async (user_id, dto) => {
  return await repo.createSession(user_id, dto.subject_id, new Date());
};

export const stopSession = async (dto) => {
  const session = await prisma.sessions.findUnique({
    where: { id: dto.session_id },
  });
  if (!session) throw new Error("세션을 찾을 수 없습니다.");

  const end_at = new Date();
  const duration_sec = Math.floor((end_at - session.start_at) / 1000);

  return await repo.stopSession(dto.session_id, end_at, duration_sec);
};

export const manualSession = async (user_id, dto) => {
  const duration_sec = Math.floor((dto.end_at - dto.start_at) / 1000);
  return await repo.createManualSession(
    user_id,
    dto.subject_id,
    dto.start_at,
    dto.end_at,
    duration_sec
  );
};

export const getSessionsByDate = async (user_id, dto) => {
  const start = new Date(`${dto.date}T00:00:00`);
  const end = new Date(`${dto.date}T23:59:59`);
  return await repo.findSessionsByDate(user_id, start, end);
};

export const updateSessionNote = async (user_id, session_id, dto) => {
  // 세션이 내 것인지 먼저 확인
  const session = await prisma.sessions.findFirst({
    where: { id: session_id, user_id },
  });

  if (!session) {
    throw new Error("세션을 찾을 수 없거나 권한이 없습니다.");
  }

  const updated = await repo.updateSessionNote(session_id, dto.note);
  return updated;
};
