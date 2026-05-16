#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import { gzipSync } from "node:zlib";

const root = process.cwd();
const outDir = join(root, ".out");
const resultsDir = join(root, "results");
const uiDir = join(root, "ui");
mkdirSync(outDir, { recursive: true });
mkdirSync(resultsDir, { recursive: true });

const runs = Math.max(1, Number.parseInt(process.env.BENCH_RUNS ?? "3", 10));
const zeroBin = process.env.ZERO_BIN || (existsSync("/home/razin/zero/bin/zero") ? "/home/razin/zero/bin/zero" : "zero");
const rustc = process.env.RUSTC || "rustc";

const cases = [
  { name: "startup", label: "Startup", complexity: "simple", expected: "ok", zero: "benchmarks/zero/startup.0", rust: "benchmarks/rust/startup.rs" },
  { name: "arithmetic", label: "Arithmetic Loop", complexity: "simple", expected: "ok", zero: "benchmarks/zero/arithmetic.0", rust: "benchmarks/rust/arithmetic.rs" },
  { name: "branches", label: "Branch Loop", complexity: "medium", expected: "ok", zero: "benchmarks/zero/branches.0", rust: "benchmarks/rust/branches.rs" },
  { name: "memory", label: "Memory Copy", complexity: "medium", expected: "ok", zero: "benchmarks/zero/memory.0", rust: "benchmarks/rust/memory.rs" },
  { name: "parser", label: "Parser Scan", complexity: "complex", expected: "ok", zero: "benchmarks/zero/parser.0", rust: "benchmarks/rust/parser.rs" }
];

function timed(command, args, options = {}) {
  const started = performance.now();
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  const elapsedMs = Number((performance.now() - started).toFixed(3));
  return { result, elapsedMs };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function fileSize(path) {
  try {
    return readFileSync(path).length;
  } catch {
    return null;
  }
}

function gzipSize(path) {
  try {
    return gzipSync(readFileSync(path)).length;
  } catch {
    return null;
  }
}

function toolVersion(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) return null;
  return (result.stdout || result.stderr).trim().split("\n")[0] || null;
}

function buildZero(benchCase) {
  const exe = join(outDir, `zero-${benchCase.name}`);
  const build = timed(zeroBin, ["build", "--emit", "exe", "--target", "linux-musl-x64", benchCase.zero, "--out", exe], { cwd: root });
  return { language: "zero", exe, build };
}

function buildRust(benchCase) {
  const exe = join(outDir, `rust-${benchCase.name}`);
  const build = timed(rustc, ["-O", benchCase.rust, "-o", exe], { cwd: root });
  return { language: "rust", exe, build };
}

function runExecutable(exe) {
  const samples = [];
  let last = null;
  for (let index = 0; index < runs; index++) {
    const run = timed(exe, [], { cwd: root });
    samples.push(run.elapsedMs);
    last = run.result;
  }
  return { samples, last };
}

function runLanguage(benchCase, buildFn) {
  const built = buildFn(benchCase);
  if (built.build.result.status !== 0) {
    return {
      case: benchCase.name,
      label: benchCase.label,
      complexity: benchCase.complexity,
      language: built.language,
      status: "build-failed",
      buildMs: built.build.elapsedMs,
      stderr: built.build.result.stderr.trim(),
      stdout: built.build.result.stdout.trim()
    };
  }

  const run = runExecutable(built.exe);
  const stdout = (run.last?.stdout ?? "").trim();
  const stderr = (run.last?.stderr ?? "").trim();
  const outputMatches = stdout === benchCase.expected;
  return {
    case: benchCase.name,
    label: benchCase.label,
    complexity: benchCase.complexity,
    language: built.language,
    status: run.last?.status === 0 && outputMatches ? "ok" : "failed",
    buildMs: built.build.elapsedMs,
    runMedianMs: median(run.samples),
    runMinMs: Math.min(...run.samples),
    runSamplesMs: run.samples,
    artifactBytes: fileSize(built.exe),
    compressedArtifactBytes: gzipSize(built.exe),
    stdout,
    stderr,
    expectedStdout: benchCase.expected,
    outputMatches
  };
}

function compareRows(results, benchCase) {
  const zero = results.find((row) => row.case === benchCase.name && row.language === "zero");
  const rust = results.find((row) => row.case === benchCase.name && row.language === "rust");
  if (!zero || !rust || zero.status !== "ok" || rust.status !== "ok") return null;
  return {
    case: benchCase.name,
    label: benchCase.label,
    fasterRuntime: zero.runMedianMs < rust.runMedianMs ? "zero" : "rust",
    runtimeRatio: Number((Math.max(zero.runMedianMs, rust.runMedianMs) / Math.min(zero.runMedianMs, rust.runMedianMs)).toFixed(2)),
    smallerArtifact: zero.artifactBytes < rust.artifactBytes ? "zero" : "rust",
    artifactRatio: Number((Math.max(zero.artifactBytes, rust.artifactBytes) / Math.min(zero.artifactBytes, rust.artifactBytes)).toFixed(2))
  };
}

const results = [];
for (const benchCase of cases) {
  results.push(runLanguage(benchCase, buildZero));
  results.push(runLanguage(benchCase, buildRust));
}

const report = {
  generatedAt: new Date().toISOString(),
  runCount: runs,
  methodology: {
    zeroBuild: `${zeroBin} build --emit exe --target linux-musl-x64`,
    rustBuild: `${rustc} -O`,
    timing: "Node performance.now around process execution",
    caveat: "Local microbenchmarks; do not treat one run as a universal language performance claim."
  },
  environment: {
    os: process.platform,
    arch: process.arch,
    node: process.version,
    zero: toolVersion(zeroBin, ["--version"]),
    rust: toolVersion(rustc, ["--version"])
  },
  cases,
  comparisons: cases.map((benchCase) => compareRows(results, benchCase)).filter(Boolean),
  results
};

writeFileSync(join(resultsDir, "latest.json"), `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(join(uiDir, "results.js"), `window.BENCH_RESULTS = ${JSON.stringify(report, null, 2)};\n`);
console.log(JSON.stringify(report, null, 2));
