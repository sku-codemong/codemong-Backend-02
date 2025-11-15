import * as service from "../service/session.service.js";
import {
  StartSessionRequestDTO,
  StopSessionRequestDTO,
  ManualSessionRequestDTO,
  ListSessionRequestDTO,
  UpdateSessionNoteRequestDTO,
} from "../dto/session.request.dto.js";
import {
  SessionResponseDTO,
  SessionListResponseDTO,
} from "../dto/session.response.dto.js";

export const start = async (req, res) => {
  const dto = new StartSessionRequestDTO(req.body);
  const user_id = req.user.id;

  const session = await service.startSession(user_id, dto);
  return res.json({ ok: true, session: new SessionResponseDTO(session) });
};

export const stop = async (req, res) => {
  const dto = new StopSessionRequestDTO(req.body);
  const session = await service.stopSession(dto);
  return res.json({ ok: true, session: new SessionResponseDTO(session) });
};

export const manual = async (req, res) => {
  const user_id = req.user.id;
  const dto = new ManualSessionRequestDTO(req.body);
  const session = await service.manualSession(user_id, dto);
  return res.json({ ok: true, session: new SessionResponseDTO(session) });
};

export const list = async (req, res) => {
  const dto = new ListSessionRequestDTO(req.query);
  const sessions = await service.getSessionsByDate(req.user.id, dto);
  return res.json({ ok: true, ...new SessionListResponseDTO(sessions) });
};

export const updateNote = async (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    const userId = req.user.id;
    const dto = new UpdateSessionNoteRequestDTO(req.body);

    const session = await service.updateSessionNote(userId, sessionId, dto);
    return res.json({ ok: true, session: new SessionResponseDTO(session) });
  } catch (err) {
    return res.status(400).json({ ok: false, message: err.message });
  }
};
