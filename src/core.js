// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 harharhari
/* Pure portable domain logic. Bundled into main.js by scripts/build.mjs. */
"use strict";
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
function validMonth(m) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(m) && +m.slice(0, 4) >= 1970;
}
function daysInMonth(m) {
  if (!validMonth(m)) throw Error("Invalid month: " + m);
  return new Date(Date.UTC(+m.slice(0, 4), +m.slice(5), 0)).getUTCDate();
}
function title(m) {
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
  const val = (k) => p.find((x) => x.type === k).value;
  return `${val("year")}-${val("month")}-${val("day")}`;
}
function shiftMonth(m, n) {
  const d = new Date(Date.UTC(+m.slice(0, 4), +m.slice(5) - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
function stableId(name) {
  let a = 2166136261,
    b = 2246822519;
  for (const ch of name.normalize("NFC")) {
    const c = ch.codePointAt(0);
    a = Math.imul(a ^ c, 16777619) >>> 0;
    b = Math.imul(b ^ c, 3266489917) >>> 0;
  }
  return (
    "h-" + a.toString(16).padStart(8, "0") + b.toString(16).padStart(8, "0")
  );
}
function parseList(text) {
  const lines = text.split(/\r?\n/),
    habits = [],
    warnings = [],
    ids = new Set(),
    names = new Set();
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
    let color = cells[2] || DEFAULT_COLOR;
    if (!/^#[0-9a-f]{6}$/i.test(color)) {
      warnings.push(`Line ${i + 1}: invalid color; using ${DEFAULT_COLOR}.`);
      color = DEFAULT_COLOR;
    }
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
function encode(data) {
  return "```json\n" + JSON.stringify(data, null, 2) + "\n```\n";
}
function decode(text) {
  const m = text.match(/```json\s*\n([\s\S]*?)\n```/);
  if (!m)
    throw Error(
      "Missing structured JSON block. Restore this file from backup.",
    );
  return JSON.parse(m[1]);
}
function page(m) {
  return `# ${title(m)}\n\n\`\`\`habit-calendar\n${m}\n\`\`\`\n`;
}
function validateHabit(h) {
  if (
    !h ||
    !/^[a-zA-Z0-9_-]+$/.test(h.id) ||
    typeof h.name !== "string" ||
    !h.name ||
    !/^#[0-9a-f]{6}$/i.test(h.color) ||
    typeof h.enabled !== "boolean" ||
    !Number.isInteger(h.order)
  )
    throw Error("Invalid habit metadata.");
}
function validateEvent(e, m) {
  if (
    e.schema !== 1 ||
    e.month !== m ||
    !validMonth(m) ||
    !/^[a-zA-Z0-9_-]+$/.test(e.id) ||
    !/^\d{4}-\d\d-\d\dT/.test(e.at) ||
    !Number.isFinite(Date.parse(e.at))
  )
    throw Error("Invalid event metadata.");
  if (["create", "catalog", "reset"].includes(e.type)) {
    if (!Array.isArray(e.habits)) throw Error("Invalid habit list.");
    const seen = new Set();
    e.habits.forEach((h) => {
      validateHabit(h);
      if (seen.has(h.id)) throw Error("Duplicate event habit ID.");
      seen.add(h.id);
    });
  } else if (e.type === "mark") {
    if (
      e.generation !== undefined &&
      e.generation !== null &&
      !/^[a-zA-Z0-9_-]+$/.test(e.generation)
    )
      throw Error("Invalid mark generation.");
    if (
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
function reduce(events, m) {
  const sorted = [...events].sort(
      (a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id),
    ),
    habits = new Map(),
    marks = {};
  const seen = new Set();
  for (const e of sorted) {
    validateEvent(e, m);
    if (seen.has(e.id)) throw Error("Duplicate event ID.");
    seen.add(e.id);
  }
  const resets = sorted.filter((e) => e.type === "reset");
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
  const catalogs = sorted.filter((e) => ["create", "catalog"].includes(e.type));
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
    for (const e of sorted.filter((e) => e.type === "create"))
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
function statistics(state, asOf) {
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
function report(s) {
  const esc = (x) => x.replace(/\|/g, "\\|").replace(/[\r\n]/g, " ");
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
function catalogChanged(state, list) {
  return JSON.stringify(state.catalog || state.habits) !== JSON.stringify(list);
}
function canReplaceReport(previous, state) {
  const ids = new Set(state.sourceIds);
  return !previous || previous.sourceIds.every((id) => ids.has(id));
}
function contrast(hex) {
  const rgb = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722 > 0.179
    ? "#111111"
    : "#FFFFFF";
}
module.exports = {
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
  validateEvent,
  reduce,
  statistics,
  report,
  catalogChanged,
  canReplaceReport,
  contrast,
};
