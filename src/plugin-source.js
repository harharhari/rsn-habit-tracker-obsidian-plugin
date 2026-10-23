// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 harharhari
"use strict";
const {
  Plugin,
  ItemView,
  MarkdownRenderChild,
  Modal,
  Notice,
  Platform,
} = require("obsidian");
const C = require("./core");
const COLOR_REFERENCE = ""; // Bundled from hex-color-list.md by scripts/build.mjs.
const ROOT = "Habit Tracker",
  LIST = ROOT + "/habit-tracker-list.md",
  CONFIG = ROOT + "/System/config.md",
  // Keep the internal view type so saved workspace tabs can reopen after migration.
  VIEW = "habit-calendar-001b";
const COLORS = ROOT + "/hex-color-list.md";
const INITIAL =
  "# Habits\n\nAdd one row per habit. Keep the habit-id comments after the plugin assigns them.\n\n| Habit | Generate calendar | Header color |\n|---|---|---|\n";
const pathFor = (kind, m) => `${ROOT}/${kind}/${m}.md`;
// Android WebViews may expose getRandomValues without secure-context randomUUID.
// Preserve UUID v4 IDs and collision resistance across offline syncing devices.
function recordId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4),
    hex.slice(4, 6),
    hex.slice(6, 8),
    hex.slice(8, 10),
    hex.slice(10),
  ]
    .map((part) => part.join(""))
    .join("-");
}
function el(parent, tag, text, cls) {
  const x = parent.ownerDocument.createElement(tag);
  if (text !== undefined) x.textContent = text;
  if (cls) x.className = cls;
  parent.appendChild(x);
  return x;
}
function button(parent, label, action) {
  const b = el(parent, "button", label);
  b.type = "button";
  b.addEventListener("click", action);
  return b;
}
class ReplaceMonthModal extends Modal {
  constructor(plugin, month, count, resolve) {
    super(plugin.app);
    this.month = month;
    this.count = count;
    this.resolve = resolve;
  }
  onOpen() {
    el(this.contentEl, "h2", `Replace ${this.month}?`);
    el(
      this.contentEl,
      "p",
      "The current months entries will be overwritten and there would be loss of data",
    );
    el(
      this.contentEl,
      "p",
      `Yes clears ALL current-month marks and rebuilds ${this.count} enabled calendars from the edited habit list. No keeps the existing month. Previous months are not changed.`,
    );
    const no = button(this.contentEl, "No", () => this.close());
    button(this.contentEl, "Yes", () => {
      this.accepted = true;
      this.close();
    });
    no.focus();
  }
  onClose() {
    this.contentEl.replaceChildren();
    this.resolve(this.accepted === true);
  }
}
class MonthModal extends Modal {
  constructor(app, callback) {
    super(app);
    this.callback = callback;
  }
  onOpen() {
    el(this.contentEl, "h2", "Open month");
    this.contentEl.classList.add("hc-month-picker");
    // Separate native controls avoid browser-dependent input[type=month] behaviour.
    const monthLabel = el(this.contentEl, "label", "Month ");
    const month = el(monthLabel, "select");
    month.setAttribute("aria-label", "Month");
    for (let index = 1; index <= 12; index++) {
      const value = String(index).padStart(2, "0");
      const option = el(
        month,
        "option",
        C.title(`2000-${value}`).split(" ")[1],
      );
      option.value = value;
    }
    month.value = this.callback.current.slice(5);
    const yearLabel = el(this.contentEl, "label", "Year ");
    const year = el(yearLabel, "input");
    year.type = "text";
    year.inputMode = "numeric";
    year.maxLength = 4;
    year.autocomplete = "off";
    year.setAttribute("aria-label", "Year");
    year.value = this.callback.current.slice(0, 4);
    const error = el(this.contentEl, "p");
    error.setAttribute("role", "alert");
    const open = () => {
      const value = `${year.value.trim()}-${month.value}`;
      if (!C.validMonth(value)) {
        error.textContent =
          "Enter a four-digit year from 1970 to 9999 and choose a month.";
        return;
      }
      this.callback.open(value);
      this.close();
    };
    button(this.contentEl, "Open", open);
    year.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        open();
      }
    });
    month.focus();
  }
  onClose() {
    this.contentEl.replaceChildren();
  }
}
class ArchiveModal extends Modal {
  constructor(plugin, m) {
    super(plugin.app);
    this.plugin = plugin;
    this.month = m;
  }
  onOpen() {
    el(this.contentEl, "h2", `Review ${this.month} snapshot`);
    el(
      this.contentEl,
      "p",
      "Previous months freeze automatically. This verifies that a saved snapshot exists. No calendars or records will be deleted automatically.",
    );
    const message = el(this.contentEl, "p");
    const b = button(this.contentEl, "Verify saved snapshot", async () => {
      b.disabled = true;
      try {
        await this.plugin.serial(() => this.plugin.archive(this.month));
        this.close();
        new Notice(
          "Month archived. Statistics are preserved; daily records can now be removed.",
        );
      } catch (e) {
        message.textContent = e.message;
        b.disabled = false;
      }
    });
  }
  onClose() {
    this.contentEl.replaceChildren();
  }
}
class TrackerView extends ItemView {
  constructor(leaf, p) {
    super(leaf);
    this.plugin = p;
    this.month = p.currentMonth();
  }
  getViewType() {
    return VIEW;
  }
  getDisplayText() {
    return C.title(this.month);
  }
  getIcon() {
    return "calendar-check";
  }
  async setState(state, result) {
    this.month = C.validMonth(state.month)
      ? state.month
      : this.plugin.currentMonth();
    if (this.panel) {
      this.panel.month = this.month;
      await this.panel.render();
    }
    await super.setState(state, result);
  }
  getState() {
    return { month: this.month };
  }
  async onOpen() {
    this.contentEl.replaceChildren();
    this.panel = new Panel(this.plugin, this.contentEl, this.month, true);
    await this.panel.render();
  }
  async onClose() {
    this.panel?.dispose();
  }
}
class Panel {
  constructor(plugin, host, month, heading = false) {
    this.plugin = plugin;
    this.host = host;
    this.month = month;
    this.heading = heading;
    this.search = "";
    this.sequence = 0;
    this.alive = true;
    plugin.panels.add(this);
    host.classList.add("hc-root");
    if (Platform.isMobile) host.classList.add("hc-mobile");
  }
  dispose() {
    this.alive = false;
    this.sequence++;
    this.plugin.panels.delete(this);
  }
  async render() {
    const seq = ++this.sequence;
    try {
      const model = await this.plugin.model(this.month);
      if (!this.alive || seq !== this.sequence) return;
      const active = this.host.ownerDocument.activeElement,
        focusSearch =
          active?.classList.contains("hc-search") && this.host.contains(active),
        cursor = focusSearch ? active.selectionStart : null;
      const scrolls = [];
      for (let parent = this.host; parent; parent = parent.parentElement)
        if (parent.scrollTop) scrolls.push([parent, parent.scrollTop]);
      this.host.replaceChildren();
      if (this.heading) el(this.host, "h1", C.title(this.month));
      const bar = el(this.host, "div", undefined, "hc-toolbar");
      button(bar, "← Previous", () =>
        this.plugin.safe(() =>
          this.plugin.openMonth(C.shiftMonth(this.month, -1)),
        ),
      );
      button(bar, "Choose month", () => this.plugin.chooseMonth());
      button(bar, "Next →", () =>
        this.plugin.safe(() =>
          this.plugin.openMonth(C.shiftMonth(this.month, 1)),
        ),
      );
      button(bar, "Habit list", () =>
        this.plugin.safe(() => this.plugin.openFile(LIST)),
      );
      button(bar, "Color reference", () =>
        this.plugin.safe(() => this.plugin.openFile(COLORS)),
      );
      button(bar, "Apply habit list", () =>
        this.plugin.safe(() =>
          this.plugin.serial(() => this.plugin.reconcile(false, true)),
        ),
      );
      button(bar, "Statistics", () =>
        this.plugin.safe(() => this.plugin.openStats(this.month)),
      );
      const search = el(bar, "input", undefined, "hc-search");
      search.type = "search";
      search.placeholder = "Search habits";
      search.value = this.search;
      search.setAttribute("aria-label", "Search habits");
      search.addEventListener("input", () => {
        this.search = search.value;
        this.filter();
      });
      if (focusSearch) {
        search.focus();
        try {
          search.setSelectionRange(cursor, cursor);
        } catch {
          /* Search inputs may not support selection ranges. */
        }
      }
      el(
        this.host,
        "p",
        "Tap a day: unmarked → green → pink → unmarked. Future dates are disabled.",
        "hc-help",
      );
      if (this.plugin.warning)
        el(this.host, "p", this.plugin.warning, "hc-warning");
      if (model.archived || model.missing) {
        el(
          this.host,
          "p",
          model.archived
            ? "Frozen previous month — calendar and statistics are read-only."
            : "Detailed records are unavailable or still syncing. Saved statistics have not been overwritten.",
          "hc-warning",
        );
      }
      if (model.incomplete)
        el(
          this.host,
          "p",
          "Some previously reported records are missing. Editing is locked until sync completes or records are restored. The saved report is preserved.",
          "hc-warning",
        );
      if (model.lateCount)
        el(
          this.host,
          "p",
          `${model.lateCount} late record(s) retained but excluded from this archived snapshot. They cannot change this frozen month.`,
          "hc-warning",
        );
      if (!model.state || model.incomplete) {
        if (!model.summary)
          el(
            this.host,
            "p",
            "This month has not been created. Future months are created on the first.",
          );
        else this.summary(model.summary);
        return;
      }
      const state = model.state,
        asOf = C.today(this.plugin.zone),
        stats = model.archived ? model.summary : C.statistics(state, asOf);
      el(
        this.host,
        "p",
        `${state.habits.length} habits · ${stats.totals.green} green · ${stats.totals.pink} pink · ${stats.totals.completion}% completion`,
        "hc-totals",
      );
      const grid = el(this.host, "div", undefined, "hc-grid");
      for (const h of state.habits) {
        const card = el(grid, "section", undefined, "hc-card");
        card.dataset.habit = h.name.toLocaleLowerCase();
        card.setAttribute("aria-label", h.name);
        const header = el(card, "h3", h.name, "hc-card-title");
        header.style.backgroundColor = h.color;
        header.style.color = C.contrast(h.color);
        const table = el(card, "table", undefined, "hc-calendar");
        table.setAttribute("aria-label", `${h.name} ${C.title(this.month)}`);
        const tr = el(el(table, "thead"), "tr");
        ["M", "T", "W", "T", "F", "S", "S"].forEach((day, i) => {
          const th = el(tr, "th", day, i > 4 ? "hc-weekend" : "");
          th.scope = "col";
          th.title = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ][i];
        });
        const body = el(table, "tbody"),
          offset = (new Date(this.month + "-01T00:00:00Z").getUTCDay() + 6) % 7,
          count = C.daysInMonth(this.month);
        for (let week = 0; week < 6; week++) {
          const row = el(body, "tr");
          for (let col = 0; col < 7; col++) {
            const td = el(row, "td");
            const d = week * 7 + col - offset + 1;
            if (d < 1 || d > count) continue;
            const date = this.month + "-" + String(d).padStart(2, "0"),
              status = state.marks[h.id + "|" + date]?.status || "none";
            const b = button(td, String(d), async () => {
              b.disabled = true;
              try {
                await this.plugin.mark(this.month, h.id, date);
              } catch (e) {
                new Notice(e.message);
              } finally {
                if (b.isConnected) b.disabled = false;
              }
            });
            b.className = "hc-day hc-" + status;
            if (date === asOf) b.classList.add("hc-today");
            b.disabled = date > asOf || model.archived || model.incomplete;
            b.setAttribute(
              "aria-label",
              `${h.name}, ${date}: ${status === "none" ? "unmarked" : status}. Activate to change.`,
            );
            b.title = `${date}: ${status === "none" ? "unmarked" : status}`;
          }
        }
        const s = stats.habits.find((x) => x.id === h.id);
        el(
          card,
          "div",
          `${s.green} green · ${s.pink} pink · ${s.completion}%`,
          "hc-counts",
        );
      }
      this.filter();
      if (!state.habits.length)
        el(
          this.host,
          "p",
          "No enabled habits yet. Edit the habit list and set Generate calendar to Y.",
        );
      for (const [parent, top] of scrolls) parent.scrollTop = top;
      if (
        !model.archived &&
        !model.incomplete &&
        this.month < this.plugin.currentMonth()
      )
        button(this.host, "Prepare month for archive", () =>
          new ArchiveModal(this.plugin, this.month).open(),
        );
    } catch (e) {
      if (this.alive && seq === this.sequence) {
        this.host.replaceChildren();
        el(this.host, "p", e.message, "hc-warning");
      }
    }
  }
  filter() {
    for (const card of this.host.querySelectorAll(".hc-card"))
      card.hidden = !card.dataset.habit.includes(
        this.search.toLocaleLowerCase(),
      );
  }
  summary(s) {
    el(
      this.host,
      "p",
      `Saved through ${s.asOf}: ${s.totals.green} green, ${s.totals.pink} pink, ${s.totals.completion}% completion.`,
    );
  }
}
module.exports = class HabitCalendarPlugin extends Plugin {
  async onload() {
    this.zone = "Asia/Kolkata";
    this.decisions = (await this.loadData()) || {};
    this.panels = new Set();
    this.cache = new Map();
    this.queue = Promise.resolve();
    this.dirty = new Set();
    this.warning = "";
    this.stopped = false;
    this.registerMarkdownPostProcessor((host, ctx) => {
      if (ctx.sourcePath !== COLORS) return;
      for (const table of host.querySelectorAll("table")) {
        const headers = [...table.querySelectorAll("thead th")].map((x) =>
          x.textContent.trim(),
        );
        if (headers.join("|") !== "Color Name|Hex Code|Color Shade") continue;
        for (const row of table.querySelectorAll("tbody tr")) {
          const cells = row.querySelectorAll("td");
          if (cells.length !== 3) continue;
          const hex = cells[1].textContent.trim();
          cells[2].replaceChildren();
          if (!/^#[0-9a-f]{6}$/i.test(hex)) {
            cells[2].textContent = "Invalid hex code";
            continue;
          }
          const shade = el(cells[2], "span", "", "hc-color-shade");
          shade.style.backgroundColor = hex;
          shade.setAttribute(
            "aria-label",
            `${cells[0].textContent.trim()}: ${hex}`,
          );
          shade.setAttribute("role", "img");
          shade.title = hex;
        }
      }
    });
    this.registerView(VIEW, (leaf) => new TrackerView(leaf, this));
    this.registerMarkdownCodeBlockProcessor(
      "habit-calendar",
      async (source, host, ctx) => {
        const month = source.trim();
        if (!C.validMonth(month)) {
          host.textContent = "Use a month such as 2026-10 in this code block.";
          return;
        }
        class Child extends MarkdownRenderChild {
          onunload() {
            this.panel?.dispose();
          }
        }
        const child = new Child(host);
        ctx.addChild(child);
        child.panel = new Panel(this, host, month);
        await child.panel.render();
      },
    );
    this.addCommand({
      id: "open-current-month",
      name: "Open current month",
      callback: () =>
        this.safe(async () => {
          await this.serial(() => this.reconcile());
          await this.openMonth(this.currentMonth());
        }),
    });
    this.addCommand({
      id: "choose-month",
      name: "Open another month",
      callback: () => this.chooseMonth(),
    });
    this.addCommand({
      id: "edit-habits",
      name: "Edit habit list",
      callback: () => this.safe(() => this.openFile(LIST)),
    });
    this.addCommand({
      id: "color-reference",
      name: "Open color reference",
      callback: () =>
        this.safe(async () => {
          await this.write(COLORS, COLOR_REFERENCE, true);
          await this.openFile(COLORS);
        }),
    });
    this.addCommand({
      id: "apply-habit-list",
      name: "Apply habit list to current month",
      callback: () =>
        this.safe(() => this.serial(() => this.reconcile(false, true))),
    });
    this.addCommand({
      id: "refresh",
      name: "Refresh calendars and statistics",
      callback: () => this.safe(() => this.serial(() => this.reconcile(true))),
    });
    this.addCommand({
      id: "archive",
      name: "Prepare displayed month for archive",
      callback: () => {
        const v = this.app.workspace.getActiveViewOfType(TrackerView);
        const f = this.app.workspace.getActiveFile();
        const m =
          v?.month ||
          (f?.path.startsWith(ROOT + "/Months/") ? f.basename : null);
        if (!C.validMonth(m || "")) {
          new Notice("Open a monthly calendar first.");
          return;
        }
        new ArchiveModal(this, m).open();
      },
    });
    this.addRibbonIcon("calendar-check", "Open habit calendars", () =>
      this.safe(async () => {
        await this.serial(() => this.reconcile());
        await this.openMonth(this.currentMonth());
      }),
    );
    const changed = (file, deleted = false) => {
      if (!file.path.startsWith(ROOT + "/")) return;
      this.cache.delete(file.path);
      const m = file.path.match(/\/Records\/(\d{4}-\d{2})\//)?.[1];
      if (m) this.dirty.add(m);
      if (
        file.path === LIST ||
        file.path === CONFIG ||
        m ||
        file.path.startsWith(ROOT + "/System/")
      )
        this.schedule();
      else if (file.path.startsWith(ROOT + "/Statistics/")) this.renderAll();
    };
    this.registerEvent(this.app.vault.on("create", (f) => changed(f)));
    this.registerEvent(this.app.vault.on("modify", (f) => changed(f)));
    this.registerEvent(this.app.vault.on("delete", (f) => changed(f, true)));
    this.registerEvent(
      this.app.vault.on("rename", (f, old) => {
        this.cache.delete(old);
        changed(f);
        const m = old.match(/\/Records\/(\d{4}-\d{2})\//)?.[1];
        if (m) {
          this.dirty.add(m);
          this.schedule();
        }
        if (old === LIST) this.schedule();
      }),
    );
    this.registerInterval(window.setInterval(() => this.schedule(), 60000));
    this.app.workspace.onLayoutReady(() => {
      if (!this.stopped)
        this.safe(() => this.serial(() => this.reconcile(true)));
    });
  }
  onunload() {
    this.stopped = true;
    this.replaceModal?.close();
    window.clearTimeout(this.timer);
    for (const panel of [...this.panels]) panel.dispose();
  }
  safe(fn) {
    return Promise.resolve()
      .then(fn)
      .catch((e) => {
        console.error("rsn habit calendar one b:", e);
        new Notice("Habit Calendar: " + e.message, 10000);
      });
  }
  serial(fn) {
    const result = this.queue.then(() => {
      if (this.stopped) return;
      return fn();
    });
    this.queue = result.catch(() => {});
    return result;
  }
  schedule() {
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(
      () => this.safe(() => this.serial(() => this.reconcile())),
      700,
    );
  }
  currentMonth() {
    return C.today(this.zone).slice(0, 7);
  }
  assertActive() {
    if (this.stopped)
      throw Error(
        "Habit Calendar is disabled. Re-enable it before making changes.",
      );
  }
  async mkdir(path) {
    this.assertActive();
    const parts = path.split("/");
    let at = "";
    for (const p of parts) {
      at = at ? at + "/" + p : p;
      if (!this.app.vault.getAbstractFileByPath(at)) {
        try {
          this.assertActive();
          await this.app.vault.createFolder(at);
        } catch (e) {
          if (!this.app.vault.getAbstractFileByPath(at)) throw e;
        }
      }
    }
  }
  async read(path) {
    const f = this.app.vault.getAbstractFileByPath(path);
    return f && "extension" in f ? this.app.vault.read(f) : null;
  }
  async write(path, text, onlyNew = false) {
    this.assertActive();
    await this.mkdir(path.slice(0, path.lastIndexOf("/")));
    const f = this.app.vault.getAbstractFileByPath(path);
    if (f) {
      if (onlyNew) return;
      if ((await this.app.vault.read(f)) !== text) {
        this.assertActive();
        await this.app.vault.modify(f, text);
      }
    } else {
      try {
        this.assertActive();
        await this.app.vault.create(path, text);
      } catch (e) {
        if (!onlyNew || !this.app.vault.getAbstractFileByPath(path)) throw e;
      }
    }
  }
  async config() {
    const raw = await this.read(CONFIG);
    if (raw === null) {
      await this.write(
        CONFIG,
        "# Habit tracker configuration\n\nUse the same timezone on every device. The Linux helper reads this file too.\n\n" +
          C.encode({ schema: 1, timeZone: "Asia/Kolkata" }),
        true,
      );
      return;
    }
    const config = C.decode(raw);
    C.today(config.timeZone);
    if (config.schema !== 1 || typeof config.timeZone !== "string")
      throw Error("Invalid tracker configuration.");
    this.zone = config.timeZone;
  }
  async list() {
    let raw = await this.read(LIST);
    if (raw === null) {
      const initialized = this.app.vault
        .getFiles()
        .some((f) => f.path.startsWith(ROOT + "/System/Months/"));
      if (initialized)
        throw Error(
          "Habit list is missing. Restore it; existing records are preserved.",
        );
      await this.write(LIST, INITIAL, true);
      raw = await this.read(LIST);
    }
    let parsed = C.parseList(raw);
    const f = this.app.vault.getAbstractFileByPath(LIST);
    if (parsed.text !== raw) {
      this.assertActive();
      await this.app.vault.process(f, (current) => {
        this.assertActive();
        parsed = C.parseList(current);
        return parsed.text;
      });
    }
    this.warning = parsed.warnings.join(" ");
    return parsed.habits;
  }
  event(m, type, extra) {
    this.lastEventTime = Math.max(Date.now(), (this.lastEventTime || 0) + 1);
    return {
      schema: 1,
      id: recordId(),
      month: m,
      at: new Date(this.lastEventTime).toISOString(),
      type,
      ...extra,
    };
  }
  async append(e) {
    C.validateEvent(e, e.month);
    const path = `${ROOT}/Records/${e.month}/${e.id}.md`;
    await this.write(path, C.encode(e), true);
    this.cache.set(path, e);
  }
  async events(m) {
    const files = this.app.vault
      .getFiles()
      .filter(
        (f) =>
          f.path.startsWith(`${ROOT}/Records/${m}/`) && f.extension === "md",
      );
    const events = [];
    // Limit concurrent reads on mobile; immutable records are cached until a vault event invalidates them.
    for (let i = 0; i < files.length; i += 32) {
      const chunk = await Promise.all(
        files.slice(i, i + 32).map(async (f) => {
          if (this.cache.has(f.path)) return this.cache.get(f.path);
          let e;
          try {
            e = C.decode(await this.app.vault.read(f));
            C.validateEvent(e, m);
          } catch (err) {
            throw Error(`${f.path}: ${err.message}`);
          }
          this.cache.set(f.path, e);
          return e;
        }),
      );
      events.push(...chunk);
    }
    for (const e of events)
      this.lastEventTime = Math.max(this.lastEventTime || 0, Date.parse(e.at));
    return events;
  }
  async archived(m) {
    return !!this.app.vault.getAbstractFileByPath(
      `${ROOT}/System/Archived/${m}.md`,
    );
  }
  async previousReport(m) {
    const raw = await this.read(`${ROOT}/Statistics/${m}-statistics.md`);
    if (raw === null) return null;
    const s = C.decode(raw);
    if (
      s.schema !== 1 ||
      s.month !== m ||
      !Array.isArray(s.sourceIds) ||
      !Array.isArray(s.habits) ||
      !s.totals
    )
      throw Error("Invalid statistics file. Restore its calculation metadata.");
    return s;
  }
  async ensureMonth(m, habits) {
    if (m !== this.currentMonth()) return;
    if (await this.archived(m)) return;
    const marker = pathFor("System/Months", m),
      records = await this.events(m),
      previous = await this.previousReport(m);
    if (!records.length) {
      if ((await this.read(marker)) !== null || previous) return;
      await this.append(this.event(m, "create", { habits }));
    }
    await this.write(marker, C.encode({ schema: 1, month: m }), true);
    await this.write(pathFor("Months", m), C.page(m), true);
  }
  async updateReport(m) {
    if (m !== this.currentMonth() || (await this.archived(m))) return;
    const events = await this.events(m);
    if (!events.length) return;
    const state = C.reduce(events, m),
      previous = await this.previousReport(m);
    if (
      !events.some((e) => e.type === "create") ||
      !C.canReplaceReport(previous, state)
    )
      return;
    const s = {
        ...C.statistics(state, C.today(this.zone)),
        calendarState: state,
      },
      path = `${ROOT}/Statistics/${m}-statistics.md`,
      text = C.report(s);
    await this.write(path, text, true);
    const file = this.app.vault.getAbstractFileByPath(path);
    if ((await this.app.vault.read(file)) !== text) {
      this.assertActive();
      await this.app.vault.process(file, (current) => {
        this.assertActive();
        return C.canReplaceReport(C.decode(current), state) ? text : current;
      });
    }
  }
  async confirmReplacement(m, habits) {
    return new Promise((resolve) => {
      this.replaceModal = new ReplaceMonthModal(
        this,
        m,
        habits.filter((h) => h.enabled).length,
        resolve,
      );
      this.replaceModal.open();
    });
  }
  async applyCatalog(m, habits, retry) {
    const events = await this.events(m);
    if (!events.some((e) => e.type === "create")) return;
    const state = C.reduce(events, m);
    if (
      !C.canReplaceReport(await this.previousReport(m), state) ||
      !C.catalogChanged(state, habits)
    )
      return;
    const signature = JSON.stringify(habits);
    this.decisions ||= {};
    if (
      !retry &&
      this.decisions.rejectedMonth === m &&
      this.decisions.rejectedList === signature
    )
      return;
    const accepted = await this.confirmReplacement(m, habits);
    this.assertActive();
    // Approval is for this exact list and month, not a newer edit arriving while the dialog is open.
    if (
      m !== this.currentMonth() ||
      JSON.stringify(await this.list()) !== signature
    ) {
      new Notice(
        "The month or habit list changed while confirmation was open. Review the new list and apply it again.",
      );
      this.schedule();
      return;
    }
    if (!accepted) {
      this.decisions = { rejectedMonth: m, rejectedList: signature };
      await this.saveData(this.decisions);
      return;
    }
    const fresh = await this.events(m);
    const latest = C.reduce(fresh, m);
    if (!C.canReplaceReport(await this.previousReport(m), latest))
      throw Error(
        "Some records are still syncing. Nothing was replaced; wait and try again.",
      );
    if (await this.archived(m)) throw Error("This month is locked.");
    if (!C.catalogChanged(latest, habits)) return;
    await this.write(
      `${ROOT}/System/Backups/${m}-${recordId()}.md`,
      C.encode({
        schema: 1,
        month: m,
        calendarState: latest,
        snapshot: await this.previousReport(m),
      }),
      true,
    );
    await this.append(this.event(m, "reset", { habits }));
    await this.write(pathFor("Months", m), C.page(m));
    this.decisions = {};
    await this.saveData(this.decisions);
  }
  async freezeMonth(m) {
    if (m >= this.currentMonth() || (await this.archived(m))) return;
    let summary = await this.previousReport(m);
    let state = summary?.calendarState || null;
    if (!state) {
      const events = await this.events(m);
      const included = summary
        ? events.filter((e) => summary.sourceIds.includes(e.id))
        : events;
      if (included.some((e) => e.type === "create")) {
        const candidate = C.reduce(included, m);
        if (C.canReplaceReport(summary, candidate)) state = candidate;
      }
    }
    if (!summary && state) {
      summary = {
        ...C.statistics(state, C.today(this.zone)),
        calendarState: state,
      };
      await this.write(
        `${ROOT}/Statistics/${m}-statistics.md`,
        C.report(summary),
        true,
      );
      summary = await this.previousReport(m);
    }
    if (!summary) return;
    await this.write(
      `${ROOT}/System/Archived/${m}.md`,
      C.encode({
        schema: 3,
        month: m,
        archivedAt: new Date().toISOString(),
        snapshot: summary,
        calendarState: state,
        report: `${m}-statistics.md`,
      }),
      true,
    );
  }
  async reconcile(all = false, retry = false) {
    await this.config();
    await this.write(COLORS, COLOR_REFERENCE, true);
    const m = this.currentMonth();
    const months = new Set([...this.dirty]);
    this.dirty.clear();
    // Freeze history before parsing the editable list: a broken list must not unlock history.
    for (const f of this.app.vault.getFiles()) {
      const match = f.path.match(
        /^Habit Tracker\/(?:System\/Months|Statistics|Records)\/(\d{4}-\d{2})(?:[/. -])/,
      );
      if (match) months.add(match[1]);
    }
    for (const month of months) if (month < m) await this.freezeMonth(month);
    const habits = await this.list();
    await this.ensureMonth(m, habits);
    if (!(await this.archived(m))) await this.applyCatalog(m, habits, retry);
    await this.updateReport(m);
    this.renderAll();
  }
  async model(m) {
    await this.freezeMonth(m);
    const archived = await this.archived(m);
    const summary = await this.previousReport(m);
    if (archived) {
      const marker = C.decode(
        await this.read(`${ROOT}/System/Archived/${m}.md`),
      );
      // Schema-2 markers freeze the verified report as well as its event set.
      // Older markers use the retained report as their snapshot, without rewriting it.
      const frozen = marker.schema >= 2 ? marker.snapshot : summary;
      if (!frozen || frozen.month !== m || !Array.isArray(frozen.sourceIds))
        throw Error(
          "Archived snapshot unavailable. Restore the archive marker and statistics from backup.",
        );
      const ids = new Set(frozen.sourceIds);
      if (marker.schema === 3 && marker.calendarState) {
        // A frozen snapshot does not depend on deleted or malformed late records.
        const files = this.app.vault
          .getFiles()
          .filter(
            (f) =>
              f.path.startsWith(`${ROOT}/Records/${m}/`) &&
              f.extension === "md",
          );
        return {
          state: marker.calendarState,
          summary: frozen,
          archived: true,
          missing: false,
          incomplete: false,
          lateCount: files.filter((f) => !ids.has(f.basename)).length,
        };
      }
      const events = await this.events(m);
      const included = events.filter((e) => ids.has(e.id));
      const present = new Set(included.map((e) => e.id));
      const complete = [...ids].every((id) => present.has(id));
      const state =
        marker.schema === 3 && marker.calendarState
          ? marker.calendarState
          : complete && included.some((e) => e.type === "create")
            ? C.reduce(included, m)
            : null;
      return {
        state,
        summary: frozen,
        archived: true,
        missing: !state,
        incomplete: false,
        lateCount: events.filter((e) => !ids.has(e.id)).length,
      };
    }
    const events = await this.events(m),
      state = events.some((e) => e.type === "create")
        ? C.reduce(events, m)
        : null;
    return {
      state,
      summary,
      archived: false,
      missing: !state && !!summary,
      incomplete: !!state && !C.canReplaceReport(summary, state),
      lateCount: 0,
    };
  }
  async mark(m, habit, date) {
    return this.serial(async () => {
      if (m !== this.currentMonth()) throw Error("Previous months are locked.");
      if (date > C.today(this.zone))
        throw Error("Future dates cannot be marked.");
      const model = await this.model(m);
      if (!model.state || model.archived || model.incomplete)
        throw Error("This month is locked or its records are incomplete.");
      if (!model.state.habits.some((h) => h.id === habit))
        throw Error("Habit no longer available.");
      const current = model.state.marks[habit + "|" + date]?.status || "none",
        next = { none: "green", green: "pink", pink: "none" }[current];
      await this.append(
        this.event(m, "mark", {
          habit,
          date,
          status: next,
          generation: model.state.generation || null,
        }),
      );
      await this.updateReport(m);
      this.renderAll();
    });
  }
  async archive(m) {
    if (m >= this.currentMonth())
      throw Error("Only completed months can be archived.");
    await this.freezeMonth(m);
    if (!(await this.archived(m)))
      throw Error("Cannot freeze missing records without a retained report.");
    this.renderAll();
  }
  renderAll() {
    for (const panel of this.panels) panel.render();
  }
  chooseMonth() {
    new MonthModal(this.app, {
      current: this.currentMonth(),
      open: (m) => this.safe(() => this.openMonth(m)),
    }).open();
  }
  async openMonth(m) {
    if (!C.validMonth(m)) throw Error("Invalid month.");
    const leaf =
      this.app.workspace.getLeavesOfType(VIEW)[0] ||
      this.app.workspace.getLeaf("tab");
    await leaf.setViewState({ type: VIEW, active: true, state: { month: m } });
    this.app.workspace.revealLeaf(leaf);
  }
  async openFile(path) {
    const f = this.app.vault.getAbstractFileByPath(path);
    if (!f) {
      new Notice(
        "File is not available yet. Run refresh calendars and statistics.",
      );
      return;
    }
    await this.app.workspace.getLeaf(false).openFile(f);
  }
  async openStats(m) {
    await this.serial(async () => {
      if (m < this.currentMonth()) await this.freezeMonth(m);
      else await this.updateReport(m);
    });
    await this.openFile(`${ROOT}/Statistics/${m}-statistics.md`);
  }
};
