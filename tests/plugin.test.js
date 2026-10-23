"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm"),
  crypto = require("node:crypto");
const C = require("../src/core");
class Vault {
  constructor() {
    this.files = new Map();
    this.handlers = {};
  }
  getFiles() {
    return [...this.files.values()].filter((f) => f.extension !== undefined);
  }
  getAbstractFileByPath(p) {
    return this.files.get(p) || null;
  }
  async createFolder(p) {
    if (this.files.has(p)) throw Error("exists");
    this.files.set(p, { path: p });
  }
  async create(p, text) {
    if (this.files.has(p)) throw Error("exists");
    const f = {
      path: p,
      basename: p.split("/").pop().replace(/\.md$/, ""),
      extension: p.split(".").pop(),
      text,
    };
    this.files.set(p, f);
    return f;
  }
  async read(f) {
    if (!this.files.has(f.path)) throw Error("missing");
    return f.text;
  }
  async modify(f, text) {
    f.text = text;
  }
  async process(f, fn) {
    f.text = fn(f.text);
    return f.text;
  }
}
class Element {
  constructor(tag) {
    this.tag = tag;
    this.children = [];
    this.handlers = {};
    this.classList = { add() {} };
    this.ownerDocument = { createElement: (tag) => new Element(tag) };
  }
  appendChild(child) {
    this.children.push(child);
    return child;
  }
  replaceChildren() {
    this.children = [];
  }
  addEventListener(event, callback) {
    this.handlers[event] = callback;
  }
  setAttribute(name, value) {
    this[name] = value;
  }
  focus() {
    this.focused = true;
  }
}
class TestModal {
  constructor() {
    this.contentEl = new Element("div");
  }
  open() {
    TestModal.current = this;
    this.onOpen();
  }
  close() {
    this.onClose();
  }
}
function plugin({ mobile = false, legacyCrypto = false } = {}) {
  const sandbox = {
    module: { exports: {} },
    require: (name) =>
      name === "obsidian"
        ? {
            Plugin: class {},
            ItemView: class {},
            MarkdownRenderChild: class {},
            Modal: TestModal,
            Notice: class {},
            Platform: { isMobile: mobile },
          }
        : require(name),
    crypto: legacyCrypto
      ? {
          getRandomValues: crypto.webcrypto.getRandomValues.bind(
            crypto.webcrypto,
          ),
        }
      : crypto.webcrypto,
    console,
    window: { setTimeout, clearTimeout, setInterval },
    setTimeout,
  };
  vm.runInNewContext(
    fs.readFileSync(require.resolve("../main.js"), "utf8"),
    sandbox,
  );
  const p = new sandbox.module.exports();
  p.app = { vault: new Vault() };
  p.zone = "Asia/Kolkata";
  p.panels = new Set();
  p.cache = new Map();
  p.queue = Promise.resolve();
  p.dirty = new Set();
  p.warning = "";
  p.stopped = false;
  p.decisions = {};
  p.saveData = async (data) => {
    p.savedDecisions = JSON.parse(JSON.stringify(data));
  };
  p.confirmReplacement = async () => false;
  p.schedule = () => {
    p.scheduled = true;
  };
  p.app.vault.create(
    "Habit Tracker/habit-tracker-list.md",
    "| Habit | Generate calendar | Header color |\n|---|---|---|\n| Walking | Y | #F8CBAD |\n| Reading | Y | #FFE699 |\n| Meditation | N | #D9EAD3 |\n",
  );
  return p;
}
test("fresh vault starts with an empty editable list, without invented habits or marks", async () => {
  const p = plugin();
  p.app.vault.files.clear();
  await p.reconcile();
  assert.equal((await p.model(p.currentMonth())).state.habits.length, 0);
});
test("rapid actions always have increasing timestamps", () => {
  const p = plugin();
  const a = p.event("2026-10", "create", { habits: [] }),
    b = p.event("2026-10", "create", { habits: [] });
  assert.ok(b.at > a.at);
});
test("initialization is idempotent, assigns IDs, and creates page and permanent report", async () => {
  const p = plugin();
  await p.reconcile();
  const m = p.currentMonth();
  assert.ok(await p.read(`Habit Tracker/Months/${m}.md`));
  assert.ok(
    (await p.read("Habit Tracker/habit-tracker-list.md")).includes("habit-id:"),
  );
  const count = (await p.events(m)).length;
  await p.reconcile();
  assert.equal((await p.events(m)).length, count);
  assert.equal((await p.previousReport(m)).habits.length, 2);
});
test("click cycle persists and reports; past dates allowed and future dates rejected", async () => {
  const p = plugin();
  await p.reconcile();
  const m = p.currentMonth(),
    state = (await p.model(m)).state,
    id = state.habits[0].id,
    date = m + "-01";
  await p.mark(m, id, date);
  assert.equal((await p.previousReport(m)).habits[0].green, 1);
  await p.mark(m, id, date);
  assert.equal((await p.previousReport(m)).habits[0].pink, 1);
  await p.mark(m, id, date);
  assert.equal((await p.previousReport(m)).habits[0].pink, 0);
  await assert.rejects(p.mark(m, id, "2999-01-01"), /Future/);
});
test("No retains current names, colors, marks, and report; Yes fully resets with Y/N and deletion", async () => {
  const p = plugin();
  await p.reconcile();
  const f = p.app.vault.getAbstractFileByPath(
    "Habit Tracker/habit-tracker-list.md",
  );
  const m = p.currentMonth(),
    before = (await p.model(m)).state;
  await p.mark(m, before.habits[0].id, m + "-01");
  const report = await p.read(`Habit Tracker/Statistics/${m}-statistics.md`);
  f.text =
    f.text
      .replace("Walking", "Walk daily")
      .replace("#F8CBAD", "#112233")
      .replace(/.*Reading.*\n/, "") + "\n| Yoga | Y | #FFE699 |\n";
  let prompts = 0;
  p.confirmReplacement = async () => {
    prompts++;
    return false;
  };
  await p.reconcile();
  await p.reconcile();
  assert.equal(prompts, 1);
  assert.equal((await p.model(m)).state.habits[0].name, "Walking");
  assert.equal(
    await p.read(`Habit Tracker/Statistics/${m}-statistics.md`),
    report,
  );
  p.confirmReplacement = async () => true;
  await p.reconcile(false, true);
  let state = (await p.model(m)).state;
  assert.equal(state.habits.length, 2);
  assert.equal(state.habits[0].name, "Walk daily");
  assert.equal(state.habits[0].color, "#112233");
  assert.equal(Object.keys(state.marks).length, 0);
  assert.equal((await p.previousReport(m)).totals.green, 0);
  assert.ok(state.generation);
  f.text = f.text.replace("| Y | #112233", "| N | #112233");
  await p.reconcile();
  state = (await p.model(m)).state;
  assert.equal(state.habits.length, 1);
  assert.equal(state.habits[0].name, "Yoga");
});
test("partial deletion preserves report and locks editing; complete deletion does not regenerate", async () => {
  const p = plugin();
  await p.reconcile();
  const m = p.currentMonth(),
    h = (await p.model(m)).state.habits[0];
  await p.mark(m, h.id, m + "-01");
  const before = await p.read(`Habit Tracker/Statistics/${m}-statistics.md`);
  const markFile = p.app.vault
    .getFiles()
    .find(
      (f) => f.path.includes("/Records/") && C.decode(f.text).type === "mark",
    );
  p.app.vault.files.delete(markFile.path);
  p.cache.delete(markFile.path);
  await p.reconcile();
  assert.equal(
    await p.read(`Habit Tracker/Statistics/${m}-statistics.md`),
    before,
  );
  assert.equal((await p.model(m)).incomplete, true);
  await assert.rejects(p.mark(m, h.id, m + "-01"), /incomplete/);
  for (const f of p.app.vault.getFiles())
    if (f.path.includes("/Records/")) p.app.vault.files.delete(f.path);
  await p.reconcile();
  assert.equal((await p.events(m)).length, 0);
  assert.equal(
    await p.read(`Habit Tracker/Statistics/${m}-statistics.md`),
    before,
  );
});
test("archive verifies full report and retains it after source removal", async () => {
  const p = plugin();
  await p.reconcile();
  const month = C.shiftMonth(p.currentMonth(), -1),
    habits = C.parseList(
      await p.read("Habit Tracker/habit-tracker-list.md"),
    ).habits;
  await p.append(p.event(month, "create", { habits }));
  await p.append(
    p.event(month, "mark", {
      habit: habits[0].id,
      date: month + "-01",
      status: "green",
    }),
  );
  await p.archive(month);
  const report = await p.read(
    `Habit Tracker/Statistics/${month}-statistics.md`,
  );
  assert.equal(await p.archived(month), true);
  await assert.rejects(p.mark(month, habits[0].id, month + "-01"), /locked/);
  for (const f of p.app.vault.getFiles())
    if (f.path.includes(`/Records/${month}/`)) p.app.vault.files.delete(f.path);
  await p.updateReport(month);
  assert.equal(
    await p.read(`Habit Tracker/Statistics/${month}-statistics.md`),
    report,
  );
});
test("historical calendar and report stay frozen after late sync and catalog changes", async () => {
  const p = plugin();
  await p.reconcile();
  const m = C.shiftMonth(p.currentMonth(), -1);
  const habits = C.parseList(
    await p.read("Habit Tracker/habit-tracker-list.md"),
  ).habits;
  await p.append(p.event(m, "create", { habits }));
  await p.freezeMonth(m);
  const before = await p.model(m);
  const report = await p.read(`Habit Tracker/Statistics/${m}-statistics.md`);
  await p.append(
    p.event(m, "mark", {
      habit: habits[0].id,
      date: m + "-01",
      status: "green",
    }),
  );
  p.dirty.add(m);
  await p.reconcile();
  assert.deepEqual((await p.model(m)).state, before.state);
  assert.equal((await p.model(m)).lateCount, 1);
  assert.equal(
    await p.read(`Habit Tracker/Statistics/${m}-statistics.md`),
    report,
  );
  await assert.rejects(p.mark(m, habits[0].id, m + "-01"), /locked/);
});
test("malformed list blocks reconciliation without damaging existing records", async () => {
  const p = plugin();
  await p.reconcile();
  const m = p.currentMonth(),
    before = (await p.events(m)).length;
  p.app.vault.getAbstractFileByPath(
    "Habit Tracker/habit-tracker-list.md",
  ).text = "invalid";
  await assert.rejects(p.reconcile(), /table/);
  assert.equal((await p.events(m)).length, before);
});
test("two device event sets merge and survive report generation", async () => {
  const a = plugin(),
    b = plugin();
  await a.reconcile();
  for (const f of a.app.vault.getFiles()) await b.write(f.path, f.text);
  const m = a.currentMonth(),
    h = (await a.model(m)).state.habits;
  await a.mark(m, h[0].id, m + "-01");
  await b.mark(m, h[1].id, m + "-01");
  for (const f of b.app.vault.getFiles())
    if (
      f.path.includes("/Records/") &&
      !a.app.vault.getAbstractFileByPath(f.path)
    )
      await a.write(f.path, f.text);
  await a.updateReport(m);
  assert.equal((await a.previousReport(m)).totals.green, 2);
});

