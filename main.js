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

    function getPlatformIcon(platform) {
        switch (platform) {
            case "Windows":
                return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#00ADEF" d="M1 3.75l9-1v8.25h-9V3.75zm10 0l13-1v8.25h-13V3.75zm-10 9.5l9-1v8.25h-9v-7.25zm10 0l13-1v8.25h-13v-7.25z"/>
                </svg>`;
            case "iOS":
                return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#000" d="M16.365 1.43c-.703.831-1.453 1.714-1.21 2.73.26 1.092 1.505 1.754 2.352 1.739.03-.92-.595-1.857-1.142-2.47z"/>
                </svg>`;
            case "Android":
                return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#3DDC84" d="M5 9h14v10H5z"/>
                </svg>`;
            default:
                return "";
        }
    }

    function updateCounters() {
        if (!countAll || !countWorking || !countPatched) return;

        countAll.textContent = exploits.length;
        countWorking.textContent = exploits.filter(e => e.detected === false).length;
        countPatched.textContent = exploits.filter(e => e.detected === true).length;
    }

    function render(data) {
        if (!list) return;
        list.innerHTML = "";

        if (!data || data.length === 0) {
            list.innerHTML = "<p>No exploit found.</p>";
            return;
        }

        data.forEach(ex => {
            const status = getStatusInfo(ex.detected);
            const icon = getPlatformIcon(ex.platform);

            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <h2>${ex.title || "Unknown"}</h2>
                <p>Platform: ${ex.platform || "N/A"} ${icon}</p>
                <span class="badge ${status.class}">${status.text}</span>
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
                e.title?.toLowerCase().includes(q)
            );
        }

        render(filtered);
    }

    // 🔥 FIX UTAMA ADA DI SINI
    async function loadExploits() {
        try {
            const res = await fetch(API_URL);

            if (!res.ok) {
                console.warn("API error:", res.status);
                showFallback();
                return;
            }

            const data = await res.json();
            if (!Array.isArray(data)) {
                showFallback();
                return;
            }

            exploits = data;
            updateCounters();
            applyFilters();

        } catch (err) {
            console.warn("Fetch gagal:", err);
            showFallback();
        }
    }

    function showFallback() {
        if (list) {
            list.innerHTML = `
                <div class="card">
                    <h2>Server Error</h2>
                    <p>API tidak tersedia saat ini</p>
                    <span class="badge patched">OFFLINE</span>
                </div>
            `;
        }
        if (countAll) countAll.textContent = "0";
        if (countWorking) countWorking.textContent = "0";
        if (countPatched) countPatched.textContent = "0";
    }

    // Event listeners
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelector(".filters .active")?.classList.remove("active");
            btn.classList.add("active");
            currentFilter = btn.dataset.filter;
            applyFilters();
        });
    });

    searchInput?.addEventListener("input", applyFilters);

    loadExploits();
});
