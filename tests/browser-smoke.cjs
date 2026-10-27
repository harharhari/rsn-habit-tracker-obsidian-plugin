// SPDX-License-Identifier: GPL-3.0-only
// Optional browser/DOM check, NOT an Android/Obsidian end-to-end test.
// Requires playwright; CHROME_PATH may select an installed Chrome executable.
const playwright = require("playwright");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
(async () => {
  const engine = process.env.BROWSER_ENGINE || "chromium";
  assert.ok(["chromium", "webkit"].includes(engine));
  const browser = await playwright[engine].launch({
    executablePath:
      engine === "chromium" ? process.env.CHROME_PATH || undefined : undefined,
    headless: true,
  });
  try {
    for (const scenario of [
      { name: "desktop", width: 1600, height: 1000, mobile: false },
      {
        name: "split-pane",
        width: 1600,
        height: 1000,
        mobile: false,
        pane: 600,
      },
      { name: "phone", width: 393, height: 851, mobile: true },
      { name: "tablet", width: 1024, height: 768, mobile: true },
    ]) {
      const mobile = scenario.mobile;
      const context = await browser.newContext({
        viewport: { width: scenario.width, height: scenario.height },
        isMobile: mobile,
        hasTouch: mobile,
        locale: "en-US",
      });
      const page = await context.newPage();
      await page.setContent(
        '<meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;font-family:sans-serif}#host{height:95vh;box-sizing:border-box}</style><div id="host"></div>',
      );
      if (scenario.pane)
        await page
          .locator("#host")
          .evaluate(
            (host, width) => (host.style.width = width + "px"),
            scenario.pane,
          );
      await page.addStyleTag({ path: path.join(root, "styles.css") });
      await page.evaluate((mobile) => {
        HTMLElement.prototype.createEl = function (tag) {
          const child = this.ownerDocument.createElement(tag);
          this.appendChild(child);
          return child;
        };
        window.module = { exports: {} };
        window.MockFile = class {
          constructor(props) {
            Object.assign(this, props);
          }
        };
        window.MockFolder = class {
          constructor(path, vault) {
            this.path = path;
            this.vault = vault;
          }
          get children() {
            return [...this.vault.files.values()].filter(
              (f) => f.path.slice(0, f.path.lastIndexOf("/")) === this.path,
            );
          }
        };
        window.require = () => ({
          TFile: window.MockFile,
          TFolder: window.MockFolder,
          Plugin: class {},
          ItemView: class {
            async setState() {}
            constructor(leaf) {
              this.app = leaf.app;
              this.contentEl = leaf.host;
            }
          },
          MarkdownRenderChild: class {},
          Modal: class {
            constructor() {
              this.contentEl = document.createElement("div");
            }
            open() {
              document.body.append(this.contentEl);
              this.onOpen();
            }
            close() {
              this.onClose();
              this.contentEl.remove();
            }
          },
          Notice: class {
            constructor(message) {
              throw Error(message);
            }
          },
          Platform: { isMobile: mobile },
        });
        Object.defineProperty(crypto, "randomUUID", {
          value: undefined,
          configurable: true,
        });
      }, mobile);
      await page.addScriptTag({
        content: fs
          .readFileSync(path.join(root, "main.js"), "utf8")
          .replace(
            "module.exports = exports.default;",
            "window.TestPanel = Panel; window.TestEditor = HabitEditorView; window.TestDetails = DetailsView; module.exports = exports.default;",
          ),
      });
      await page.evaluate(async () => {
        class Vault {
          constructor() {
            this.files = new Map();
          }
          getFiles() {
            return [...this.files.values()].filter((f) => f.extension);
          }
          getAbstractFileByPath(p) {
            return this.files.get(p) || null;
          }
          async createFolder(p) {
            this.files.set(p, new window.MockFolder(p, this));
          }
          async create(p, text) {
            if (this.files.has(p)) throw Error("exists");
            const parts = p.split("/");
            parts.pop();
            let parent = "";
            for (const part of parts) {
              parent = parent ? parent + "/" + part : part;
              if (!this.files.has(parent))
                this.files.set(parent, new window.MockFolder(parent, this));
            }
            const f = new window.MockFile({
              path: p,
              basename: p.split("/").pop().replace(/\.md$/, ""),
              extension: p.split(".").pop(),
              text,
            });
            this.files.set(p, f);
            return f;
          }
          async read(f) {
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
        const p = (window.plugin = new module.exports());
        Object.assign(p, {
          app: { vault: new Vault() },
          zone: "Asia/Kolkata",
          panels: new Set(),
          cache: new Map(),
          queue: Promise.resolve(),
          dirty: new Set(),
          warning: "",
          stopped: false,
          decisions: {},
          saveData: async () => {},
          confirmReplacement: async () => false,
          schedule: () => {},
        });
        await p.app.vault.create(
          "Habit Tracker/habit-tracker-list.md",
          "| Habit | Generate calendar | Header color |\n|---|---|---|\n" +
            Array.from(
              { length: 60 },
              (_, i) =>
                `| Habit ${String(i + 1).padStart(2, "0")} | Y | #F8CBAD |`,
            ).join("\n"),
        );
        await p.reconcile();
        window.panel = new TestPanel(
          p,
          document.querySelector("#host"),
          p.currentMonth(),
          true,
        );
        await panel.render();
      });
      assert.equal(await page.locator(".hc-card").count(), 60);
      assert.deepEqual(
        await page.locator(".hc-toolbar button").allTextContents(),
        ["Previous", "Choose month", "Next", "Details"],
      );
      assert.equal(
        await page.getByLabel("Search habits", { exact: true }).count(),
        1,
      );
      await page.evaluate(() => {
        plugin.openAux = async (type, month) => {
          window.auxRequest = { type, month };
        };
      });
      await page.getByRole("button", { name: "Details", exact: true }).click();
      assert.deepEqual(
        await page.evaluate(() => auxRequest),
        await page.evaluate(() => ({
          type: "rsn-habit-details",
          month: panel.month,
        })),
      );

      const layout = await page.evaluate(() => ({
        columns: getComputedStyle(
          document.querySelector(".hc-grid"),
        ).gridTemplateColumns.split(" ").length,
        overflow:
          document.querySelector("#host").scrollWidth >
          document.querySelector("#host").clientWidth,
        dayHeight: document.querySelector(".hc-day").getBoundingClientRect()
          .height,
      }));
      assert.equal(layout.columns, mobile || scenario.pane ? 1 : 6);
      if (mobile) {
        const sizes = await page
          .locator(".hc-toolbar button, .hc-search")
          .evaluateAll((nodes) =>
            nodes.map((n) => ({
              height: n.getBoundingClientRect().height,
              font: parseFloat(getComputedStyle(n).fontSize),
            })),
          );
        assert.ok(sizes.every((n) => n.height >= 44 && n.font >= 16));
      }
      assert.equal(layout.overflow, false);
      if (mobile) assert.ok(layout.dayHeight >= 44);
      const firstDay = page
        .locator(".hc-card")
        .first()
        .locator(".hc-day")
        .first();
      for (const status of ["green", "pink", "none"]) {
        if (mobile) await firstDay.tap();
        else await firstDay.click();
        await page.waitForFunction(
          (status) =>
            document
              .querySelector(".hc-day")
              .classList.contains("hc-" + status),
          status,
        );
      }
      await page.locator(".hc-search").fill("Habit 60");
      assert.equal(await page.locator(".hc-card:visible").count(), 1);
      await page
        .locator(".hc-card:visible .hc-day")
        .first()
        [mobile ? "tap" : "click"]();
      await page.waitForFunction(() =>
        document
          .querySelector(".hc-card:not([hidden]) .hc-day")
          .classList.contains("hc-green"),
      );
      await page.evaluate(async () => {
        panel.dispose();
        window.panel = new TestPanel(
          plugin,
          document.querySelector("#host"),
          plugin.currentMonth(),
          true,
        );
        await panel.render();
      });
      assert.equal(
        await page.locator(".hc-card").last().locator(".hc-green").count(),
        1,
      );
      await page.evaluate(() => {
        plugin.openMonth = async (value) => {
          window.openedMonth = value;
        };
        plugin.chooseMonth();
      });
      await page.getByLabel("Year", { exact: true }).fill("1969");
      await page.getByRole("button", { name: "Open", exact: true }).click();
      assert.ok((await page.getByRole("alert").textContent()).includes("1970"));
      await page.getByLabel("Year", { exact: true }).fill("2028");
      await page.getByLabel("Month", { exact: true }).selectOption("02");
      await page.getByRole("button", { name: "Open", exact: true }).click();
      await page.waitForFunction(() => window.openedMonth === "2028-02");
      const screenshot = process.env.SCREENSHOT_DIR;
      if (screenshot) {
        fs.mkdirSync(screenshot, { recursive: true });
        await page.screenshot({
          path: path.join(screenshot, engine + "-" + scenario.name + ".png"),
        });
      }
      await page.evaluate(async () => {
        panel.dispose();
        window.editor = new TestEditor(
          { app: plugin.app, host: document.querySelector("#host") },
          plugin,
        );
        await editor.onOpen();
      });
      assert.equal(
        await page
          .getByLabel("Habit 1 generate calendar", { exact: true })
          .locator("option")
          .allTextContents()
          .then((a) => a.join(",")),
        "Y,N",
      );
      await page
        .getByLabel("Habit 1 header color", { exact: true })
        .fill("invalid");
      await page
        .getByRole("button", { name: "Save habit list", exact: true })
        .click();
      assert.match(await page.getByRole("status").textContent(), /hex code/);
      await page
        .getByRole("button", { name: "Choose color for habit 1", exact: true })
        .click();
      await page.getByLabel("Search colors", { exact: true }).fill("aliceblue");
      await page
        .getByRole("button", { name: "aliceblue #F0F8FF", exact: true })
        .click();
      assert.equal(
        await page
          .getByLabel("Habit 1 header color", { exact: true })
          .inputValue(),
        "#F0F8FF",
      );
      await page
        .getByLabel("Habit 1 header color", { exact: true })
        .fill("#123abc");
      await page
        .getByLabel("Habit 1 generate calendar", { exact: true })
        .selectOption("N");
      await page
        .getByRole("button", { name: "Save habit list", exact: true })
        .click();
      await page.waitForFunction(() =>
        document.querySelector('[role="status"]').textContent.includes("saved"),
      );
      assert.ok(
        await page.evaluate(async () =>
          (await plugin.read("Habit Tracker/habit-tracker-list.md")).includes(
            "| N | #123ABC |",
          ),
        ),
      );
      assert.equal(
        await page.evaluate(
          () =>
            document.querySelector("#host").scrollWidth >
            document.querySelector("#host").clientWidth,
        ),
        false,
      );
      if (screenshot)
        await page.screenshot({
          path: path.join(
            screenshot,
            engine + "-" + scenario.name + "-editor.png",
          ),
        });
      await page.evaluate(async () => {
        const d = new TestDetails(
          { app: plugin.app, host: document.querySelector("#host") },
          plugin,
        );
        window.detailsView = d;
        await d.setState({ month: "2026-09" }, {});
      });
      assert.deepEqual(await page.locator("summary").allTextContents(), [
        "Months",
        "Records",
        "Statistics",
        "System",
      ]);
      assert.equal(
        await page
          .getByRole("button", { name: "habit-tracker-list.md", exact: true })
          .count(),
        1,
      );
      assert.ok(
        (await page.locator("h1").textContent()).includes(
          "2026-09 September 2026",
        ),
      );
      assert.deepEqual(
        await page.locator(".hc-toolbar button").allTextContents(),
        [
          "Back to calendars",
          "Refresh details",
          "Habit list",
          "Color reference",
          "Apply habit list",
          "Statistics",
        ],
      );
      await page.evaluate(() => {
        plugin.openStats = async (month) => {
          window.statsMonth = month;
        };
        plugin.openFile = async (file) => {
          window.openedFile = file;
        };
      });
      await page
        .getByRole("button", { name: "Statistics", exact: true })
        .click();
      await page.waitForFunction(() => window.statsMonth === "2026-09");
      await page
        .getByRole("button", { name: "Back to calendars", exact: true })
        .click();
      await page.waitForFunction(() => window.openedMonth === "2026-09");
      await page
        .getByRole("button", { name: "Color reference", exact: true })
        .click();
      await page.waitForFunction(
        () => window.openedFile === "Habit Tracker/hex-color-list.md",
      );
      await page
        .getByRole("button", { name: "Habit list", exact: true })
        .click();
      await page.waitForFunction(
        () => window.auxRequest.type === "rsn-habit-editor",
      );
      if (screenshot)
        await page.screenshot({
          path: path.join(
            screenshot,
            engine + "-" + scenario.name + "-details.png",
          ),
        });
      const hidden = await page.evaluate(() => {
        const fixture = document.createElement("div");
        fixture.className = "workspace-leaf-content";
        fixture.dataset.type = "file-explorer";
        document.body.append(fixture);
        const entries = [
          "Habit Tracker/Records",
          "Habit Tracker/Statistics",
          "Habit Tracker/System",
          "Habit Tracker/habit-tracker-list.md",
          "Habit Tracker/hex-color-list.md",
          "Habit Tracker/Months",
          "Other/Records",
          "Other/habit-tracker-list.md",
          "Habit Tracker/Records backup",
        ];
        const rows = entries.map((path) => {
          const row = document.createElement("div");
          const file = path.endsWith(".md");
          row.className = file ? "nav-file" : "nav-folder";
          const title = document.createElement("div");
          title.className = file ? "nav-file-title" : "nav-folder-title";
          title.dataset.path = path;
          title.textContent = path;
          row.append(title);
          fixture.append(row);
          return row;
        });
        const result = rows.map(
          (row) => getComputedStyle(row).display === "none",
        );
        // The same data-path outside the explorer must remain visible.
        const outside = rows[0].cloneNode(true);
        document.body.append(outside);
        result.push(getComputedStyle(outside).display === "none");
        outside.remove();
        // Removing the plugin CSS must reveal every entry without changing files.
        const styles = [...document.querySelectorAll("style")];
        const text = styles.map((style) => style.textContent);
        styles.forEach((style) => {
          style.textContent = "";
        });
        result.push(
          rows.some((row) => getComputedStyle(row).display === "none"),
        );
        styles.forEach((style, i) => {
          style.textContent = text[i];
        });
        fixture.remove();
        return result;
      });
      assert.deepEqual(hidden, [
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
      ]);
      console.log(
        `PASS ${engine} ${scenario.name} browser: 60 calendars, grid, no horizontal overflow, mark cycle, search, rerender persistence, portable month picker, four-button toolbar, Details month context, management actions and scoped reversible sidebar hiding; randomUUID absent`,
      );
      await context.close();
    }
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
