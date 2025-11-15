import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export const signAccessToken = (payload, opts = {}) =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_TTL || "15m", ...opts });

export const signRefreshToken = (payload, opts = {}) =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_TTL || "7d", ...opts });

export const verifyAccessToken = (token) => jwt.verify(token, ACCESS_SECRET);
export const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);
