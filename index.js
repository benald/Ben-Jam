// Production entry point shim.
//
// Some deploy hosts (e.g. Render web services created outside of a
// Blueprint/render.yaml) hard-code a "node index.js" start command rather
// than running `npm start`. This file makes that work by launching the real
// server (server/index.ts, run via tsx) as a child process, equivalent to
// running `npm start`.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.NODE_ENV = process.env.NODE_ENV || "production";

const tsxBin = path.join(
  __dirname,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "tsx.cmd" : "tsx",
);

const child = spawn(tsxBin, ["server/index.ts"], {
  cwd: __dirname,
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
