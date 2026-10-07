// Server-only admin credential check. Never shipped to the browser.
const ADMIN_ID = "ANOMITRO";
const ADMIN_PASS = "2007";

export function assertAdmin(id: string, pass: string) {
  if (id.trim().toUpperCase() !== ADMIN_ID || pass !== ADMIN_PASS) {
    throw new Error("Invalid admin ID or password");
  }
}