test("archive freezes calendar status, habit metadata and totals when late events arrive", async () => {
  const p = plugin();
  await p.reconcile();
  const m = C.shiftMonth(p.currentMonth(), -1),
    habits = C.parseList(
      await p.read("Habit Tracker/habit-tracker-list.md"),
    ).habits;
  await p.append(p.event(m, "create", { habits }));
  await p.append(
    p.event(m, "mark", {
      habit: habits[0].id,
      date: m + "-01",
      status: "green",
    }),
  );
  await p.archive(m);
  const before = await p.model(m),
    reportBefore = await p.read(`Habit Tracker/Statistics/${m}-statistics.md`);
  await p.append(
    p.event(m, "mark", {
      habit: habits[0].id,
      date: m + "-01",
      status: "pink",
    }),
  );
  await p.append(
    p.event(m, "catalog", {
      habits: habits.map((h) => ({
        ...h,
        name: "Late rename",
        color: "#000000",
      })),
    }),
  );
  const after = await p.model(m);
  await p.updateReport(m);
  assert.equal(after.lateCount, 2);
  assert.deepEqual(after.state, before.state);
  assert.deepEqual(after.summary, before.summary);
  assert.equal(
    after.state.marks[habits[0].id + "|" + m + "-01"].status,
    "green",
  );
  assert.equal(
    await p.read(`Habit Tracker/Statistics/${m}-statistics.md`),
    reportBefore,
  );
  const marker = C.decode(
    await p.read(`Habit Tracker/System/Archived/${m}.md`),
  );
  assert.equal(marker.schema, 3);
  assert.deepEqual(marker.snapshot, JSON.parse(JSON.stringify(before.summary)));
});
test("archived summary survives partial detail deletion and excludes late-only records", async () => {
  const p = plugin();
  await p.reconcile();
  const m = C.shiftMonth(p.currentMonth(), -1),
    habits = C.parseList(
      await p.read("Habit Tracker/habit-tracker-list.md"),
    ).habits;
  await p.append(p.event(m, "create", { habits }));
  await p.append(
    p.event(m, "mark", {
      habit: habits[0].id,
      date: m + "-01",
      status: "green",
    }),
  );
  await p.archive(m);
  const saved = (await p.model(m)).summary;
  const files = p.app.vault
    .getFiles()
    .filter((f) => f.path.includes(`/Records/${m}/`));
  p.app.vault.files.delete(files[0].path);
  p.cache.delete(files[0].path);
  let model = await p.model(m);
  assert.ok(model.state);
  assert.deepEqual(model.summary, saved);
  for (const f of files) {
    p.app.vault.files.delete(f.path);
    p.cache.delete(f.path);
  }
  await p.append(
    p.event(m, "mark", {
      habit: habits[0].id,
      date: m + "-02",
      status: "green",
    }),
  );
  model = await p.model(m);
  assert.ok(model.state);
  assert.equal(model.lateCount, 1);
  assert.deepEqual(model.summary, saved);
});
test("legacy archive uses saved report IDs to exclude late records", async () => {
  const p = plugin();
  await p.reconcile();
  const m = C.shiftMonth(p.currentMonth(), -1),
    habits = C.parseList(
      await p.read("Habit Tracker/habit-tracker-list.md"),
    ).habits;
  await p.append(p.event(m, "create", { habits }));
  await p.write(
    `Habit Tracker/Statistics/${m}-statistics.md`,
    C.report(C.statistics(C.reduce(await p.events(m), m), C.today(p.zone))),
  );
  await p.write(
    `Habit Tracker/System/Archived/${m}.md`,
    C.encode({ schema: 1, month: m, report: `${m}-statistics.md` }),
  );
  await p.append(
    p.event(m, "mark", {
      habit: habits[0].id,
      date: m + "-01",
      status: "green",
    }),
  );
  const model = await p.model(m);
  assert.equal(model.summary.totals.green, 0);
  assert.equal(Object.keys(model.state.marks).length, 0);
  assert.equal(model.lateCount, 1);
});
test("removing a historical marker cannot unlock past entries or include late marks", async () => {
  const p = plugin();
  await p.reconcile();
  const m = C.shiftMonth(p.currentMonth(), -1);
  const habits = C.parseList(
    await p.read("Habit Tracker/habit-tracker-list.md"),
  ).habits;
  await p.append(p.event(m, "create", { habits }));
  await p.archive(m);
  await p.append(
    p.event(m, "mark", {
      habit: habits[0].id,
      date: m + "-01",
      status: "green",
    }),
  );
  p.app.vault.files.delete(`Habit Tracker/System/Archived/${m}.md`);
  await p.updateReport(m);
  assert.equal((await p.model(m)).archived, true);
  assert.equal((await p.previousReport(m)).totals.green, 0);
});
test("new archive marker retains aggregate snapshot if statistics file is removed", async () => {
  const p = plugin();
  await p.reconcile();
  const m = C.shiftMonth(p.currentMonth(), -1),
    habits = C.parseList(
      await p.read("Habit Tracker/habit-tracker-list.md"),
    ).habits;
  await p.append(p.event(m, "create", { habits }));
  await p.archive(m);
  const saved = (await p.model(m)).summary;
  p.app.vault.files.delete(`Habit Tracker/Statistics/${m}-statistics.md`);
  assert.deepEqual((await p.model(m)).summary, saved);
});
test("disable during a read prevents subsequent writes", async () => {
  const p = plugin();
  await p.reconcile();
  const path = "Habit Tracker/habit-tracker-list.md",
    original = await p.read(path),
    read = p.app.vault.read.bind(p.app.vault);
  p.app.vault.read = async (f) => {
    const text = await read(f);
    p.stopped = true;
    return text;
  };
  await assert.rejects(p.write(path, "replacement"), /disabled/);
  assert.equal(p.app.vault.getAbstractFileByPath(path).text, original);
});

