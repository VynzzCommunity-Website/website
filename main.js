const API_URL = "/api/exploits";

const list = document.getElementById("exploit-list");
const searchInput = document.getElementById("search");
const filterButtons = document.querySelectorAll(".filters button");

const countAll = document.getElementById("count-all");
const countWorking = document.getElementById("count-working");
const countPatched = document.getElementById("count-patched");

let exploits = [];
let currentFilter = "all";

function statusClass(status = "") {
  status = status.toLowerCase();
  if (status.includes("work")) return "working";
  if (status.includes("patch")) return "patched";
  return "unknown";
}

function showLoading() {
  list.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    const skel = document.createElement("div");
    skel.className = "skeleton";
    list.appendChild(skel);
  }
}

function updateCounters() {
  const working = exploits.filter(e =>
    e.status?.toLowerCase().includes("work")
  ).length;

  const patched = exploits.filter(e =>
    e.status?.toLowerCase().includes("patch")
  ).length;

  countAll.textContent = exploits.length;
  countWorking.textContent = working;
  countPatched.textContent = patched;
}

function render(data) {
  list.innerHTML = "";

  if (data.length === 0) {
    list.innerHTML = "<p>No exploit found.</p>";
    return;
  }

  data.forEach(ex => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h2>${ex.name}</h2>
      <span class="badge ${statusClass(ex.status)}">
        ${ex.status || "UNKNOWN"}
      </span>
    `;

    list.appendChild(card);
  });
}

function applyFilters() {
  let filtered = [...exploits];

  if (currentFilter === "working") {
    filtered = filtered.filter(e =>
      e.status?.toLowerCase().includes("work")
    );
  }

  if (currentFilter === "patched") {
    filtered = filtered.filter(e =>
      e.status?.toLowerCase().includes("patch")
    );
  }

  const q = searchInput.value.toLowerCase();
  if (q) {
    filtered = filtered.filter(e =>
      e.name.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => {
    const aw = a.status?.toLowerCase().includes("work");
    const bw = b.status?.toLowerCase().includes("work");
    return bw - aw;
  });

  render(filtered);
}

async function loadExploits() {
  showLoading();
  try {
    const res = await fetch(API_URL);
    exploits = await res.json();
    updateCounters();
    applyFilters();
  } catch {
    list.innerHTML = "<p>Failed to load data.</p>";
  }
}

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".filters .active").classList.remove("active");
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    applyFilters();
  });
});

searchInput.addEventListener("input", applyFilters);

loadExploits();
setInterval(loadExploits, 60000);
