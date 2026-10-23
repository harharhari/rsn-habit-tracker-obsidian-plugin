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
        window.module = { exports: {} };
        window.require = () => ({
          Plugin: class {},
          ItemView: class {},
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
        content:
          fs.readFileSync(path.join(root, "main.js"), "utf8") +
          "\nwindow.TestPanel = Panel;",
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
            this.files.set(p, { path: p });
          }
          async create(p, text) {
            if (this.files.has(p)) throw Error("exists");
            const f = { path: p, extension: p.split(".").pop(), text };
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
      console.log(
        `PASS ${engine} ${scenario.name} browser: 60 calendars, grid, no horizontal overflow, mark cycle, search, rerender persistence, portable month picker; randomUUID absent`,
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
