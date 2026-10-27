// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 harharhari
"use strict";
import {
  Plugin,
  ItemView,
  MarkdownRenderChild,
  Modal,
  Notice,
  Platform,
  TFile,
  TFolder,
  type App,
  type WorkspaceLeaf,
  type ViewStateResult,
  type TAbstractFile,
} from "obsidian";
import * as C from "./core";
const COLOR_REFERENCE = ""; // Bundled from hex-color-list.md by scripts/build.mjs.
const ROOT = "Habit Tracker",
  LIST = ROOT + "/habit-tracker-list.md",
  CONFIG = ROOT + "/System/config.md",
  // Keep the internal view type so saved workspace tabs can reopen after migration.
  VIEW = "habit-calendar-001b";
const DETAILS_VIEW = "rsn-habit-details",
  EDITOR_VIEW = "rsn-habit-editor";
const COLORS = ROOT + "/hex-color-list.md";
const INITIAL =
  "# Habits\n\nAdd one row per habit. Keep the habit-id comments after the plugin assigns them.\n\n| Habit | Generate calendar | Header color |\n|---|---|---|\n";
const pathFor = (kind: string, m: string) => `${ROOT}/${kind}/${m}.md`;
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
function el<K extends keyof HTMLElementTagNameMap>(
  parent: HTMLElement,
  tag: K,
  text?: string,
  cls?: string,
): HTMLElementTagNameMap[K] {
  const x = parent.createEl(tag);
  if (text !== undefined) x.textContent = text;
  if (cls) x.className = cls;
  return x;
}
function button(parent: HTMLElement, label: string, action: () => unknown) {
  const b = el(parent, "button", label);
  b.type = "button";
  b.addEventListener("click", action);
  return b;
}
class ReplaceMonthModal extends Modal {
  month: string;
  count: number;
  resolve: (accepted: boolean) => void;
  accepted = false;
  constructor(
    plugin: HabitCalendarPlugin,
    month: string,
    count: number,
    resolve: (accepted: boolean) => void,
  ) {
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
  callback: { current: string; open: (month: string) => void };
  constructor(
    app: App,
    callback: { current: string; open: (month: string) => void },
  ) {
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
  plugin: HabitCalendarPlugin;
  month: string;
  constructor(plugin: HabitCalendarPlugin, m: string) {
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
        message.textContent = C.errorMessage(e);
        b.disabled = false;
      }
    });
  }
  onClose() {
    this.contentEl.replaceChildren();
  }
}
class DetailsView extends ItemView {
  month: string;
  constructor(
    leaf: WorkspaceLeaf,
    private plugin: HabitCalendarPlugin,
  ) {
    super(leaf);
    this.month = plugin.currentMonth();
  }
  getViewType() {
    return DETAILS_VIEW;
  }
  getDisplayText() {
    return "Habit tracker details";
  }
  getIcon() {
    return "folder-tree";
  }
  getState() {
    return { month: this.month };
  }
  async setState(state: unknown, result: ViewStateResult) {
    const saved = C.isObject(state) ? state : {};
    this.month = C.validMonth(saved.month)
      ? saved.month
      : this.plugin.currentMonth();
    await this.onOpen();
    await super.setState(saved, result);
  }
  async onOpen() {
    this.contentEl.replaceChildren();
    this.contentEl.classList.add("hc-root");
    if (Platform.isMobile) this.contentEl.classList.add("hc-mobile");
    el(this.contentEl, "h1", `Details: ${C.title(this.month)}`);
    const bar = el(this.contentEl, "div", undefined, "hc-toolbar");
    button(bar, "Back to calendars", () =>
      this.plugin.safe(() => this.plugin.openMonth(this.month)),
    );
    button(bar, "Refresh details", () => this.plugin.safe(() => this.onOpen()));
    button(bar, "Habit list", () =>
      this.plugin.safe(() => this.plugin.openAux(EDITOR_VIEW)),
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
    el(
      this.contentEl,
      "p",
      "Statistics and back navigation use the month shown above. Applying the habit list always affects the current month and asks for confirmation. Tracker files stay in your vault.",
    );
    if (this.month < this.plugin.currentMonth())
      button(this.contentEl, "Verify saved snapshot", () =>
        new ArchiveModal(this.plugin, this.month).open(),
      );
    for (const name of ["Months", "Records", "Statistics", "System"]) {
      const group = el(this.contentEl, "details");
      el(group, "summary", name);
      const list = el(group, "ul");
      const files = this.plugin
        .trackerFiles(`${ROOT}/${name}`)
        .sort((a, b) => a.path.localeCompare(b.path));
      for (const file of files) {
        const li = el(list, "li");
        button(li, file.path.slice(ROOT.length + name.length + 2), () =>
          this.plugin.safe(() => this.plugin.openFile(file.path)),
        );
      }
      if (!files.length) el(list, "li", "No files yet.");
    }
    for (const path of [LIST, COLORS])
      button(this.contentEl, path.slice(ROOT.length + 1), () =>
        this.plugin.safe(() => this.plugin.openFile(path)),
      );
    await Promise.resolve();
  }
}
class ColorPicker extends Modal {
  constructor(
    app: App,
    private colors: { name: string; hex: string }[],
    private choose: (hex: string) => void,
  ) {
    super(app);
  }
  onOpen() {
    this.contentEl.classList.add("hc-color-picker");
    el(this.contentEl, "h2", "Choose header color");
    const search = el(this.contentEl, "input");
    search.type = "search";
    search.placeholder = "Search color name or hex code";
    search.setAttribute("aria-label", "Search colors");
    el(this.contentEl, "p", "Color name / Hex code / Color shade");
    const list = el(this.contentEl, "div", undefined, "hc-color-options");
    const render = () => {
      list.replaceChildren();
      const query = search.value.toLowerCase();
      for (const color of this.colors.filter((c) =>
        `${c.name} ${c.hex}`.toLowerCase().includes(query),
      )) {
        const option = button(list, "", () => {
          this.choose(color.hex);
          this.close();
        });
        option.className = "hc-color-option";
        el(option, "span", color.name);
        el(option, "span", color.hex);
        const swatch = el(option, "span", "", "hc-color-shade");
        swatch.style.backgroundColor = color.hex;
        swatch.setAttribute("aria-label", color.hex);
        option.setAttribute("aria-label", `${color.name} ${color.hex}`);
      }
      if (!list.children.length)
        el(
          list,
          "p",
          "No matching colors. You can enter your own six-digit hex code in the editor.",
        );
    };
    search.addEventListener("input", render);
    render();
    search.focus();
  }
  onClose() {
    this.contentEl.replaceChildren();
  }
}
type EditorRow = { id: string; name: string; enabled: boolean; color: string };
class HabitEditorView extends ItemView {
  original = "";
  rows: EditorRow[] = [];
  colors: { name: string; hex: string }[] = [];
  constructor(
    leaf: WorkspaceLeaf,
    private plugin: HabitCalendarPlugin,
  ) {
    super(leaf);
  }
  getViewType() {
    return EDITOR_VIEW;
  }
  getDisplayText() {
    return "Habit list";
  }
  getIcon() {
    return "list-checks";
  }
  async onOpen() {
    try {
      await this.plugin.serial(() => this.plugin.list());
      this.original = (await this.plugin.read(LIST)) ?? "";
      this.rows = C.parseList(this.original).habits.map((h) => ({ ...h }));
      const reference = (await this.plugin.read(COLORS)) ?? COLOR_REFERENCE;
      this.colors = reference.split(/\r?\n/).flatMap((line) => {
        const cells = line.split("|").map((c) => c.trim());
        return cells.length >= 4 && /^#[0-9a-f]{6}$/i.test(cells[2])
          ? [{ name: cells[1], hex: cells[2].toUpperCase() }]
          : [];
      });
      this.renderEditor();
    } catch (error) {
      this.contentEl.replaceChildren();
      this.contentEl.classList.add("hc-root");
      el(this.contentEl, "h1", "Habit list needs correction");
      el(this.contentEl, "p", C.errorMessage(error));
      button(this.contentEl, "Open Markdown file", () =>
        this.plugin.safe(() => this.plugin.openFile(LIST)),
      );
      button(this.contentEl, "Reload editor", () =>
        this.plugin.safe(() => this.onOpen()),
      );
    }
  }
  serialize() {
    const names = new Set<string>();
    const lines = this.rows.map((row, i) => {
      const name = row.name.trim().normalize("NFC");
      if (
        !name ||
        name.length > 180 ||
        /[|\r\n]/.test(name) ||
        name.includes("<!--")
      )
        throw Error(
          `Habit ${i + 1}: enter a name of 1–180 characters without pipes, newlines or HTML comments.`,
        );
      if (names.has(name)) throw Error(`Duplicate habit name: ${name}`);
      names.add(name);
      const color = row.color.trim().toUpperCase();
      if (!/^#[0-9A-F]{6}$/.test(color))
        throw Error(`Habit ${i + 1}: enter a hex code such as #F8CBAD.`);
      return `| ${name} <!-- habit-id: ${row.id} --> | ${row.enabled ? "Y" : "N"} | ${color} |`;
    });
    const source = this.original.split(/\r?\n/);
    const start = source.findIndex((line) =>
      /^\s*\|\s*Habit\s*\|\s*Generate calendar\s*\|/i.test(line),
    );
    if (start < 0) throw Error("Habit table is missing.");
    let end = start + 1;
    while (end < source.length && source[end].trim().startsWith("|")) end++;
    return [
      ...source.slice(0, start),
      "| Habit | Generate calendar | Header color |",
      "|---|---|---|",
      ...lines,
      ...source.slice(end),
    ].join("\n");
  }
  renderEditor() {
    const host = this.contentEl;
    host.replaceChildren();
    host.classList.add("hc-root", "hc-editor");
    if (Platform.isMobile) host.classList.add("hc-mobile");
    el(host, "h1", "Habit list");
    el(
      host,
      "p",
      "Choose Y or N. Choose a reference color or enter # followed by six hexadecimal digits. Save writes habit-tracker-list.md. Applying changes to this month requires the existing Yes/No confirmation.",
    );
    const bar = el(host, "div", undefined, "hc-toolbar");
    button(bar, "Back to calendars", () =>
      this.plugin.safe(() => this.plugin.openMonth(this.plugin.currentMonth())),
    );
    button(bar, "Open Markdown file", () =>
      this.plugin.safe(() => this.plugin.openFile(LIST)),
    );
    const message = el(host, "p");
    message.setAttribute("role", "status");
    const save = button(bar, "Save habit list", async () => {
      save.disabled = true;
      try {
        const updated = this.serialize();
        await this.plugin.saveHabitEditor(this.original, updated);
        this.original = updated;
        await this.plugin.serial(() => this.plugin.reconcile(false, true));
        message.textContent =
          "Habit list saved. Return to calendars to review the current month.";
      } catch (error) {
        message.textContent = C.errorMessage(error);
      } finally {
        save.disabled = false;
      }
    });
    button(bar, "Add habit", () => {
      this.rows.push({
        id: `h-${recordId()}`,
        name: "",
        enabled: true,
        color: "#F8CBAD",
      });
      this.renderEditor();
    });
    const rows = el(host, "div", undefined, "hc-editor-rows");
    this.rows.forEach((row, index) => {
      const line = el(rows, "div", undefined, "hc-editor-row");
      const nameLabel = el(line, "label", "Habit");
      const name = el(nameLabel, "input");
      name.type = "text";
      name.value = row.name;
      name.maxLength = 180;
      name.setAttribute("aria-label", `Habit ${index + 1} name`);
      name.addEventListener("input", () => {
        row.name = name.value;
      });
      const flagLabel = el(line, "label", "Generate calendar");
      const flag = el(flagLabel, "select");
      flag.setAttribute("aria-label", `Habit ${index + 1} generate calendar`);
      for (const value of ["Y", "N"]) {
        const option = el(flag, "option", value);
        option.value = value;
      }
      flag.value = row.enabled ? "Y" : "N";
      flag.addEventListener("change", () => {
        row.enabled = flag.value === "Y";
      });
      const colorLabel = el(line, "label", "Header color");
      const color = el(colorLabel, "input");
      color.type = "text";
      color.value = row.color;
      color.placeholder = C.DEFAULT_COLOR;
      color.maxLength = 7;
      color.setAttribute("aria-label", `Habit ${index + 1} header color`);
      color.pattern = "#[0-9a-fA-F]{6}";
      const swatch = el(colorLabel, "span", "", "hc-color-shade");
      const preview = () => {
        const valid = /^#[0-9a-f]{6}$/i.test(color.value.trim());
        color.setAttribute("aria-invalid", String(!valid));
        swatch.style.backgroundColor = valid
          ? color.value.trim()
          : "transparent";
        swatch.title = valid ? color.value : "Invalid hex code";
      };
      color.addEventListener("input", () => {
        row.color = color.value;
        preview();
      });
      preview();
      const picker = button(line, "Choose color ▾", () =>
        new ColorPicker(this.app, this.colors, (hex) => {
          row.color = hex;
          color.value = hex;
          preview();
        }).open(),
      );
      picker.setAttribute("aria-haspopup", "dialog");
      picker.setAttribute("aria-label", `Choose color for habit ${index + 1}`);
      button(line, "Remove habit", () => {
        this.rows.splice(index, 1);
        this.renderEditor();
      });
    });
  }
}

class TrackerView extends ItemView {
  plugin: HabitCalendarPlugin;
  month: string;
  panel?: Panel;
  constructor(leaf: WorkspaceLeaf, p: HabitCalendarPlugin) {
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
  async setState(state: unknown, result: ViewStateResult) {
    if (!C.isObject(state)) state = {};
    const saved = C.isObject(state) ? state : {};
    this.month = C.validMonth(saved.month)
      ? saved.month
      : this.plugin.currentMonth();
    if (this.panel) {
      this.panel.month = this.month;
      await this.panel.render();
    }
    await super.setState(saved, result);
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
  plugin: HabitCalendarPlugin;
  host: HTMLElement;
  month: string;
  heading: boolean;
  search: string;
  sequence: number;
  alive: boolean;
  constructor(
    plugin: HabitCalendarPlugin,
    host: HTMLElement,
    month: string,
    heading = false,
  ) {
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
        cursor =
          focusSearch && active instanceof HTMLInputElement
            ? active.selectionStart
            : null;
      const scrolls: [HTMLElement, number][] = [];
      for (
        let parent: HTMLElement | null = this.host;
        parent;
        parent = parent.parentElement
      )
        if (parent.scrollTop) scrolls.push([parent, parent.scrollTop]);
      this.host.replaceChildren();
      if (this.heading) el(this.host, "h1", C.title(this.month));
      const bar = el(this.host, "div", undefined, "hc-toolbar");
      button(bar, "Previous", () =>
        this.plugin.safe(() =>
          this.plugin.openMonth(C.shiftMonth(this.month, -1)),
        ),
      );
      button(bar, "Choose month", () => this.plugin.chooseMonth(this.month));
      button(bar, "Next", () =>
        this.plugin.safe(() =>
          this.plugin.openMonth(C.shiftMonth(this.month, 1)),
        ),
      );
      button(bar, "Details", () =>
        this.plugin.safe(() => this.plugin.openAux(DETAILS_VIEW, this.month)),
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
      if (!stats) throw Error("Saved statistics unavailable.");
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
                new Notice(C.errorMessage(e));
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
        if (!s) throw Error("Saved habit statistics unavailable.");
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
          "No enabled habits yet. Open details, edit the habit list and set Generate calendar to Y.",
        );
      for (const [parent, top] of scrolls) parent.scrollTop = top;
    } catch (e) {
      if (this.alive && seq === this.sequence) {
        this.host.replaceChildren();
        el(this.host, "p", C.errorMessage(e), "hc-warning");
      }
    }
  }
  filter() {
    for (const card of this.host.querySelectorAll<HTMLElement>(".hc-card"))
      card.hidden = !(card.dataset.habit ?? "").includes(
        this.search.toLocaleLowerCase(),
      );
  }
  summary(s: C.Summary) {
    el(
      this.host,
      "p",
      `Saved through ${s.asOf}: ${s.totals.green} green, ${s.totals.pink} pink, ${s.totals.completion}% completion.`,
    );
  }
}
interface Model {
  state: C.CalendarState | null;
  summary: C.Summary | null;
  archived: boolean;
  missing: boolean;
  incomplete: boolean;
  lateCount: number;
}
export default class HabitCalendarPlugin extends Plugin {
  zone = "Asia/Kolkata";
  decisions: { rejectedMonth?: string; rejectedList?: string } = {};
  panels = new Set<Panel>();
  cache = new Map<string, C.TrackerEvent>();
  queue: Promise<unknown> = Promise.resolve();
  dirty = new Set<string>();
  warning = "";
  stopped = false;
  timer?: number;
  lastEventTime = 0;
  replaceModal?: ReplaceMonthModal;

