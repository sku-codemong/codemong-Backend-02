// src/subject/subject-tasks/dto/subject-tasks.response.dto.js

export const toSubjectTaskResponse = (task) => {
  if (!task) return null;
  return {
    id: task.id,
    user_id: task.user_id,
    subject_id: task.subject_id,
    type: task.type, // 항상 "assignment"
    title: task.title,
    description: task.description,
    due_at: task.due_at,
    estimated_min: task.estimated_min,
    status: task.status,
    created_at: task.created_at,
    updated_at: task.updated_at,
  };
};

export const toSubjectTaskListResponse = (tasks) =>
  tasks.map(toSubjectTaskResponse);
