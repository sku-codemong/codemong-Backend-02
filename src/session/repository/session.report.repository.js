import { prisma } from "../../db.config.js";

export const findSessionsBetween = (user_id, start, end) => {
  return prisma.sessions.findMany({
    where: {
      user_id,
      start_at: { gte: start, lt: end },
    },
    include: {
      subject: true,
    },
    orderBy: { start_at: "asc" },
  });
};

export const findUserSubjects = (user_id) => {
  return prisma.subjects.findMany({
    where: { user_id, archived: false },
  });
};

export const updateUserDailyTarget = (user_id, daily_target_min) => {
  return prisma.users.update({
    where: { id: user_id },
    data: { daily_target_min },
  });
};

export const findUserDailyTarget = (user_id) => {
  return prisma.users.findUnique({
    where: { id: user_id },
    select: { daily_target_min: true },
  });
};

// 특정 유저의 전체 공부 시간(초) 합계
export const getTotalStudySecondsByUserId = (user_id) => {
  return prisma.sessions.aggregate({
    where: {
      user_id,
      status: "stopped", // 종료된 세션 기준
    },
    _sum: {
      duration_sec: true,
    },
  });
};
