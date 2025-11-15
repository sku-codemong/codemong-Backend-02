// src/subject/subject-tasks/service/subject-tasks.service.js
import { prisma } from "../../db.config.js";
import {
  createSubjectTask,
  findSubjectTasksByUser,
  findSubjectTaskById,
  updateSubjectTask,
  deleteSubjectTask,
} from "../repository/subject-tasks.repository.js";

/**
 * 과제 생성
 * - subject_id가 있으면 해당 과목이 유저 소유인지 검증
 */
export const createSubjectTaskService = async (userId, input) => {
  if (input.subject_id) {
    const subject = await prisma.subjects.findFirst({
      where: { id: input.subject_id, user_id: userId },
    });
    if (!subject) {
      const error = new Error("해당 과목을 찾을 수 없습니다.");
      error.status = 404;
      throw error;
    }
  }

  const task = await createSubjectTask(userId, input);
  return task;
};

/**
 * 과제 목록 조회
 */
export const getSubjectTasksService = async (userId, query) => {
  const subjectId = query.subject_id ? Number(query.subject_id) : undefined;
  const status = query.status; // optional
  const tasks = await findSubjectTasksByUser(userId, { subjectId, status });
  return tasks;
};

/**
 * 과제 단건 조회
 */
export const getSubjectTaskByIdService = async (userId, taskId) => {
  const task = await findSubjectTaskById(userId, taskId);
  if (!task) {
    const error = new Error("과제를 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }
  return task;
};

/**
 * 과제 수정
 */
export const updateSubjectTaskService = async (userId, taskId, input) => {
  // subject_id 수정 시 소유 여부 체크
  if (input.subject_id) {
    const subject = await prisma.subjects.findFirst({
      where: { id: input.subject_id, user_id: userId },
    });
    if (!subject) {
      const error = new Error("해당 과목을 찾을 수 없습니다.");
      error.status = 404;
      throw error;
    }
  }

  const updated = await updateSubjectTask(userId, taskId, input);
  if (!updated) {
    const error = new Error("과제를 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }
  return updated;
};

/**
 * 과제 삭제
 */
export const deleteSubjectTaskService = async (userId, taskId) => {
  const ok = await deleteSubjectTask(userId, taskId);
  if (!ok) {
    const error = new Error("과제를 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }
};
