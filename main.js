const API_URL = "/api/exploits";

document.addEventListener("DOMContentLoaded", () => {
    const list = document.getElementById("exploit-list");
    const searchInput = document.getElementById("search");
    const typeFilter = document.getElementById("type-filter");
    const filterButtons = document.querySelectorAll(".filters button");
    const modal = document.getElementById("exploit-modal");
    
    let exploits = [];
    let currentStatus = "all";

    // Fungsi Render List
    function render(data) {
        if (!list) return;
        list.innerHTML = "";
        
        if (data.length === 0) {
            list.innerHTML = "<p style='text-align:center; color:#6b7280; grid-column: 1/-1; padding: 20px;'>No exploit found.</p>";
            return;
        }

        data.forEach(ex => {
            const card = document.createElement("div");
            card.className = "card";
            card.style.cursor = "pointer";
            
            const typeLabel = ex.extype === 'wexternal' ? 'External' : (ex.extype === 'mexecutor' ? 'MacOS' : 'Internal');
            
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <h2 style="margin:0; font-size:1.1rem;">${ex.title}</h2>
                    <span style="font-size:0.65rem; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px;">${typeLabel}</span>
                </div>
                <p style="margin: 10px 0; font-size:0.85rem; color:#9ca3af;">Platform: ${ex.platform}</p>
                <span class="badge ${ex.detected ? 'patched' : 'working'}">
                    ${ex.detected ? 'PATCHED' : 'WORKING'}
                </span>
            `;
            card.onclick = () => openModal(ex._id);
            list.appendChild(card);
        });
    }

    // ⭐ LOGIKA FILTER UTAMA (Satu fungsi untuk semua)
    function applyFilters() {
        let filtered = [...exploits];

        // 1. Filter Kata Kunci (Search)
        const query = searchInput.value.toLowerCase().trim();
        if (query !== "") {
            filtered = filtered.filter(ex => 
                ex.title.toLowerCase().includes(query) || 
                (ex.platform && ex.platform.toLowerCase().includes(query))
            );
        }

        // 2. Filter Status (All/Working/Patched)
        if (currentStatus === "working") {
            filtered = filtered.filter(ex => !ex.detected);
        } else if (currentStatus === "patched") {
            filtered = filtered.filter(ex => ex.detected);
        }

        // 3. Filter Tipe (Dropdown)
        const selectedType = typeFilter.value;
        if (selectedType !== "all") {
            filtered = filtered.filter(ex => ex.extype === selectedType);
        }

        render(filtered);
    }

    // Ambil Data dari API
    async function loadExploits() {
        try {
            const res = await fetch(API_URL);
            exploits = await res.json();
            
            // Update Angka Counter
            document.getElementById("count-all").textContent = exploits.length;
            document.getElementById("count-working").textContent = exploits.filter(e => !e.detected).length;
            document.getElementById("count-patched").textContent = exploits.filter(e => e.detected).length;

            applyFilters();
        } catch (err) {
            console.error("Fetch error:", err);
        }
    }

    // --- EVENT LISTENERS ---

    // Search Input (Real-time)
    searchInput.addEventListener("input", applyFilters);

    // Dropdown Tipe
    typeFilter.addEventListener("change", applyFilters);

    // Tombol Status (Working/Patched)
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelector(".filters .active")?.classList.remove("active");
            btn.classList.add("active");
            currentStatus = btn.dataset.filter;
            applyFilters();
        });
    });

    // Modal & Close Logic
    function openModal(id) {
        const ex = exploits.find(e => e._id === id);
        if (!ex) return;
        
        modal.classList.remove("hidden");
        document.getElementById("modal-title").textContent = ex.title;
        document.getElementById("modal-description").textContent = ex.slug?.fullDescription || "No description available.";
        document.getElementById("modal-unc").innerHTML = `<span class="val">${ex.uncPercentage ?? 'N/A'}%</span><span class="lbl">UNC</span>`;
        document.getElementById("modal-sunc").innerHTML = `<span class="val">${ex.suncPercentage ?? 'N/A'}%</span><span class="lbl">sUNC</span>`;
        
        const extra = document.getElementById("modal-extra-info");
        extra.innerHTML = `
            <div class="info-item"><label>Price</label><span>${ex.free ? 'FREE' : (ex.cost || 'PAID')}</span></div>
            <div class="info-item"><label>Version</label><span>${ex.version || 'N/A'}</span></div>
        `;

        document.getElementById("modal-website").href = ex.websitelink || "#";
        document.getElementById("modal-discord").href = ex.discordlink || "#";
    }

    document.getElementById("close-modal").onclick = () => modal.classList.add("hidden");
    window.onclick = (e) => { if (e.target === modal) modal.classList.add("hidden"); };

    loadExploits();
});