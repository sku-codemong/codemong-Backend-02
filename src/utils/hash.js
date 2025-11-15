import bcrypt from "bcrypt";
const ROUNDS = 12;

export const hashPassword = (plain) => bcrypt.hash(plain, ROUNDS);
export const comparePassword = (plain, hashed) => bcrypt.compare(plain, hashed);
