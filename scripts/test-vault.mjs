// SPDX-License-Identifier: GPL-3.0-only
// Synthetic archive test fixtures. Never run against a personal vault.
import { readFile, writeFile, mkdir, access, readdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const C = require("../src/core.js");
const [action, flag, vaultArg] = process.argv.slice(2);
if (
  !["create", "late"].includes(action) ||
  flag !== "--test-vault" ||
  !vaultArg
)
  throw Error(
    'Usage: node scripts/test-vault.mjs create|late --test-vault "/absolute/path/to/empty-test-vault"',
  );
const vault = path.resolve(vaultArg),
  root = path.join(vault, "Habit Tracker"),
  sentinel = path.join(vault, "HABIT-CALENDAR-TEST-VAULT.md");
await access(path.join(vault, ".obsidian")); // Must be a vault opened once in Obsidian.
const exists = async (p) => {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
};
const write = async (p, s) => {
  await mkdir(path.dirname(p), { recursive: true });
  await writeFile(p, s, { flag: "wx" });
};
const event = (month, type, payload) => ({
  schema: 1,
  id: randomUUID(),
  month,
  at: new Date().toISOString(),
  type,
  ...payload,
});
const append = async (e) => {
  C.validateEvent(e, e.month);
  await write(path.join(root, "Records", e.month, e.id + ".md"), C.encode(e));
};
if (action === "create") {
  if ((await exists(root)) || (await exists(sentinel)))
    throw Error(
      "Refusing to overwrite existing tracker/test data. Use a new empty test vault and keep the plugin disabled until this command completes.",
    );
  const month = C.shiftMonth(C.today().slice(0, 7), -1);
  const habits = [
    {
      id: "test-walk",
      name: "TEST Walking",
      enabled: true,
      color: "#F8CBAD",
      order: 0,
    },
    {
      id: "test-read",
      name: "TEST Reading",
      enabled: true,
      color: "#FFE699",
      order: 1,
    },
  ];
  await write(
    sentinel,
    "# Synthetic habit test vault\n\nNot personal activity records.\n\n" +
      C.encode({
        schema: 1,
        purpose: "habit-calendar-archive-regression",
        month,
      }),
  );
  await write(
    path.join(root, "habit-tracker-list.md"),
    "| Habit | Generate calendar | Header color |\n|---|---|---|\n" +
      habits
        .map((h) => `| ${h.name} <!-- habit-id: ${h.id} --> | Y | ${h.color} |`)
        .join("\n") +
      "\n",
  );
  await write(
    path.join(root, "System/config.md"),
    C.encode({ schema: 1, timeZone: "Asia/Kolkata" }),
  );
  await append(event(month, "create", { habits }));
  await append(
    event(month, "mark", {
      habit: "test-walk",
      date: month + "-01",
      status: "green",
    }),
  );
  await write(
    path.join(root, "System/Months", month + ".md"),
    C.encode({ schema: 1, month }),
  );
  await write(path.join(root, "Months", month + ".md"), C.page(month));
  console.log(
    `Created synthetic ${month} fixture. Enable the downloaded plugin, open that month (it freezes automatically), then run the late command.`,
  );
} else {
  const fixture = C.decode(await readFile(sentinel, "utf8"));
  if (fixture.purpose !== "habit-calendar-archive-regression")
    throw Error("Not a recognized synthetic test vault.");
  const month = fixture.month;
  await access(path.join(root, "System/Archived", month + ".md"));
  // Advance beyond the fixture's timestamps to make the competing mark newer.
  let latest = Date.now();
  for (const name of await readdir(path.join(root, "Records", month))) {
    if (name.endsWith(".md"))
      latest = Math.max(
        latest,
        Date.parse(
          C.decode(
            await readFile(path.join(root, "Records", month, name), "utf8"),
          ).at,
        ),
      );
  }
  const e = event(month, "mark", {
    habit: "test-walk",
    date: month + "-01",
    status: "pink",
  });
  e.at = new Date(latest + 1).toISOString();
  await append(e);
  console.log(
    `Added a synthetic late pink mark for ${month}-01. The archived calendar must remain green and show a late-record notice.`,
  );
}
