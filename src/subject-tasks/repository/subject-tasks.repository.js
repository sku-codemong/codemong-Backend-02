// src/subject/subject-tasks/repository/subject-tasks.repository.js
import { prisma } from "../../db.config.js";

/**
 * 과제 생성
 */
export const createSubjectTask = async (userId, data) => {
  return prisma.subject_tasks.create({
    data: {
      user_id: userId,
      ...data,
    },
  });
};

/**
 * 과제 목록 조회 (해당 유저 전체)
 * - 옵션: subject_id, status로 필터링
 */
export const findSubjectTasksByUser = async (
  userId,
  { subjectId, status } = {}
) => {
  return prisma.subject_tasks.findMany({
    where: {
      user_id: userId,
      ...(subjectId && { subject_id: subjectId }),
      ...(status && { status }),
    },
    orderBy: [{ due_at: "asc" }, { created_at: "asc" }],
  });
};

/**
 * 과제 단건 조회 (유저 소유 검증 포함)
 */
export const findSubjectTaskById = async (userId, taskId) => {
  return prisma.subject_tasks.findFirst({
    where: {
      id: taskId,
      user_id: userId,
    },
  });
};

/**
 * 과제 수정
 */
export const updateSubjectTask = async (userId, taskId, data) => {
  // 먼저 이 유저의 과제인지 확인
  const exists = await prisma.subject_tasks.findFirst({
    where: { id: taskId, user_id: userId },
  });
  if (!exists) return null;

  return prisma.subject_tasks.update({
    where: { id: taskId },
    data,
  });
};

/**
 * 과제 삭제
 */
export const deleteSubjectTask = async (userId, taskId) => {
  const exists = await prisma.subject_tasks.findFirst({
    where: { id: taskId, user_id: userId },
  });
  if (!exists) return null;

  await prisma.subject_tasks.delete({
    where: { id: taskId },
  });

  return true;
};
