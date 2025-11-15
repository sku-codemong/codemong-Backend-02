// src/subject/subject-tasks/controller/subject-tasks.controller.js
import {
  toCreateSubjectTaskInput,
  toUpdateSubjectTaskInput,
} from "../dto/subject-tasks.request.dto.js";
import {
  toSubjectTaskResponse,
  toSubjectTaskListResponse,
} from "../dto/subject-tasks.response.dto.js";
import {
  createSubjectTaskService,
  getSubjectTasksService,
  getSubjectTaskByIdService,
  updateSubjectTaskService,
  deleteSubjectTaskService,
} from "../service/subject-tasks.service.js";

/**
 * 과제 생성
 */
export const createSubjectTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const input = toCreateSubjectTaskInput(req.body);
    const task = await createSubjectTaskService(userId, input);

    return res.status(201).json({
      ok: true,
      task: toSubjectTaskResponse(task),
    });
  } catch (err) {
    console.error(err);
    return res
      .status(err.status || 500)
      .json({ ok: false, message: err.message || "서버 오류가 발생했습니다." });
  }
};

/**
 * 과제 목록 조회
 */
export const getSubjectTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await getSubjectTasksService(userId, req.query);

    return res.json({
      ok: true,
      tasks: toSubjectTaskListResponse(tasks),
    });
  } catch (err) {
    console.error(err);
    return res
      .status(err.status || 500)
      .json({ ok: false, message: err.message || "서버 오류가 발생했습니다." });
  }
};

/**
 * 과제 단건 조회
 */
export const getSubjectTaskById = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = Number(req.params.id);
    const task = await getSubjectTaskByIdService(userId, taskId);

    return res.json({
      ok: true,
      task: toSubjectTaskResponse(task),
    });
  } catch (err) {
    console.error(err);
    return res
      .status(err.status || 500)
      .json({ ok: false, message: err.message || "서버 오류가 발생했습니다." });
  }
};

/**
 * 과제 수정
 */
export const updateSubjectTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = Number(req.params.id);
    const input = toUpdateSubjectTaskInput(req.body);

    const updated = await updateSubjectTaskService(userId, taskId, input);

    return res.json({
      ok: true,
      task: toSubjectTaskResponse(updated),
    });
  } catch (err) {
    console.error(err);
    return res
      .status(err.status || 500)
      .json({ ok: false, message: err.message || "서버 오류가 발생했습니다." });
  }
};

/**
 * 과제 삭제
 */
export const deleteSubjectTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = Number(req.params.id);

    await deleteSubjectTaskService(userId, taskId);

    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res
      .status(err.status || 500)
      .json({ ok: false, message: err.message || "서버 오류가 발생했습니다." });
  }
};
