// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 harharhari
/* Pure portable domain logic. Bundled into main.js by scripts/build.mjs. */

export interface Habit {
  id: string;
  name: string;
  enabled: boolean;
  color: string;
  order: number;
}
export type Status = "green" | "pink" | "none";
interface EventBase {
  schema: 1;
  id: string;
  month: string;
  at: string;
}
export interface CatalogEvent extends EventBase {
  type: "create" | "catalog" | "reset";
  habits: Habit[];
}
export interface MarkEvent extends EventBase {
  type: "mark";
  habit: string;
  date: string;
  status: Status;
  generation?: string | null;
}
export type TrackerEvent = CatalogEvent | MarkEvent;
export interface CalendarState {
  month: string;
  generation?: string | null;
  catalog?: Habit[];
  habits: Habit[];
  marks: Record<string, { status: Status; event: string }>;
  sourceIds: string[];
}
export interface HabitStats {
  id: string;
  name: string;
  color: string;
  green: number;
  pink: number;
  unmarked: number;
  completion: number;
  longestStreak: number;
  endingStreak: number;
}
export interface Summary {
  schema: 1;
  month: string;
  asOf: string;
  elapsed: number;
  method: string;
  sourceIds: string[];
  habits: HabitStats[];
  totals: { green: number; pink: number; unmarked: number; completion: number };
  calendarState?: CalendarState | null;
}
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

