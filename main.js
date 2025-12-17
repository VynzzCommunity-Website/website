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

    // detected: true = PATCHED, false = WORKING
    function getStatusInfo(detected) {
        return detected
            ? { text: "PATCHED", class: "patched" }
            : { text: "WORKING", class: "working" };
    }

    // Fungsi untuk mengembalikan SVG icon sesuai platform
    function getPlatformIcon(platform) {
        switch (platform) {
            case "Windows":
                return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                          <path fill="#00ADEF" d="M1 3.75l9-1v8.25h-9V3.75zm10 0l13-1v8.25h-13V3.75zm-10 9.5l9-1v8.25h-9v-7.25zm10 0l13-1v8.25h-13v-7.25z"/>
                        </svg>`;
            case "iOS":
                return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                          <path fill="#000000" d="M16.365 1.43c-.703.831-1.453 1.714-1.21 2.73.26 1.092 1.505 1.754 2.352 1.739.03-.92-.595-1.857-1.142-2.47-.403-.443-.7-.653-1-.01zm-1.365 3.57c-1.252 0-2.695.733-3.47 2.012-1.11 1.632-.92 4.5.525 6.18.35.404.764.835 1.227 1.33.572.635 1.19 1.316 1.852 1.316.618 0 .938-.404 1.75-.404.798 0 1.042.404 1.754.404.657 0 1.27-.697 1.85-1.334.463-.494.875-.924 1.224-1.328 1.445-1.68 1.634-4.548.525-6.18-1.086-1.596-2.762-2.014-4.187-2.014z"/>
                        </svg>`;
            case "Android":
                return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                          <path fill="#3DDC84" d="M17.25 4.5l.75-1.5 1.5.75-.75 1.5-1.5-.75zM6.75 4.5l-.75-1.5-1.5.75.75 1.5 1.5-.75zM5 9h14v10H5V9zm0 0l2-6h10l2 6H5z"/>
                        </svg>`;
            default:
                return ""; // kalau platform tidak dikenali
        }
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
            const platformIcon = getPlatformIcon(ex.platform);

            card.innerHTML = `
                <h2>${ex.title || "Unknown Name"}</h2>
                <p>
                  Platform: ${ex.platform || "N/A"} 
                  ${platformIcon}
                </p>
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
