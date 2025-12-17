const API_URL = "/api/exploits";

document.addEventListener("DOMContentLoaded", () => {

    const list = document.getElementById("exploit-list");
    const searchInput = document.getElementById("search");
    const filterButtons = document.querySelectorAll(".filters button");

    const countAll = document.getElementById("count-all");
    const countWorking = document.getElementById("count-working");
    const countPatched = document.getElementById("count-patched");

    // MODAL ELEMENTS (BISA NULL)
    const modal = document.getElementById("exploit-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalDescription = document.getElementById("modal-description");
    const modalUNC = document.getElementById("modal-unc");
    const modalSUNC = document.getElementById("modal-sunc");
    const modalWebsite = document.getElementById("modal-website");
    const modalDiscord = document.getElementById("modal-discord");
    const modalLogo = document.getElementById("modal-logo");
    const closeModal = document.getElementById("close-modal");

    let exploits = [];
    let currentFilter = "all";

    function getStatusInfo(detected) {
        return detected
            ? { text: "PATCHED", class: "patched" }
            : { text: "WORKING", class: "working" };
    }

    function getPlatformIcon(platform) {
        if (platform === "Windows") return "🪟";
        if (platform === "Android") return "🤖";
        if (platform === "iOS") return "🍎";
        return "";
    }

    function updateCounters() {
        if (!countAll) return;
        countAll.textContent = exploits.length;
        countWorking.textContent = exploits.filter(e => !e.detected).length;
        countPatched.textContent = exploits.filter(e => e.detected).length;
    }

    // ⭐ MODAL (DETAIL DARI API)
    async function openModal(exploitId) {
        if (!modal) return;

        try {
            modalTitle && (modalTitle.textContent = "Loading...");
            modalDescription && (modalDescription.textContent = "");
            modal.classList.remove("hidden");

            const res = await fetch(`${API_URL}/${exploitId}`);
            if (!res.ok) throw new Error();

            const ex = await res.json();

            modalTitle && (modalTitle.textContent = ex.title || "Unknown");
            modalDescription && (
                modalDescription.textContent =
                    ex.slug?.fullDescription || "No description available."
            );

            modalUNC && (modalUNC.textContent = `UNC: ${ex.uncPercentage ?? "N/A"}%`);
            modalSUNC && (modalSUNC.textContent = `sUNC: ${ex.suncPercentage ?? "N/A"}%`);

            modalWebsite && (modalWebsite.href = ex.websitelink || "#");
            modalDiscord && (modalDiscord.href = ex.discordlink || "#");

            if (modalLogo) {
                modalLogo.src = ex.slug?.logo || "";
                modalLogo.style.display = modalLogo.src ? "block" : "none";
            }

        } catch {
            modalTitle && (modalTitle.textContent = "Failed to load exploit");
            modalDescription && (modalDescription.textContent = "");
        }
    }

    // ⭐ CLOSE MODAL (SAFE)
    if (closeModal && modal) {
        closeModal.onclick = () => modal.classList.add("hidden");
    }

    if (modal) {
        modal.onclick = e => {
            if (e.target === modal) modal.classList.add("hidden");
        };
    }

    // ⭐ RENDER LIST
    function render(data) {
        list.innerHTML = "";

        if (!data || data.length === 0) {
            list.innerHTML = "<p>No exploit found.</p>";
            return;
        }

        data.forEach(ex => {
            const status = getStatusInfo(ex.detected);

            const card = document.createElement("div");
            card.className = "card";
            card.style.cursor = "pointer";

            card.innerHTML = `
                <h2>${ex.title}</h2>
                <p>Platform: ${ex.platform} ${getPlatformIcon(ex.platform)}</p>
                <span class="badge ${status.class}">
                    ${status.text}
                </span>
            `;

            card.onclick = () => openModal(ex._id);
            list.appendChild(card);
        });
    }

    function applyFilters() {
        let filtered = [...exploits];

        if (currentFilter === "working") {
            filtered = filtered.filter(e => !e.detected);
        } else if (currentFilter === "patched") {
            filtered = filtered.filter(e => e.detected);
        }

        const q = searchInput?.value.toLowerCase();
        if (q) {
            filtered = filtered.filter(e =>
                e.title?.toLowerCase().includes(q)
            );
        }

        render(filtered);
    }

    async function loadExploits() {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error();

            exploits = await res.json();
            updateCounters();
            applyFilters();

        } catch {
            list.innerHTML = "<p>Failed to load data.</p>";
        }
    }

    filterButtons.forEach(btn => {
        btn.onclick = () => {
            document.querySelector(".filters .active")?.classList.remove("active");
            btn.classList.add("active");
            currentFilter = btn.dataset.filter;
            applyFilters();
        };
    });

    searchInput?.addEventListener("input", applyFilters);

    loadExploits();
});
