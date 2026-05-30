import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conflict resolution */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format minutes into human-readable duration */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/** Create URL-safe slug from title */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/** Debounce helper for search inputs */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Scale ingredient quantity based on serving size */
export function scaleQuantity(
  quantity: number,
  originalServings: number,
  targetServings: number
): number {
  if (originalServings <= 0) return quantity;
  const scaled = (quantity * targetServings) / originalServings;
  return Math.round(scaled * 100) / 100;
}

/** Get start of week (Monday) for a given date */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Parse search params into typed filter object */
export function parseSearchParams(searchParams: URLSearchParams) {
  return {
    q: searchParams.get("q") ?? "",
    ingredients: searchParams.get("ingredients")?.split(",").filter(Boolean) ?? [],
    cuisine: searchParams.get("cuisine") ?? "",
    diet: searchParams.get("diet")?.split(",").filter(Boolean) ?? [],
    maxPrepTime: Number(searchParams.get("maxPrepTime") ?? 180),
    difficulty: searchParams.get("difficulty") ?? "",
    page: Number(searchParams.get("page") ?? 1),
  };
}

/** Build shareable URL from filter state */
export function buildFilterUrl(
  base: string,
  filters: ReturnType<typeof parseSearchParams>
): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.ingredients.length) params.set("ingredients", filters.ingredients.join(","));
  if (filters.cuisine) params.set("cuisine", filters.cuisine);
  if (filters.diet.length) params.set("diet", filters.diet.join(","));
  if (filters.maxPrepTime !== 180) params.set("maxPrepTime", String(filters.maxPrepTime));
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  if (filters.page > 1) params.set("page", String(filters.page));
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
