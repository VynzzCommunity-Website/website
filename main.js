const API_URL = "/api/exploits";

document.addEventListener("DOMContentLoaded", () => {
    const list = document.getElementById("exploit-list");
    const searchInput = document.getElementById("search");
    const filterButtons = document.querySelectorAll(".filters button");
    const modal = document.getElementById("exploit-modal");
    
    let exploits = [];
    let currentFilter = "all";

    // Fungsi pembantu untuk icon platform
    const getPlatformIcon = (p) => p === "Windows" ? "🪟" : p === "Android" ? "🤖" : p === "iOS" ? "🍎" : p === "Mac" ? "💻" : "";

    function updateCounters() {
        const countAll = document.getElementById("count-all");
        const countWorking = document.getElementById("count-working");
        const countPatched = document.getElementById("count-patched");
        if (countAll) countAll.textContent = exploits.length;
        if (countWorking) countWorking.textContent = exploits.filter(e => !e.detected).length;
        if (countPatched) countPatched.textContent = exploits.filter(e => e.detected).length;
    }

    function openModal(exploitId) {
        if (!modal) return;
        const ex = exploits.find(e => (e._id === exploitId || e.id === exploitId));
        if (!ex) return;

        modal.classList.remove("hidden");

        // Set Text Dasar
        document.getElementById("modal-title").textContent = ex.title || "Unknown";
        
        // FIX DESKRIPSI: Jika slug.fullDescription kosong, pakai deskripsi cadangan
        const descElement = document.getElementById("modal-description");
        descElement.textContent = (ex.slug?.fullDescription && ex.slug.fullDescription !== "") 
            ? ex.slug.fullDescription 
            : "No detailed description available for this exploit.";

        // FIX LOGO
        const logoImg = document.getElementById("modal-logo");
        if (logoImg) {
            logoImg.src = ex.slug?.logo || "";
            logoImg.style.display = ex.slug?.logo ? "block" : "none";
        }

        // FIX UNC/SUNC: Jika tidak ada di JSON, tampilkan N/A bukan 0%
        const uncElem = document.getElementById("modal-unc");
        const suncElem = document.getElementById("modal-sunc");
        
        if (uncElem) {
            const val = ex.uncPercentage !== undefined ? `${ex.uncPercentage}%` : "N/A";
            uncElem.innerHTML = `<span class="val">${val}</span><span class="lbl">UNC RATE</span>`;
        }
        if (suncElem) {
            const val = ex.suncPercentage !== undefined ? `${ex.suncPercentage}%` : "N/A";
            suncElem.innerHTML = `<span class="val">${val}</span><span class="lbl">SUNC RATE</span>`;
        }

        // INFO TAMBAHAN (GRID)
        const extraInfo = document.getElementById("modal-extra-info");
        if (extraInfo) {
            extraInfo.innerHTML = `
                <div class="info-item"><label>Status</label><span>${ex.detected ? '🔴 Patched' : '🟢 Working'}</span></div>
                <div class="info-item"><label>Price</label><span>${ex.free ? 'FREE' : (ex.cost || 'PAID')}</span></div>
                <div class="info-item"><label>Version</label><span>${ex.version || 'N/A'}</span></div>
                <div class="info-item"><label>Platform</label><span>${ex.platform}</span></div>
                <div class="info-item"><label>Decompiler</label><span>${ex.decompiler ? '✅' : '❌'}</span></div>
                <div class="info-item"><label>Key System</label><span>${ex.keysystem ? 'Yes' : 'No'}</span></div>
            `;
        }

        // LINK BUTTONS
        const webBtn = document.getElementById("modal-website");
        const discBtn = document.getElementById("modal-discord");
        if (webBtn) {
            webBtn.href = ex.websitelink || "#";
            webBtn.style.display = ex.websitelink ? "inline-block" : "none";
        }
        if (discBtn) {
            discBtn.href = ex.discordlink || "#";
            discBtn.style.display = ex.discordlink ? "inline-block" : "none";
        }
    }

    // RENDER LIST KARTU
    function render(data) {
        if (!list) return;
        list.innerHTML = "";
        data.forEach(ex => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <h2>${ex.title}</h2>
                <p>Platform: ${ex.platform} ${getPlatformIcon(ex.platform)}</p>
                <span class="badge ${ex.detected ? 'patched' : 'working'}">
                    ${ex.detected ? 'PATCHED' : 'WORKING'}
                </span>
            `;
            card.onclick = () => openModal(ex._id);
            list.appendChild(card);
        });
    }

    async function loadExploits() {
        try {
            const res = await fetch(API_URL);
            exploits = await res.json();
            updateCounters();
            render(exploits);
        } catch (err) {
            list.innerHTML = "<p>Error loading data.</p>";
        }
    }

    // Filter Logic
    filterButtons.forEach(btn => {
        btn.onclick = () => {
            document.querySelector(".filters .active")?.classList.remove("active");
            btn.classList.add("active");
            currentFilter = btn.dataset.filter;
            let filtered = exploits;
            if (currentFilter === "working") filtered = exploits.filter(e => !e.detected);
            if (currentFilter === "patched") filtered = exploits.filter(e => e.detected);
            render(filtered);
        };
    });

    document.getElementById("close-modal").onclick = () => modal.classList.add("hidden");
    window.onclick = (e) => { if (e.target === modal) modal.classList.add("hidden"); };

    loadExploits();
});