import * as repo from "../repository/session.report.repository.js";

export const getDailyReport = async (user_id, dto) => {
  const start = new Date(`${dto.date}T00:00:00`);
  const end = new Date(`${dto.date}T23:59:59`);
  const sessions = await repo.findSessionsBetween(user_id, start, end);

  const by_subject = {};
  for (const s of sessions) {
    const min = Math.floor(s.duration_sec / 60);
    if (!by_subject[s.subject_id]) {
      by_subject[s.subject_id] = {
        subject_id: s.subject_id,
        subject_name: s.subject?.name ?? null,
        duration_min: 0,
      };
    }
    by_subject[s.subject_id].duration_min += min;
  }

  const list = Object.values(by_subject);
  const total = list.reduce((a, b) => a + b.duration_min, 0);

  return {
    date: dto.date,
    total_duration_min: total,
    by_subject: list,
  };
};

export const getWeeklyReport = async (user_id, dto) => {
  const start = new Date(`${dto.week_start}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const sessions = await repo.findSessionsBetween(user_id, start, end);

  const by_subject = {};
  for (const s of sessions) {
    const min = Math.floor(s.duration_sec / 60);
    if (!by_subject[s.subject_id]) {
      by_subject[s.subject_id] = {
        subject_id: s.subject_id,
        subject_name: s.subject?.name ?? null,
        duration_min: 0,
      };
    }
    by_subject[s.subject_id].duration_min += min;
  }

  const list = Object.values(by_subject);
  const total = list.reduce((a, b) => a + b.duration_min, 0);

  return {
    week_start: dto.week_start,
    week_end: new Date(start.getTime() + 6 * 86400000)
      .toISOString()
      .slice(0, 10),
    total_duration_min: total,
    by_subject: list,
  };
};

export const getTodayRecommendation = async (user_id) => {
  const subjects = await repo.findUserSubjects(user_id);
  const userTarget = await repo.findUserDailyTarget(user_id);

  const today = new Date().toISOString().slice(0, 10);
  const daily_target_min = userTarget?.daily_target_min ?? 0;

  // weight 합을 1로 정규화해서 daily_target_min을 분배
  const totalWeight =
    subjects.reduce((sum, s) => sum + Number(s.weight), 0) || 1;

  const recommended = subjects.map((s) => {
    const ratio = Number(s.weight) / totalWeight;
    return {
      subject_id: s.id,
      subject_name: s.name,
      weight: Number(s.weight),
      recommended_min: Math.round(daily_target_min * ratio),
    };
  });

  return { today, daily_target_min, recommended };
};

export const updateDailyTarget = async (user_id, dto) => {
  const updatedUser = await repo.updateUserDailyTarget(
    user_id,
    dto.daily_target_min
  );
  return updatedUser.daily_target_min;
};