  async onload() {
    this.zone = "Asia/Kolkata";
    const saved: unknown = await this.loadData();
    this.decisions = C.isObject(saved)
      ? {
          rejectedMonth:
            typeof saved.rejectedMonth === "string"
              ? saved.rejectedMonth
              : undefined,
          rejectedList:
            typeof saved.rejectedList === "string"
              ? saved.rejectedList
              : undefined,
        }
      : {};
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
          (x.textContent ?? "").trim(),
        );
        if (headers.join("|") !== "Color Name|Hex Code|Color Shade") continue;
        for (const row of table.querySelectorAll("tbody tr")) {
          const cells = row.querySelectorAll("td");
          if (cells.length !== 3) continue;
          const hex = (cells[1].textContent ?? "").trim();
          cells[2].replaceChildren();
          if (!/^#[0-9a-f]{6}$/i.test(hex)) {
            cells[2].textContent = "Invalid hex code";
            continue;
          }
          const shade = el(cells[2], "span", "", "hc-color-shade");
          shade.style.backgroundColor = hex;
          shade.setAttribute(
            "aria-label",
            `${(cells[0].textContent ?? "").trim()}: ${hex}`,
          );
          shade.setAttribute("role", "img");
          shade.title = hex;
        }
      }
    });
    this.registerView(DETAILS_VIEW, (leaf) => new DetailsView(leaf, this));
    this.registerView(EDITOR_VIEW, (leaf) => new HabitEditorView(leaf, this));
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
          panel?: Panel;
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
      callback: () => this.safe(() => this.openAux(EDITOR_VIEW)),
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
        new ArchiveModal(this, m || "").open();
      },
    });
    this.addRibbonIcon("calendar-check", "Open habit calendars", () =>
      this.safe(async () => {
        await this.serial(() => this.reconcile());
        await this.openMonth(this.currentMonth());
      }),
    );
    const changed = (file: TAbstractFile) => {
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
    this.registerEvent(this.app.vault.on("delete", (f) => changed(f)));
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
        void this.safe(() => this.serial(() => this.reconcile(true)));
    });
  }
  onunload() {
    this.stopped = true;
    this.replaceModal?.close();
    window.clearTimeout(this.timer);
    for (const panel of [...this.panels]) panel.dispose();
  }
  safe(fn: () => unknown) {
    return Promise.resolve()
      .then(fn)
      .catch((e) => {
        console.error("rsn habit calendar one b:", e);
        new Notice("Habit Calendar: " + C.errorMessage(e), 10000);
      });
  }
  serial<T>(fn: () => Promise<T>): Promise<T | undefined> {
    const result = this.queue.then(() => {
      if (this.stopped) return;
      return fn();
    });
    this.queue = result.catch(() => {});
    return result;
  }
  schedule() {
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      void this.safe(() => this.serial(() => this.reconcile()));
    }, 700);
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
  async mkdir(path: string) {
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
  async read(path: string) {
    const f = this.app.vault.getAbstractFileByPath(path);
    return f instanceof TFile ? this.app.vault.read(f) : null;
  }
  async write(path: string, text: string, onlyNew = false) {
    this.assertActive();
    await this.mkdir(path.slice(0, path.lastIndexOf("/")));
    const f = this.app.vault.getAbstractFileByPath(path);
    if (f) {
      if (!(f instanceof TFile)) throw Error("Expected a file: " + path);
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
    if (
      !C.isObject(config) ||
      config.schema !== 1 ||
      typeof config.timeZone !== "string"
    )
      throw Error("Invalid tracker configuration.");
    C.today(config.timeZone);
    this.zone = config.timeZone;
  }
  async list() {
    let raw = await this.read(LIST);
    if (raw === null) {
      const initialized = this.trackerFiles(ROOT + "/System/Months").length > 0;
      if (initialized)
        throw Error(
          "Habit list is missing. Restore it; existing records are preserved.",
        );
      await this.write(LIST, INITIAL, true);
      raw = await this.read(LIST);
    }
    if (raw === null) throw Error("Habit list is unavailable.");
    let parsed = C.parseList(raw);
    const f = this.app.vault.getAbstractFileByPath(LIST);
    if (!(f instanceof TFile)) throw Error("Habit list is unavailable.");
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
  event(
    m: string,
    type: C.TrackerEvent["type"],
    extra:
      | { habits: C.Habit[] }
      | {
          habit: string;
          date: string;
          status: C.Status;
          generation: string | null;
        },
  ): C.TrackerEvent {
    this.lastEventTime = Math.max(Date.now(), (this.lastEventTime || 0) + 1);
    const event = {
      schema: 1,
      id: recordId(),
      month: m,
      at: new Date(this.lastEventTime).toISOString(),
      type,
      ...extra,
    };
    C.validateEvent(event, m);
    return event;
  }
  async append(e: C.TrackerEvent) {
    C.validateEvent(e, e.month);
    const path = `${ROOT}/Records/${e.month}/${e.id}.md`;
    await this.write(path, C.encode(e), true);
    this.cache.set(path, e);
  }
  trackerFiles(folder: string): TFile[] {
    if (!folder.startsWith(ROOT + "/")) throw Error("Tracker path required.");
    const start = this.app.vault.getAbstractFileByPath(folder);
    if (!(start instanceof TFolder)) return [];
    const files: TFile[] = [];
    const pending: TFolder[] = [start];
    while (pending.length) {
      const current = pending.pop();
      if (!current) break;
      for (const child of current.children) {
        if (child instanceof TFolder) pending.push(child);
        else if (child instanceof TFile) files.push(child);
      }
    }
    return files;
  }
  async events(m: string) {
    const files = this.trackerFiles(`${ROOT}/Records/${m}`).filter(
      (f) => f.extension === "md",
    );
    const events: C.TrackerEvent[] = [];
    // Limit concurrent reads on mobile; immutable records are cached until a vault event invalidates them.
    for (let i = 0; i < files.length; i += 32) {
      const chunk = await Promise.all(
        files.slice(i, i + 32).map(async (f) => {
          const cached = this.cache.get(f.path);
          if (cached) return cached;
          let e: unknown;
          try {
            e = C.decode(await this.app.vault.read(f));
            C.validateEvent(e, m);
          } catch (err) {
            throw Error(`${f.path}: ${C.errorMessage(err)}`);
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
  async archived(m: string) {
    return !!this.app.vault.getAbstractFileByPath(
      `${ROOT}/System/Archived/${m}.md`,
    );
  }
  async previousReport(m: string) {
    const raw = await this.read(`${ROOT}/Statistics/${m}-statistics.md`);
    if (raw === null) return null;
    return C.parseSummary(raw, m);
  }
  async ensureMonth(m: string, habits: C.Habit[]) {
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
  async updateReport(m: string) {
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
    if (!(file instanceof TFile))
      throw Error("Statistics file is unavailable.");
    if ((await this.app.vault.read(file)) !== text) {
      this.assertActive();
      await this.app.vault.process(file, (current) => {
        this.assertActive();
        return C.canReplaceReport(C.parseSummary(current, m), state)
          ? text
          : current;
      });
    }
  }
  async confirmReplacement(m: string, habits: C.Habit[]) {
    return new Promise<boolean>((resolve) => {
      this.replaceModal = new ReplaceMonthModal(
        this,
        m,
        habits.filter((h) => h.enabled).length,
        resolve,
      );
      this.replaceModal.open();
    });
  }
  async applyCatalog(m: string, habits: C.Habit[], retry: boolean) {
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
  async freezeMonth(m: string) {
    if (m >= this.currentMonth() || (await this.archived(m))) return;
    let summary = await this.previousReport(m);
    let state = summary?.calendarState || null;
    if (!state) {
      const events = await this.events(m);
      const included = summary
        ? events.filter((e) => summary?.sourceIds.includes(e.id))
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
    for (const f of ["System/Months", "Statistics", "Records"].flatMap(
      (folder) => this.trackerFiles(`${ROOT}/${folder}`),
    )) {
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
  async model(m: string): Promise<Model> {
    await this.freezeMonth(m);
    const archived = await this.archived(m);
    const summary = await this.previousReport(m);
    if (archived) {
      const raw = await this.read(`${ROOT}/System/Archived/${m}.md`);
      if (raw === null) throw Error("Archive marker unavailable.");
      const marker = C.parseArchive(raw, m);
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
        const files = this.trackerFiles(`${ROOT}/Records/${m}`).filter(
          (f) => f.extension === "md",
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
  async mark(m: string, habit: string, date: string) {
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
        next = ({ none: "green", green: "pink", pink: "none" } as const)[
          current
        ];
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
  async archive(m: string) {
    if (m >= this.currentMonth())
      throw Error("Only completed months can be archived.");
    await this.freezeMonth(m);
    if (!(await this.archived(m)))
      throw Error("Cannot freeze missing records without a retained report.");
    this.renderAll();
  }
  renderAll() {
    for (const panel of this.panels) void panel.render();
  }
  chooseMonth(current = this.currentMonth()) {
    new MonthModal(this.app, {
      current,
      open: (m) => {
        void this.safe(() => this.openMonth(m));
      },
    }).open();
  }
  async openMonth(m: string) {
    if (!C.validMonth(m)) throw Error("Invalid month.");
    const leaf =
      this.app.workspace.getLeavesOfType(VIEW)[0] ||
      this.app.workspace.getLeaf("tab");
    await leaf.setViewState({ type: VIEW, active: true, state: { month: m } });
    await this.app.workspace.revealLeaf(leaf);
  }
  async openAux(type: string, month = this.currentMonth()) {
    const leaf =
      this.app.workspace.getLeavesOfType(type)[0] ||
      this.app.workspace.getLeaf("tab");
    await leaf.setViewState({ type, active: true, state: { month } });
    await this.app.workspace.revealLeaf(leaf);
  }
  async saveHabitEditor(original: string, updated: string) {
    C.parseList(updated);
    await this.serial(async () => {
      const file = this.app.vault.getAbstractFileByPath(LIST);
      if (!(file instanceof TFile))
        throw Error("Habit list is missing. Restore it before saving.");
      this.assertActive();
      await this.app.vault.process(file, (current) => {
        if (current !== original)
          throw Error(
            "The habit list changed on disk or through sync. Copy your edits, then reload the editor before saving.",
          );
        return updated;
      });
    });
  }
  async openFile(path: string) {
    const f = this.app.vault.getAbstractFileByPath(path);
    if (!(f instanceof TFile)) {
      new Notice(
        "File is not available yet. Run refresh calendars and statistics.",
      );
      return;
    }
    await this.app.workspace.getLeaf(false).openFile(f);
  }
  async openStats(m: string) {
    await this.serial(async () => {
      if (m < this.currentMonth()) await this.freezeMonth(m);
      else await this.updateReport(m);
    });
    await this.openFile(`${ROOT}/Statistics/${m}-statistics.md`);
  }
}
