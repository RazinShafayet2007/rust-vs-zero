# Rust vs Zero Benchmarks

Local benchmark suite for comparing small Rust and Zero programs on the same machine.

This project is intentionally lightweight. It compiles equivalent benchmark programs, runs each executable multiple times, validates stdout, records build/runtime/artifact-size metrics, and renders the latest results in a static UI.

Fork or clone this repository if you want to run the benchmarks on your own machine. The generated results are local to your hardware, OS, compiler versions, and current system load, so running them yourself is the useful comparison point.

## Requirements

- Node.js
- `rustc`
- Zero compiler available at `/home/razin/zero/bin/zero` or on `PATH` as `zero`

Check tools:

```sh
node --version
rustc --version
/home/razin/zero/bin/zero --version
```

If you want to use another Zero binary:

```sh
ZERO_BIN=/path/to/zero npm run bench
```

## Run Benchmarks

Clone your fork or this repository, then enter the project folder:

```sh
git clone <your-rust-vs-zero-repo-url>
cd rust-vs-zero
```

Run the default benchmark suite:

```sh
npm run bench
```

Fast one-run smoke check:

```sh
npm run bench:smoke
```

Change the number of runtime samples:

```sh
BENCH_RUNS=5 npm run bench
```

## Open The UI

After running benchmarks:

```sh
npm run ui
```

Open:

```txt
http://localhost:4173
```

The UI reads the latest generated data from:

```txt
ui/results.js
```

## Benchmarks

Current cases:

- `startup`: minimal program that prints `ok`
- `arithmetic`: integer arithmetic loop
- `branches`: branch-heavy loop
- `memory`: fixed-array copy/update workload
- `parser`: byte scanner with digit/letter/other classification

Source files live in:

```txt
benchmarks/zero/*.0
benchmarks/rust/*.rs
```

Each benchmark prints `ok` when its checksum/result matches the expected value. The runner marks a row as failed if output differs.

## Outputs

The runner writes:

```txt
results/latest.json
ui/results.js
```

Temporary compiled executables are written to:

```txt
.out/
```

## Metrics

- `buildMs`: compiler process time
- `runMedianMs`: median runtime across samples
- `runMinMs`: fastest runtime sample
- `runSamplesMs`: raw runtime samples
- `artifactBytes`: executable size
- `compressedArtifactBytes`: gzip-compressed executable size
- `outputMatches`: whether stdout matched expected output

## Notes

These are local microbenchmarks, not definitive language-wide performance claims. Results depend on CPU load, compiler versions, target selection, optimization behavior, and benchmark design.

Use the numbers as a quick local signal only:

- Rust generally shows optimized runtime performance on CPU-heavy loops.
- Zero currently produces very small direct executables for these cases.
- Startup timings can be noisy because process-launch overhead dominates.