test("editing the list during confirmation invalidates Yes", async () => {
  const p = plugin();
  await p.reconcile();
  const m = p.currentMonth(),
    f = p.app.vault.getAbstractFileByPath(
      "Habit Tracker/habit-tracker-list.md",
    );
  f.text = f.text.replace("Walking", "First edit");
  p.confirmReplacement = async () => {
    f.text = f.text.replace("First edit", "Second edit");
    return true;
  };
  await p.reconcile();
  assert.equal((await p.model(m)).state.habits[0].name, "Walking");
  assert.equal(p.scheduled, true);
});
test("disabled plugin cannot apply a confirmed reset", async () => {
  const p = plugin();
  await p.reconcile();
  const m = p.currentMonth(),
    f = p.app.vault.getAbstractFileByPath(
      "Habit Tracker/habit-tracker-list.md",
    );
  f.text = f.text.replace("Walking", "Edited");
  p.confirmReplacement = async () => {
    p.stopped = true;
    return true;
  };
  await assert.rejects(p.reconcile(), /disabled/);
  assert.equal((await p.events(m)).filter((e) => e.type === "reset").length, 0);
});
test("custom color reference survives refresh without causing a reset", async () => {
  const p = plugin();
  await p.reconcile();
  const path = "Habit Tracker/hex-color-list.md";
  assert.ok((await p.read(path)).includes("aliceblue"));
  await p.write(
    path,
    "| Color Name | Hex Code | Color Shade |\n|---|---|---|\n| Custom | #123456 | |\n",
  );
  p.confirmReplacement = async () => {
    throw Error("Unexpected reset");
  };
  await p.reconcile();
  assert.ok((await p.read(path)).includes("Custom"));
  assert.ok(!(await p.read(path)).includes("aliceblue"));
});
test("month rollover freezes exact saved state and uses edited list for new month", async () => {
  const p = plugin();
  const real = p.currentMonth();
  p.currentMonth = () => C.shiftMonth(real, -1);
  await p.reconcile();
  const old = p.currentMonth();
  const h = (await p.model(old)).state.habits[0];
  await p.mark(old, h.id, old + "-01");
  const saved = await p.read(`Habit Tracker/Statistics/${old}-statistics.md`);
  const f = p.app.vault.getAbstractFileByPath(
    "Habit Tracker/habit-tracker-list.md",
  );
  f.text = f.text.replace("Walking", "New name");
  p.currentMonth = () => real;
  await p.reconcile();
  assert.equal((await p.model(old)).state.habits[0].name, "Walking");
  assert.equal(
    await p.read(`Habit Tracker/Statistics/${old}-statistics.md`),
    saved,
  );
  assert.equal((await p.model(real)).state.habits[0].name, "New name");
});
test("late pre-reset marks cannot restore cleared entries", async () => {
  const p = plugin();
  await p.reconcile();
  const m = p.currentMonth(),
    h = (await p.model(m)).state.habits[0];
  await p.mark(m, h.id, m + "-01");
  const f = p.app.vault.getAbstractFileByPath(
    "Habit Tracker/habit-tracker-list.md",
  );
  f.text = f.text.replace("Walking", "Renamed");
  p.confirmReplacement = async () => true;
  await p.reconcile();
  await p.append(
    p.event(m, "mark", { habit: h.id, date: m + "-01", status: "green" }),
  );
  await p.updateReport(m);
  assert.equal((await p.previousReport(m)).totals.green, 0);
  await p.mark(m, h.id, m + "-01");
  assert.equal((await p.previousReport(m)).totals.green, 1);
});

