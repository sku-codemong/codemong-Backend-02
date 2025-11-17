export class SessionResponseDTO {
  constructor(s) {
    this.id = s.id;
    this.user_id = s.user_id;
    this.subject_id = s.subject_id;
    this.start_at = s.start_at;
    this.end_at = s.end_at;
    this.duration_sec = s.duration_sec;
    this.source = s.source;
    this.status = s.status;
    this.note = s.note ?? null;
  }
}

export class SessionListResponseDTO {
  constructor(list) {
    this.sessions = list.map((s) => new SessionResponseDTO(s));
  }
}

export class DailyReportResponseDTO {
  constructor(data) {
    this.date = data.date;
    this.total_duration_min = data.total_duration_min;
    this.by_subject = data.by_subject;
  }
}

export class WeeklyReportResponseDTO {
  constructor(data) {
    this.week_start = data.week_start;
    this.week_end = data.week_end;
    this.total_duration_min = data.total_duration_min;
    this.by_subject = data.by_subject;
  }
}

export class TodayRecommendationResponseDTO {
  constructor(data) {
    this.today = data.today;
    this.daily_target_min = data.daily_target_min;
    this.recommended = data.recommended;
  }
}

export class BaseResponseDTO {
  constructor(ok = true) {
    this.ok = ok;
  }
}

export class TotalStudyTimeResponseDTO {
  constructor({ user_id, total_sec, total_min, total_hour }) {
    this.user_id = user_id;
    this.total_sec = total_sec;
    this.total_min = total_min;
    this.total_hour = total_hour;
  }
}
