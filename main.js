const API_URL = "/api/exploits";

document.addEventListener("DOMContentLoaded", () => {
    const list = document.getElementById("exploit-list");
    const searchInput = document.getElementById("search");
    const filterButtons = document.querySelectorAll(".filters button");

    const countAll = document.getElementById("count-all");
    const countWorking = document.getElementById("count-working");
    const countPatched = document.getElementById("count-patched");

    let exploits = [];
    let currentFilter = "all";

    // detected: true = PATCHED
    // detected: false = WORKING
    function getStatusInfo(detected) {
        return detected
            ? { text: "PATCHED", class: "patched" }
            : { text: "WORKING", class: "working" };
    }

    function updateCounters() {
        if (!countAll || !countWorking || !countPatched) return;

        const workingCount = exploits.filter(e => e.detected === false).length;
        const patchedCount = exploits.filter(e => e.detected === true).length;

        countAll.textContent = exploits.length;
        countWorking.textContent = workingCount;
        countPatched.textContent = patchedCount;
    }

    function render(data) {
        if (!list) return;
        list.innerHTML = "";

        if (!data || data.length === 0) {
            list.innerHTML = "<p>No exploit found.</p>";
            return;
        }

        data.forEach(ex => {
            const card = document.createElement("div");
            card.className = "card";

            const status = getStatusInfo(ex.detected);

            card.innerHTML = `
                <h2>${ex.title || "Unknown Name"}</h2>
                <p>Platform: ${ex.platform || "N/A"}</p>
                <span class="badge ${status.class}">
                    ${status.text}
                </span>
            `;

            list.appendChild(card);
        });
    }

    function applyFilters() {
        let filtered = [...exploits];

        if (currentFilter === "working") {
            filtered = filtered.filter(e => e.detected === false);
        } else if (currentFilter === "patched") {
            filtered = filtered.filter(e => e.detected === true);
        }

        const q = searchInput?.value.toLowerCase();
        if (q) {
            filtered = filtered.filter(e =>
                e.title && e.title.toLowerCase().includes(q)
            );
        }

        render(filtered);
    }

    async function loadExploits() {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            exploits = await res.json();
            updateCounters();
            applyFilters();
        } catch (err) {
            console.error("Gagal load:", err);
            if (list) list.innerHTML = "<p>Failed to load data.</p>";
        }
    }

    // Event Listeners
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const active = document.querySelector(".filters .active");
            if (active) active.classList.remove("active");

            btn.classList.add("active");
            currentFilter = btn.dataset.filter;
            applyFilters();
        });
    });

    searchInput?.addEventListener("input", applyFilters);

    loadExploits();
});
