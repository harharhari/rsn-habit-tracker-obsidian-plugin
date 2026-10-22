"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict");
const C = require("../src/core");
const h = {
  id: "h-walk",
  name: "Walking",
  enabled: true,
  color: "#F8CBAD",
  order: 0,
};
let number = 0;
const event = (type, extra = {}, month = "2026-10") => ({
  schema: 1,
  id: "e" + ++number,
  at: `2026-10-01T00:00:${String(number % 60).padStart(2, "0")}.000Z`,
  month,
  type,
  ...extra,
});
test("month title, leap years, Monday offsets and timezone boundary", () => {
  assert.equal(C.title("2026-10"), "2026-10 October 2026");
  assert.equal(C.daysInMonth("2028-02"), 29);
  assert.equal(C.daysInMonth("2026-02"), 28);
  assert.equal(C.shiftMonth("2026-12", 1), "2027-01");
  assert.equal(
    C.today("Asia/Kolkata", new Date("2026-09-30T18:30:00Z")),
    "2026-10-01",
  );
  assert.throws(() => C.daysInMonth("2026-13"));
});
test("three-column parsing assigns stable IDs, preserves rename identity, validates flags and colors", () => {
  const raw =
    "| Habit | Generate calendar | Header color |\n|---|---|---|\n| Walking | Y | #ffe699 |\n| Yoga | N | invalid |";
  const a = C.parseList(raw),
    b = C.parseList(a.text.replace("Walking", "Daily walking"));
  assert.equal(a.habits.length, 2);
  assert.equal(a.habits[0].color, "#FFE699");
  assert.equal(a.habits[1].enabled, false);
  assert.equal(a.warnings.length, 1);
  assert.equal(b.habits[0].id, a.habits[0].id);
  assert.equal(C.parseList(a.text).text, a.text);
  assert.throws(() => C.parseList(raw.replace("| N |", "| maybe |")));
  assert.throws(() => C.parseList(raw + "\n| Walking | Y | |"));
});
test("catalog adds full-month habits and retains disabled/deleted ones; older snapshot unchanged", () => {
  const create = event("create", { habits: [h] }),
    added = { ...h, id: "h-read", name: "Reading", order: 1 };
  const catalog = event("catalog", {
    habits: [{ ...h, name: "Walk", enabled: false, color: "#FFE699" }, added],
  });
  const old = C.reduce([create], "2026-10"),
    current = C.reduce([catalog, create], "2026-10");
  assert.equal(old.habits[0].name, "Walking");
  assert.deepEqual(
    current.habits.map((x) => x.name),
    ["Walk", "Reading"],
  );
  assert.equal(
    C.reduce([create, catalog, event("catalog", { habits: [] })], "2026-10")
      .habits.length,
    2,
  );
  assert.equal(
    C.reduce(
      [
        event(
          "create",
          { habits: [{ ...h, enabled: false }, added] },
          "2026-11",
        ),
      ],
      "2026-11",
    ).habits.length,
    1,
  );
});
test("offline records merge; same-day conflicts resolve deterministically; none clears a mark", () => {
  const events = [
    event("create", { habits: [h] }),
    event("mark", { habit: h.id, date: "2026-10-01", status: "green" }),
    event("mark", { habit: h.id, date: "2026-10-02", status: "pink" }),
    event("mark", { habit: h.id, date: "2026-10-01", status: "pink" }),
  ];
  assert.deepEqual(
    C.reduce(events, "2026-10"),
    C.reduce([...events].reverse(), "2026-10"),
  );
  assert.equal(
    C.reduce(events, "2026-10").marks["h-walk|2026-10-01"].status,
    "pink",
  );
  const clear = event("mark", {
    habit: h.id,
    date: "2026-10-01",
    status: "none",
  });
  assert.equal(
    C.reduce([...events, clear], "2026-10").marks["h-walk|2026-10-01"].status,
    "none",
  );
});
test("concurrent creation preserves union and later metadata", () => {
  const a = event("create", { habits: [h] }),
    b = event("create", { habits: [h, { ...h, id: "h-other" }] }),
    c = event("catalog", { habits: [{ ...h, name: "Renamed" }] });
  assert.equal(C.reduce([c, b, a], "2026-10").habits.length, 2);
  assert.equal(
    C.reduce([a, b, c], "2026-10").habits.find((x) => x.id === h.id).name,
    "Renamed",
  );
});
test("daily percentages and within-month streaks; blank/pink break; future days excluded", () => {
  const events = [event("create", { habits: [h] })];
  for (const [day, status] of [
    [1, "green"],
    [2, "green"],
    [3, "pink"],
    [5, "green"],
    [6, "green"],
    [7, "green"],
  ])
    events.push(
      event("mark", { habit: h.id, date: `2026-10-0${day}`, status }),
    );
  const state = C.reduce(events, "2026-10"),
    s = C.statistics(state, "2026-10-07");
  assert.deepEqual(
    [
      s.habits[0].green,
      s.habits[0].pink,
      s.habits[0].unmarked,
      s.habits[0].completion,
      s.habits[0].longestStreak,
      s.habits[0].endingStreak,
    ],
    [5, 1, 1, 71.43, 3, 3],
  );
  assert.equal(C.statistics(state, "2026-10-08").habits[0].endingStreak, 0);
  assert.equal(C.statistics(state, "2026-11-01").elapsed, 31);
  assert.equal(C.statistics(state, "2026-09-30").elapsed, 0);
  assert.deepEqual(C.decode(C.report(s)), s);
});
test("deleted or not-yet-synced source records cannot replace saved statistics", () => {
  const create = event("create", { habits: [h] }),
    mark = event("mark", { habit: h.id, date: "2026-10-01", status: "green" }),
    state = C.reduce([create, mark], "2026-10"),
    s = C.statistics(state, "2026-10-01");
  assert.equal(C.canReplaceReport(s, C.reduce([create], "2026-10")), false);
  assert.equal(C.canReplaceReport(s, state), true);
});
test("malformed records are rejected instead of silently dropping marks", () => {
  assert.throws(() =>
    C.reduce(
      [event("mark", { habit: h.id, date: "2026-10-32", status: "green" })],
      "2026-10",
    ),
  );
  assert.throws(() =>
    C.reduce(
      [event("mark", { habit: h.id, date: "2026-10-01", status: "green" })],
      "2026-10",
    ),
  );
  assert.throws(() => C.decode("bad"));
  assert.equal(C.contrast("#000000"), "#FFFFFF");
  assert.equal(C.contrast("#FFFFFF"), "#111111");
});
test("60 calendars and 1,860 day actions reduce and report correctly", () => {
  const habits = Array.from({ length: 60 }, (_, i) => ({
    ...h,
    id: "h" + i,
    order: i,
  }));
  const events = [
    {
      schema: 1,
      id: "create",
      at: "2026-10-01T00:00:00Z",
      type: "create",
      month: "2026-10",
      habits,
    },
  ];
  for (const habit of habits)
    for (let d = 1; d <= 31; d++)
      events.push({
        schema: 1,
        id: `${habit.id}-${d}`,
        at: "2026-10-31T00:00:00Z",
        type: "mark",
        month: "2026-10",
        habit: habit.id,
        date: `2026-10-${String(d).padStart(2, "0")}`,
        status: "green",
      });
  const summary = C.statistics(C.reduce(events, "2026-10"), "2026-11-01");
  assert.equal(summary.habits.length, 60);
  assert.equal(summary.totals.green, 1860);
  assert.equal(summary.totals.completion, 100);
  assert.equal(summary.habits[59].longestStreak, 31);
});

