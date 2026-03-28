export type Role = "admin" | "user";

export function isAdmin(role: string | undefined): boolean {
	return role === "admin";
}
