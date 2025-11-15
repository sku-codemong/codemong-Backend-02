// src/subject/subject-tasks/dto/subject-tasks.request.dto.js

/**
 * POST /api/subject-tasks
 * 요청 Body -> 서비스 input
 */
export const toCreateSubjectTaskInput = (body) => {
  const {
    subject_id,
    title,
    description,
    due_at,
    estimated_min,
  } = body;

  return {
    // subject_id는 optional
    ...(subject_id && { subject_id: Number(subject_id) }),
    title,
    description: description ?? null,
    due_at: due_at ? new Date(due_at) : null,
    estimated_min: estimated_min ? Number(estimated_min) : null,
  };
};

/**
 * PATCH /api/subject-tasks/:id
 * 요청 Body -> 서비스 input (모두 optional)
 */
export const toUpdateSubjectTaskInput = (body) => {
  const data = {};
  if (body.subject_id !== undefined) data.subject_id = body.subject_id ? Number(body.subject_id) : null;
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description ?? null;
  if (body.due_at !== undefined) data.due_at = body.due_at ? new Date(body.due_at) : null;
  if (body.estimated_min !== undefined) {
    data.estimated_min = body.estimated_min ? Number(body.estimated_min) : null;
  }
  if (body.status !== undefined) data.status = body.status; // "todo" | "in_progress" | "done"

  return data;
};
