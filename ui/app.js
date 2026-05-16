const report = window.BENCH_RESULTS;
const summary = document.querySelector("#summary");
const cards = document.querySelector("#cards");
const rows = document.querySelector("#rows");

function fmt(value) {
  return typeof value === "number" ? value.toLocaleString(undefined, { maximumFractionDigits: 3 }) : "n/a";
}

function resultFor(caseName, language) {
  return report.results.find((row) => row.case === caseName && row.language === language);
}

if (!report) {
  summary.innerHTML = `<article class="stat"><strong>No results yet</strong><span>Run <code>npm run bench</code> first.</span></article>`;
} else {
  const ok = report.results.filter((row) => row.status === "ok").length;
  const rustWins = report.comparisons.filter((row) => row.fasterRuntime === "rust").length;
  const zeroSizeWins = report.comparisons.filter((row) => row.smallerArtifact === "zero").length;

  summary.innerHTML = `
    <article class="stat"><strong>${report.cases.length}</strong><span>benchmark cases</span></article>
    <article class="stat"><strong>${ok}/${report.results.length}</strong><span>successful runs</span></article>
    <article class="stat"><strong>${rustWins}</strong><span>Rust runtime wins</span></article>
    <article class="stat"><strong>${zeroSizeWins}</strong><span>Zero size wins</span></article>
  `;

  cards.innerHTML = report.cases.map((benchCase) => {
    const zero = resultFor(benchCase.name, "zero");
    const rust = resultFor(benchCase.name, "rust");
    const maxRun = Math.max(zero?.runMedianMs ?? 0, rust?.runMedianMs ?? 0, 1);
    const winner = zero && rust && zero.runMedianMs < rust.runMedianMs ? "zero" : "rust";
    return `
      <article class="card">
        <div class="card-head">
          <div>
            <h2>${benchCase.label}</h2>
            <p class="winner ${winner}">${winner.toUpperCase()} faster in this run</p>
          </div>
          <span class="badge">${benchCase.complexity}</span>
        </div>
        <div class="bars">
          <div class="bar-row">
            <div class="bar-label"><span>Zero median</span><span>${fmt(zero?.runMedianMs)} ms</span></div>
            <div class="track"><div class="fill zero" style="width:${Math.max(3, ((zero?.runMedianMs ?? 0) / maxRun) * 100)}%"></div></div>
          </div>
          <div class="bar-row">
            <div class="bar-label"><span>Rust median</span><span>${fmt(rust?.runMedianMs)} ms</span></div>
            <div class="track"><div class="fill rust" style="width:${Math.max(3, ((rust?.runMedianMs ?? 0) / maxRun) * 100)}%"></div></div>
          </div>
        </div>
      </article>
    `;
  }).join("");

  rows.innerHTML = report.results.map((row) => `
    <tr>
      <td>${row.label}</td>
      <td>${row.language}</td>
      <td>${row.status}</td>
      <td>${fmt(row.buildMs)}</td>
      <td>${fmt(row.runMedianMs)}</td>
      <td>${fmt(row.artifactBytes)}</td>
    </tr>
  `).join("");
}
