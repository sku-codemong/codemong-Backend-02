export class StartSessionRequestDTO {
  constructor({ subject_id }) {
    this.subject_id = Number(subject_id);
  }
}

export class StopSessionRequestDTO {
  constructor({ session_id }) {
    this.session_id = Number(session_id);
  }
}

export class ManualSessionRequestDTO {
  constructor({ subject_id, start_at, end_at }) {
    this.subject_id = Number(subject_id);
    this.start_at = new Date(start_at);
    this.end_at = new Date(end_at);
  }
}

export class ListSessionRequestDTO {
  constructor({ date }) {
    this.date = date;
  }
}

export class DailyReportRequestDTO {
  constructor({ date }) {
    this.date = date;
  }
}

export class WeeklyReportRequestDTO {
  constructor({ week_start }) {
    this.week_start = week_start;
  }
}

export class UpdateDailyTargetRequestDTO {
  constructor({ daily_target_min }) {
    this.daily_target_min = Number(daily_target_min);
  }
}

export class UpdateSessionNoteRequestDTO {
  constructor({ note }) {
    // 빈 값 들어와도 문자열로 맞춰줌
    this.note = typeof note === "string" ? note : "";
  }
}