const DEFAULT_COLOR = "#F8CBAD";
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
function validMonth(m: unknown): m is string {
  return (
    typeof m === "string" &&
    /^\d{4}-(0[1-9]|1[0-2])$/.test(m) &&
    +m.slice(0, 4) >= 1970
  );
}
function daysInMonth(m: string) {
  if (!validMonth(m)) throw Error("Invalid month.");
  return new Date(Date.UTC(+m.slice(0, 4), +m.slice(5), 0)).getUTCDate();
}
function title(m: string) {
  daysInMonth(m);
  return `${m} ${MONTHS[+m.slice(5) - 1]} ${m.slice(0, 4)}`;
}
function today(zone = "Asia/Kolkata", now = new Date()) {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const val = (k: string) => {
    const part = p.find((x) => x.type === k);
    if (!part) throw Error("Missing date component");
    return part.value;
  };
  return `${val("year")}-${val("month")}-${val("day")}`;
}
function shiftMonth(m: string, n: number) {
  const d = new Date(Date.UTC(+m.slice(0, 4), +m.slice(5) - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
function stableId(name: string) {
  let a = 2166136261,
    b = 2246822519;
  for (const ch of name.normalize("NFC")) {
    const c = ch.codePointAt(0) ?? 0;
    a = Math.imul(a ^ c, 16777619) >>> 0;
    b = Math.imul(b ^ c, 3266489917) >>> 0;
  }
  return (
    "h-" + a.toString(16).padStart(8, "0") + b.toString(16).padStart(8, "0")
  );
}
function parseList(text: string) {
  const lines = text.split(/\r?\n/),
    habits: Habit[] = [],
    warnings: string[] = [],
    ids = new Set<string>(),
    names = new Set<string>();
  let table = false,
    found = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith("|")) {
      if (table && line) table = false;
      continue;
    }
    const cells = line
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((x) => x.trim());
    if (
      cells[0].toLowerCase() === "habit" &&
      cells[1]?.toLowerCase() === "generate calendar"
    ) {
      if (cells.length !== 3 || cells[2].toLowerCase() !== "header color")
        throw Error("Use exactly: Habit | Generate calendar | Header color");
      table = true;
      found = true;
      continue;
    }
    if (!table || cells.every((x) => /^:?-+:?$/.test(x))) continue;
    if (cells.length !== 3)
      throw Error(
        `Line ${i + 1}: expected three columns. Do not put | inside a habit name.`,
      );
    const comments =
      cells[0].match(/<!--\s*habit-id:\s*([a-zA-Z0-9_-]+)\s*-->/g) || [];
    if (comments.length > 1) throw Error(`Line ${i + 1}: multiple habit IDs.`);
    const match = cells[0].match(/<!--\s*habit-id:\s*([a-zA-Z0-9_-]+)\s*-->/);
    const name = cells[0]
      .replace(/<!--.*?-->/g, "")
      .trim()
      .normalize("NFC");
    if (!name || name.length > 180)
      throw Error(`Line ${i + 1}: habit name must have 1–180 characters.`);
    if (cells[0].includes("<!--") && !match)
      throw Error(`Line ${i + 1}: invalid habit ID comment.`);
    const id = match ? match[1] : stableId(name);
    if (ids.has(id) || names.has(name))
      throw Error(`Line ${i + 1}: duplicate habit name or ID.`);
    if (!/^[YN]$/i.test(cells[1]))
      throw Error(`Line ${i + 1}: Generate calendar must be Y or N.`);
    const color = cells[2];
    if (!/^#[0-9a-f]{6}$/i.test(color))
      throw Error(
        `Line ${i + 1}: Header color must be a six-digit hex code such as #F8CBAD.`,
      );
    ids.add(id);
    names.add(name);
    habits.push({
      id,
      name,
      enabled: cells[1].toUpperCase() === "Y",
      color: color.toUpperCase(),
      order: habits.length,
    });
    if (!match)
      lines[i] =
        `| ${name} <!-- habit-id: ${id} --> | ${cells[1].toUpperCase()} | ${cells[2]} |`;
  }
  if (!found)
    throw Error(
      "Habit table not found. Required columns: Habit | Generate calendar | Header color.",
    );
  return { habits, warnings, text: lines.join("\n") };
}
function encode(data: unknown) {
  return "```json\n" + JSON.stringify(data, null, 2) + "\n```\n";
}
function decode(text: string) {
  const m = text.match(/```json\s*\n([\s\S]*?)\n```/);
  if (!m)
    throw Error(
      "Missing structured JSON block. Restore this file from backup.",
    );
  const value: unknown = JSON.parse(m[1]);
  return value;
}
function page(m: string) {
  return `# ${title(m)}\n\n\`\`\`habit-calendar\n${m}\n\`\`\`\n`;
}
function validateHabit(h: unknown): asserts h is Habit {
  if (
    !isObject(h) ||
    typeof h.id !== "string" ||
    typeof h.color !== "string" ||
    typeof h.order !== "number" ||
    !/^[a-zA-Z0-9_-]+$/.test(h.id) ||
    typeof h.name !== "string" ||
    !h.name ||
    !/^#[0-9a-f]{6}$/i.test(h.color) ||
    typeof h.enabled !== "boolean" ||
    !Number.isInteger(h.order)
  )
    throw Error("Invalid habit metadata.");
}
function validateEvent(e: unknown, m: string): asserts e is TrackerEvent {
  if (
    !isObject(e) ||
    typeof e.id !== "string" ||
    typeof e.at !== "string" ||
    e.schema !== 1 ||
    e.month !== m ||
    !validMonth(m) ||
    !/^[a-zA-Z0-9_-]+$/.test(e.id) ||
    !/^\d{4}-\d\d-\d\dT/.test(e.at) ||
    !Number.isFinite(Date.parse(e.at))
  )
    throw Error("Invalid event metadata.");
  if (e.type === "create" || e.type === "catalog" || e.type === "reset") {
    if (!isUnknownArray(e.habits)) throw Error("Invalid habit list.");
    const seen = new Set<string>();
    e.habits.forEach((h) => {
      validateHabit(h);
      if (seen.has(h.id)) throw Error("Duplicate event habit ID.");
      seen.add(h.id);
    });
  } else if (e.type === "mark") {
    if (
      e.generation !== undefined &&
      e.generation !== null &&
      (typeof e.generation !== "string" ||
        !/^[a-zA-Z0-9_-]+$/.test(e.generation))
    )
      throw Error("Invalid mark generation.");
    if (
      typeof e.habit !== "string" ||
      typeof e.date !== "string" ||
      typeof e.status !== "string" ||
      !/^[a-zA-Z0-9_-]+$/.test(e.habit) ||
      !["green", "pink", "none"].includes(e.status) ||
      !e.date?.startsWith(m + "-") ||
      !/^\d{4}-\d{2}-\d{2}$/.test(e.date) ||
      +e.date.slice(8) < 1 ||
      +e.date.slice(8) > daysInMonth(m)
    )
      throw Error("Invalid daily mark.");
  } else throw Error("Unknown event type.");
}
function reduce(events: TrackerEvent[], m: string): CalendarState {
  const sorted = [...events].sort(
      (a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id),
    ),
    habits = new Map<string, Habit>(),
    marks: CalendarState["marks"] = {};
  const seen = new Set<string>();
  for (const e of sorted) {
    validateEvent(e, m);
    if (seen.has(e.id)) throw Error("Duplicate event ID.");
    seen.add(e.id);
  }
  const resets = sorted.filter((e): e is CatalogEvent => e.type === "reset");
  const reset = resets[resets.length - 1];
  if (
    sorted.some(
      (e) =>
        e.type === "mark" &&
        e.generation &&
        !resets.some((r) => r.id === e.generation),
    )
  )
    throw Error(
      "A mark arrived before its reset metadata. Wait for sync to finish.",
    );
  const catalogs = sorted.filter(
    (e): e is CatalogEvent => e.type === "create" || e.type === "catalog",
  );
  const catalog = reset
    ? reset.habits
    : catalogs[catalogs.length - 1]?.habits || [];
  if (reset) {
    for (const h of reset.habits) if (h.enabled) habits.set(h.id, { ...h });
    for (const e of sorted) {
      if (e.type === "mark" && e.generation === reset.id && habits.has(e.habit))
        marks[e.habit + "|" + e.date] = { status: e.status, event: e.id };
    }
  } else {
    // Merge concurrent initial snapshots before applying edits; then replay catalog changes.
    for (const e of sorted.filter(
      (e): e is CatalogEvent => e.type === "create",
    ))
      for (const h of e.habits)
        if (h.enabled && !habits.has(h.id)) habits.set(h.id, { ...h });
    for (const e of sorted) {
      if (e.type === "catalog")
        for (const h of e.habits)
          if (habits.has(h.id) || h.enabled) habits.set(h.id, { ...h });
      if (e.type === "mark" && !e.generation)
        marks[e.habit + "|" + e.date] = { status: e.status, event: e.id };
    }
  }
  for (const key of Object.keys(marks))
    if (!habits.has(key.split("|")[0]))
      throw Error(
        "A mark arrived before its habit metadata. Wait for sync to finish.",
      );
  return {
    month: m,
    generation: reset?.id || null,
    catalog,
    habits: [...habits.values()].sort(
      (a, b) => a.order - b.order || a.id.localeCompare(b.id),
    ),
    marks,
    sourceIds: [...seen].sort(),
  };
}
function statistics(state: CalendarState, asOf: string): Summary {
  const m = state.month,
    days = daysInMonth(m),
    elapsed =
      m < asOf.slice(0, 7)
        ? days
        : m === asOf.slice(0, 7)
          ? Math.min(days, +asOf.slice(8))
          : 0;
  const habits = state.habits.map((h) => {
    let green = 0,
      pink = 0,
      run = 0,
      longest = 0;
    for (let d = 1; d <= elapsed; d++) {
      const s =
        state.marks[h.id + "|" + m + "-" + String(d).padStart(2, "0")]?.status;
      if (s === "green") {
        green++;
        run++;
        longest = Math.max(longest, run);
      } else {
        if (s === "pink") pink++;
        run = 0;
      }
    }
    return {
      id: h.id,
      name: h.name,
      color: h.color,
      green,
      pink,
      unmarked: elapsed - green - pink,
      completion: elapsed ? Math.round((green / elapsed) * 10000) / 100 : 0,
      longestStreak: longest,
      endingStreak: run,
    };
  });
  const totals = habits.reduce(
    (a, h) => ({
      green: a.green + h.green,
      pink: a.pink + h.pink,
      unmarked: a.unmarked + h.unmarked,
    }),
    { green: 0, pink: 0, unmarked: 0 },
  );
  const denominator = elapsed * habits.length;
  return {
    schema: 1,
    month: m,
    asOf: m < asOf.slice(0, 7) ? `${m}-${days}` : asOf,
    elapsed,
    method:
      "green / elapsed calendar days; unmarked and pink break streaks; within-month streaks",
    sourceIds: state.sourceIds,
    habits,
    totals: {
      ...totals,
      completion: denominator
        ? Math.round((totals.green / denominator) * 10000) / 100
        : 0,
    },
  };
}
function report(s: Summary) {
  const esc = (x: string) => x.replace(/\|/g, "\\|").replace(/[\r\n]/g, " ");
  return (
    `# ${title(s.month)} — statistics\n\nAs of ${s.asOf}. ${s.elapsed} elapsed days per habit.\n\nCompletion = green days / elapsed calendar days. Pink and unmarked days break streaks. Streaks stay within this month.\n\n| Habit | Green | Pink | Unmarked | Completion | Longest streak | Ending streak |\n|---|---:|---:|---:|---:|---:|---:|\n` +
    s.habits
      .map(
        (h) =>
          `| ${esc(h.name)} | ${h.green} | ${h.pink} | ${h.unmarked} | ${h.completion}% | ${h.longestStreak} | ${h.endingStreak} |`,
      )
      .join("\n") +
    `\n\nTotals: ${s.totals.green} green, ${s.totals.pink} pink, ${s.totals.unmarked} unmarked; ${s.totals.completion}% completion.\n\n## Retained calculation metadata\n\nKeep this section: it prevents incomplete synchronized records from overwriting this report.\n\n` +
    encode(s)
  );
}
function catalogChanged(state: CalendarState, list: Habit[]) {
  return JSON.stringify(state.catalog || state.habits) !== JSON.stringify(list);
}
function canReplaceReport(previous: Summary | null, state: CalendarState) {
  const ids = new Set(state.sourceIds);
  return !previous || previous.sourceIds.every((id) => ids.has(id));
}
function contrast(hex: string) {
  const rgb = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722 > 0.179
    ? "#111111"
    : "#FFFFFF";
}
export {
  DEFAULT_COLOR,
  validMonth,
  daysInMonth,
  title,
  today,
  shiftMonth,
  stableId,
  parseList,
  encode,
  decode,
  page,
  validateHabit,
  validateEvent,
  reduce,
  statistics,
  report,
  catalogChanged,
  canReplaceReport,
  contrast,
};

function strings(value: unknown): value is string[] {
  return isUnknownArray(value) && value.every((v) => typeof v === "string");
}
function count(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
export function validateState(
  value: unknown,
  month: string,
): asserts value is CalendarState {
  if (
    !isObject(value) ||
    value.month !== month ||
    !strings(value.sourceIds) ||
    !isUnknownArray(value.habits) ||
    !isObject(value.marks) ||
    (value.generation !== undefined &&
      value.generation !== null &&
      typeof value.generation !== "string")
  )
    throw Error("Invalid saved calendar. Restore its snapshot from backup.");
  value.habits.forEach(validateHabit);
  if (value.catalog !== undefined) {
    if (!isUnknownArray(value.catalog)) throw Error("Invalid saved catalog.");
    value.catalog.forEach(validateHabit);
  }
  for (const mark of Object.values(value.marks)) {
    if (
      !isObject(mark) ||
      typeof mark.event !== "string" ||
      (mark.status !== "green" &&
        mark.status !== "pink" &&
        mark.status !== "none")
    )
      throw Error("Invalid saved daily mark.");
  }
}
export function validateSummary(
  value: unknown,
  month: string,
): asserts value is Summary {
  if (
    !isObject(value) ||
    value.schema !== 1 ||
    value.month !== month ||
    typeof value.asOf !== "string" ||
    typeof value.method !== "string" ||
    !count(value.elapsed) ||
    !strings(value.sourceIds) ||
    !isUnknownArray(value.habits) ||
    !isObject(value.totals)
  )
    throw Error("Invalid statistics file. Restore its calculation metadata.");
  for (const h of value.habits) {
    if (
      !isObject(h) ||
      typeof h.id !== "string" ||
      typeof h.name !== "string" ||
      typeof h.color !== "string" ||
      ![
        h.green,
        h.pink,
        h.unmarked,
        h.completion,
        h.longestStreak,
        h.endingStreak,
      ].every(count)
    )
      throw Error("Invalid statistics habit totals.");
  }
  if (
    ![
      value.totals.green,
      value.totals.pink,
      value.totals.unmarked,
      value.totals.completion,
    ].every(count)
  )
    throw Error("Invalid statistics totals.");
  if (value.calendarState !== undefined && value.calendarState !== null)
    validateState(value.calendarState, month);
}
export function parseSummary(text: string, month: string): Summary {
  const value = decode(text);
  validateSummary(value, month);
  return value;
}
export interface ArchiveMarker {
  schema: 1 | 2 | 3;
  month: string;
  snapshot?: Summary;
  calendarState?: CalendarState | null;
}
export function parseArchive(text: string, month: string): ArchiveMarker {
  const value = decode(text);
  if (
    !isObject(value) ||
    ![1, 2, 3].includes(Number(value.schema)) ||
    typeof value.schema !== "number" ||
    value.month !== month
  )
    throw Error("Invalid archive marker.");
  if (value.schema >= 2) validateSummary(value.snapshot, month);
  if (value.calendarState !== undefined && value.calendarState !== null)
    validateState(value.calendarState, month);
  // Construct the return value only from validated fields.
  const snapshot = value.snapshot;
  const calendar = value.calendarState;
  if (snapshot !== undefined) validateSummary(snapshot, month);
  if (calendar !== undefined && calendar !== null)
    validateState(calendar, month);
  return {
    schema: value.schema === 1 ? 1 : value.schema === 2 ? 2 : 3,
    month,
    snapshot: snapshot === undefined ? undefined : snapshot,
    calendarState:
      calendar === undefined || calendar === null ? calendar : calendar,
  };
}
