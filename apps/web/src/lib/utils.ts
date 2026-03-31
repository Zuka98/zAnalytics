import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatTime(date: Date): string {
	return date.toLocaleTimeString("en-GB", { hour12: false });
}

export function formatDateTime(date: Date): string {
	const time = formatTime(date);
	const d = date.toLocaleDateString("en-GB");
	return `${time} ${d}`;
}
