export function getAllowedDomains() {
  const raw = process.env.ALLOWED_EMAIL_DOMAINS || "";
  return raw
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

export function extractDomain(email = "") {
  const at = email.lastIndexOf("@");
  if (at === -1) return "";
  return email.slice(at + 1).toLowerCase();
}

export function isAllowedSchoolEmail(email) {
  const domain = extractDomain(email);
  const allowed = getAllowedDomains();
  if (allowed.length === 0) return true; // 설정이 없으면 통과
  return allowed.includes(domain);
}
