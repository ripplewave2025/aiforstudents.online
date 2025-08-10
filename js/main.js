// tiny helper: fetch + cache JSON
const cache = {};
async function getJSON(path) {
  if (cache[path]) return cache[path];
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return (cache[path] = await res.json());
}

// copy buttons (works site-wide)
document.addEventListener("click", (e) => {
  const b = e.target.closest(".copy");
  if (!b) return;
  const t = b.dataset.text || b.textContent || "";
  navigator.clipboard.writeText(t);
  b.textContent = "Copied!";
  setTimeout(() => (b.textContent = "Copy"), 900);
});

// -------- TOOLS PAGE --------
async function initTools() {
  const grid = document.getElementById("tools-grid");
  if (!grid) return; // not on tools page

  const [tools] = await Promise.all([getJSON("./data/tools.json")]);

  // precompute search text
  tools.forEach((t) => {
    t._search = (
      t.name +
      " " +
      (t.goodAt || []).join(" ") +
      " " +
      (t.prompts || []).join(" ")
    )
      .toLowerCase()
      .trim();
  });

  const q = document.getElementById("q");
  const gradeSel = document.getElementById("grade");

  const render = (list) => {
    grid.innerHTML = list
      .map(
        (t) => `
      <div class="card"><div class="pad">
        <div class="row"><strong>${t.name}</strong>
          <span class="badge">${(t.goodAt || []).slice(0,1).join("") || "Tool"}</span>
        </div>
        <p class="small">Best for: ${(t.goodAt || []).join(", ")}</p>
        <div class="code">${t.prompts?.[0] || ""}</div>
        <div class="row">
          <button class="copy" data-text="${(t.prompts?.[0] || "").replace(/"/g, "&quot;")}">Copy</button>
          <a class="btn" href="${t.url}" target="_blank" rel="noopener noreferrer">Open</a>
        </div>
        ${
          (t.prompts || []).slice(1).length
            ? `<h2>More prompts</h2>
               <div class="grid" style="grid-template-columns:1fr;">
                 ${(t.prompts || [])
                   .slice(1)
                   .map(
                     (p) =>
                       `<button class="copy" data-text="${p.replace(/"/g, "&quot;")}">Copy</button>`
                   )
                   .join("")}
               </div>`
            : ""
        }
        <div class="small" style="margin-top:8px;">Not for: ${(t.notFor || []).join(", ")}</div>
      </div></div>`
      )
      .join("");
  };

  const filter = () => {
    const g = Number(gradeSel.value || 0);
    const text = (q.value || "").toLowerCase().trim();
    const list = tools.filter((t) => {
      const gradeOK = !g || (t.gradeMin <= g && g <= t.gradeMax);
      const textOK = !text || t._search.includes(text);
      return gradeOK && textOK;
    });
    document.getElementById("no-results").style.display = list.length ? "none" : "block";
    render(list);
  };

  // debounce input
  let timer;
  q?.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(filter, 180);
  });
  gradeSel?.addEventListener("change", filter);

  render(tools);
}

// -------- LEARN PAGE --------
async function initLearn() {
  const list = document.getElementById("lessons-list");
  if (!list) return; // not on learn page

  const lessons = await getJSON("./data/lessons.json");
  list.innerHTML = lessons
    .map(
      (l) => `
    <div class="card"><div class="pad">
      <h2>${l.title}</h2>
      <div class="small">Class ${l.gradeMin}–${l.gradeMax} • ${l.minutes} min</div>
      <ul class="small" style="margin-top:6px;">
        ${(l.bullets || []).map((b) => `<li>${b}</li>`).join("")}
      </ul>
    </div></div>`
    )
    .join("");
}

initTools();
initLearn();