test("reset replaces catalog, drops marks, and ignores offline writes from other revisions", () => {
  const create = event("create", { habits: [h] });
  const old = event("mark", {
    habit: h.id,
    date: "2026-10-01",
    status: "green",
  });
  const reset = event("reset", {
    habits: [{ ...h, name: "Walk", color: "#123456" }],
  });
  const late = event("mark", {
    habit: h.id,
    date: "2026-10-01",
    status: "pink",
  });
  let state = C.reduce([create, old, reset, late], "2026-10");
  assert.equal(Object.keys(state.marks).length, 0);
  assert.equal(state.habits[0].name, "Walk");
  const mark = event("mark", {
    habit: h.id,
    date: "2026-10-01",
    status: "green",
    generation: reset.id,
  });
  state = C.reduce([create, old, reset, late, mark], "2026-10");
  assert.equal(Object.keys(state.marks).length, 1);
  const next = event("reset", { habits: [{ ...h, enabled: false }] });
  assert.equal(
    C.reduce([create, old, reset, next, mark], "2026-10").habits.length,
    0,
  );
  assert.throws(() => C.reduce([create, mark], "2026-10"), /reset metadata/);
});
test("deleting a row or changing an N row is a catalog change; formatting alone is not", () => {
  const list = [h, { ...h, id: "h-no", enabled: false, order: 1 }];
  const state = C.reduce([event("create", { habits: list })], "2026-10");
  assert.equal(C.catalogChanged(state, list), false);
  assert.equal(C.catalogChanged(state, [h]), true);
  assert.equal(
    C.catalogChanged(state, [h, { ...list[1], color: "#000000" }]),
    true,
  );
});
