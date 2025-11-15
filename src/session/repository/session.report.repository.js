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
