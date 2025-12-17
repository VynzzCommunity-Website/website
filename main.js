const API_URL = "/api/exploits";

document.addEventListener("DOMContentLoaded", () => {
    const list = document.getElementById("exploit-list");
    const searchInput = document.getElementById("search");
    const filterButtons = document.querySelectorAll(".filters button");

    const countAll = document.getElementById("count-all");
    const countWorking = document.getElementById("count-working");
    const countPatched = document.getElementById("count-patched");

    // MODAL ELEMENTS
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

    // ⭐ FUNGSI MODAL DENGAN DETAIL LENGKAP
    function openModal(exploitId) {
        if (!modal) return;

        // Cari data di memori lokal berdasarkan ID
        const ex = exploits.find(e => (e._id === exploitId || e.id === exploitId));

        if (!ex) {
            console.error("Exploit data not found locally.");
            return;
        }

        // Tampilkan Modal
        modal.classList.remove("hidden");

        // 1. Masukkan Data Dasar
        if (modalTitle) modalTitle.textContent = ex.title || "Unknown";
        if (modalDescription) {
            modalDescription.textContent = ex.slug?.fullDescription || ex.description || "No description available.";
        }

        // 2. Masukkan Logo
        if (modalLogo) {
            const logoSrc = ex.slug?.logo || ex.logo || "";
            modalLogo.src = logoSrc;
            modalLogo.style.display = logoSrc ? "block" : "none";
        }

        // 3. Masukkan UNC & SUNC (Stats Row)
        if (modalUNC) {
            modalUNC.innerHTML = `<span class="val">${ex.uncPercentage ?? 0}%</span><span class="lbl">UNC RATE</span>`;
        }
        if (modalSUNC) {
            modalSUNC.innerHTML = `<span class="val">${ex.suncPercentage ?? 0}%</span><span class="lbl">SUNC RATE</span>`;
        }

        // 4. Masukkan Info Tambahan (Grid) ke elemen baru "modal-extra-info"
        const extraInfoContainer = document.getElementById("modal-extra-info");
        if (extraInfoContainer) {
            extraInfoContainer.innerHTML = `
                <div class="info-item"><label>Price</label><span>${ex.free ? 'FREE 🔓' : 'PAID 💰'}</span></div>
                <div class="info-item"><label>Version</label><span>${ex.version || 'N/A'}</span></div>
                <div class="info-item"><label>Decompiler</label><span>${ex.decompiler ? '✅' : '❌'}</span></div>
                <div class="info-item"><label>Multi-Inject</label><span>${ex.multiInject ? '✅' : '❌'}</span></div>
                <div class="info-item"><label>Platform</label><span>${ex.platform}</span></div>
                <div class="info-item"><label>Updated</label><span>${ex.updatedDate || 'Recently'}</span></div>
            `;
        }

        // 5. Link Website & Discord
        if (modalWebsite) {
            modalWebsite.href = ex.websitelink || "#";
            modalWebsite.style.display = ex.websitelink ? "block" : "none";
        }
        if (modalDiscord) {
            modalDiscord.href = ex.discordlink || "#";
            modalDiscord.style.display = ex.discordlink ? "block" : "none";
        }
    }

    // ⭐ LOGIKA TUTUP MODAL
    if (closeModal) {
        closeModal.onclick = () => modal.classList.add("hidden");
    }

    window.onclick = (e) => {
        if (e.target === modal) modal.classList.add("hidden");
    };

    // ⭐ RENDER LIST KARTU
    function render(data) {
        if (!list) return;
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

            // Klik kartu untuk buka modal
            card.onclick = () => openModal(ex._id || ex.id);
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

    // ⭐ LOAD DATA AWAL
    async function loadExploits() {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error();

            exploits = await res.json();
            updateCounters();
            applyFilters();

        } catch (err) {
            console.error("Load error:", err);
            if (list) list.innerHTML = "<p>Failed to load data from API.</p>";
        }
    }

    // EVENT LISTENERS
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