test("real confirmation modal shows exact warning and No default; Yes resolves true", async () => {
  const p = plugin();
  delete p.confirmReplacement;
  const habits = C.parseList(
    await p.read("Habit Tracker/habit-tracker-list.md"),
  ).habits;
  let answer = p.confirmReplacement(p.currentMonth(), habits);
  let modal = TestModal.current;
  assert.ok(
    modal.contentEl.children.some(
      (x) =>
        x.textContent ===
        "The current months entries will be overwritten and there would be loss of data",
    ),
  );
  const no = modal.contentEl.children.find((x) => x.textContent === "No");
  assert.equal(no.focused, true);
  no.handlers.click();
  assert.equal(await answer, false);
  answer = p.confirmReplacement(p.currentMonth(), habits);
  modal = TestModal.current;
  modal.contentEl.children
    .find((x) => x.textContent === "Yes")
    .handlers.click();
  assert.equal(await answer, true);
  answer = p.confirmReplacement(p.currentMonth(), habits);
  TestModal.current.close();
  assert.equal(await answer, false);
});
test("saved No decision survives reload and an explicit retry can apply it", async () => {
  const p = plugin();
  await p.reconcile();
  const f = p.app.vault.getAbstractFileByPath(
    "Habit Tracker/habit-tracker-list.md",
  );
  f.text = f.text.replace("Walking", "New title");
  await p.reconcile();
  const b = plugin();
  b.app = p.app;
  b.decisions = p.savedDecisions;
  b.confirmReplacement = async () => {
    throw Error("Do not repeat rejected dialog");
  };
  await b.reconcile();
  b.confirmReplacement = async () => true;
  await b.reconcile(false, true);
  assert.equal(
    (await b.model(b.currentMonth())).state.habits[0].name,
    "New title",
  );
});
test("a corrupt late record cannot break a schema-3 frozen calendar", async () => {
  const p = plugin();
  await p.reconcile();
  const m = C.shiftMonth(p.currentMonth(), -1);
  const habits = C.parseList(
    await p.read("Habit Tracker/habit-tracker-list.md"),
  ).habits;
  await p.append(p.event(m, "create", { habits }));
  await p.freezeMonth(m);
  const before = await p.model(m);
  await p.write(`Habit Tracker/Records/${m}/corrupt.md`, "not JSON");
  const after = await p.model(m);
  assert.deepEqual(after.state, before.state);
  assert.equal(after.lateCount, 1);
});

for (const mobile of [false, true]) {
  test(`WebView without randomUUID: initialization, mark persistence and reset (mobile=${mobile})`, async () => {
    const p = plugin({ mobile, legacyCrypto: true });
    await p.reconcile();
    const m = p.currentMonth();
    const h = (await p.model(m)).state.habits[0];
    await p.mark(m, h.id, m + "-01");
    assert.equal((await p.previousReport(m)).habits[0].green, 1);
    const f = p.app.vault.getAbstractFileByPath(
      "Habit Tracker/habit-tracker-list.md",
    );
    f.text = f.text.replace("Walking", "Walking outdoors");
    p.confirmReplacement = async () => true;
    await p.reconcile();
    assert.equal((await p.model(m)).state.habits[0].name, "Walking outdoors");
    assert.equal((await p.previousReport(m)).habits[0].green, 0);
    const events = await p.events(m);
    assert.equal(new Set(events.map((e) => e.id)).size, events.length);
    for (const e of events)
      assert.match(
        e.id,
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    assert.ok(
      p.app.vault.getFiles().some((f) => f.path.includes("System/Backups/")),
    );
  });
}

test("portable month picker validates year and supports Enter without input type month", () => {
  const p = plugin({ mobile: true });
  const opened = [];
  p.openMonth = async (value) => opened.push(value);
  p.safe = (fn) => fn();
  p.chooseMonth();
  const modal = TestModal.current;
  const labels = modal.contentEl.children.filter((e) => e.tag === "label");
  const month = labels[0].children[0],
    year = labels[1].children[0];
  assert.equal(month.tag, "select");
  assert.equal(month.children.length, 12);
  assert.equal(year.type, "text");
  const open = modal.contentEl.children.find((e) => e.tag === "button");
  year.value = "1969";
  open.handlers.click();
  assert.equal(opened.length, 0);
  year.value = "2028";
  month.value = "02";
  let prevented = false;
  year.handlers.keydown({
    key: "Enter",
    preventDefault() {
      prevented = true;
    },
  });
  assert.ok(prevented);
  assert.deepEqual(opened, ["2028-02"]);
});

test("Windows CRLF/BOM list with Unicode names persists using portable vault paths", async () => {
  const p = plugin();
  const f = p.app.vault.getAbstractFileByPath(
    "Habit Tracker/habit-tracker-list.md",
  );
  f.text =
    "\ufeff" + f.text.replace("Walking", "Café 日記").replace(/\n/g, "\r\n");
  await p.reconcile();
  const m = p.currentMonth(),
    h = (await p.model(m)).state.habits[0];
  assert.equal(h.name, "Café 日記");
  await p.mark(m, h.id, m + "-01");
  assert.equal((await p.previousReport(m)).habits[0].green, 1);
  for (const file of p.app.vault.getFiles()) {
    assert.ok(!file.path.includes("\\"));
    for (const segment of file.path.split("/"))
      assert.ok(!/[<>:"\\|?*]/.test(segment));
  }
});
