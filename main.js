const API_URL = "/api/exploits";

document.addEventListener("DOMContentLoaded", () => {
    const list = document.getElementById("exploit-list");
    const searchInput = document.getElementById("search");
    const typeFilter = document.getElementById("type-filter");
    const filterButtons = document.querySelectorAll(".filters button");
    const modal = document.getElementById("exploit-modal");
    
    let exploits = [];
    let currentStatus = "all";

    function render(data) {
        if (!list) return;
        list.innerHTML = "";
        
        const internals = data.filter(ex => ex.extype === "wexecutor");
        const externals = data.filter(ex => ex.extype === "wexternal");
        const macos = data.filter(ex => ex.extype === "mexecutor");

        const createCard = (ex) => {
            const card = document.createElement("div");
            
            // --- 1. WARNA BACKGROUND (Hanya updateStatus) ---
            if (ex.updateStatus === true) {
                card.className = "card status-working"; 
            } else {
                card.className = "card status-patched"; 
            }

            // --- 2. TEKS BADGE (URUTAN PRIORITAS BARU) ---
            let statusText = "";
            let badgeColorClass = ""; 

            if (ex.clientmods === true) {
                // PRIORITAS UTAMA: Clientmods
                statusText = "BYPASSED";
                badgeColorClass = "bypassed"; 
            } else if (ex.detected === true) {
                // PRIORITAS KEDUA: Detected
                statusText = "PATCHED";
                badgeColorClass = "patched"; 
            } else if (ex.clientmods === false) {
                statusText = "DETECTED";
                badgeColorClass = "detected-warn"; 
            } else {
                statusText = "UNDETECTED";
                badgeColorClass = "working"; 
            }

            card.innerHTML = `
                <h2>${ex.title}</h2>
                <p>Platform: ${ex.platform}</p>
                <span class="badge ${badgeColorClass}">${statusText}</span>
            `;
            
            card.onclick = () => openModal(ex._id);
            return card;
        };

        const addGroup = (title, items) => {
            if (items.length > 0) {
                const h = document.createElement("div");
                h.className = "group-header";
                h.innerHTML = `<span>${title}</span>`;
                list.appendChild(h);
                
                const gridDiv = document.createElement("div");
                gridDiv.className = "grid";
                items.forEach(ex => gridDiv.appendChild(createCard(ex)));
                list.appendChild(gridDiv);
            }
        };

        addGroup("INTERNAL EXECUTORS", internals);
        addGroup("EXTERNAL EXECUTORS", externals);
        addGroup("MACOS EXECUTORS", macos);
    }

    function openModal(id) {
        const ex = exploits.find(e => (e._id === id || e.id === id));
        if (!ex) return;
        
        modal.classList.remove("hidden");
        document.getElementById("modal-title").textContent = ex.title;
        document.getElementById("modal-logo").src = ex.logo || "https://via.placeholder.com/60";
        document.getElementById("modal-description").textContent = ex.description || ex.cost || "No description.";

        const warnBox = document.getElementById("modal-warning-text");
        
        // --- PERBAIKAN DI SINI: URUTAN PRIORITAS MODAL ---
        let modalTag = "";
        if (ex.clientmods === true) {
            modalTag = "BYPASSED"; // Sekarang Clientmods dicek paling pertama
        } else if (ex.detected === true) {
            modalTag = "PATCHED";
        } else if (ex.clientmods === false) {
            modalTag = "DETECTED";
        } else {
            modalTag = "UNDETECTED";
        }

        // Logika Pesan di Warning Box (Tetap melihat updateStatus)
        let warnText = ex.updateStatus === true ? "Exploit is up to date." : "Update required/Patched.";
        let warnColor = ex.updateStatus === true ? "green" : "red";

        warnBox.textContent = `Status: ${modalTag} - ${warnText}`;
        warnBox.className = `warning-box ${warnColor}`;

        const displayType = ex.extype === "wexecutor" ? "Internal" : (ex.extype === "mexecutor" ? "MacOS" : "External");
        const displayPrice = ex.free ? "FREE" : (ex.cost || "PAID");

        document.getElementById("modal-extra-info").innerHTML = `
            <div class="info-item"><label>Status</label><span>${modalTag}</span></div>
            <div class="info-item"><label>Type</label><span>${displayType}</span></div>
            <div class="info-item"><label>Price</label><span>${displayPrice}</span></div>
            <div class="info-item"><label>Version</label><span>${ex.version || 'N/A'}</span></div>
        `;
        
        document.getElementById("modal-unc").innerHTML = `<span class="val">${ex.uncPercentage || 0}%</span><span class="lbl">UNC</span>`;
        document.getElementById("modal-sunc").innerHTML = `<span class="val">${ex.suncPercentage || 0}%</span><span class="lbl">sUNC</span>`;

        document.getElementById("modal-website").href = ex.websitelink || "#";
        document.getElementById("modal-discord").href = ex.discordlink || "#";
    }

    function applyFilters() {
        let f = exploits.filter(ex => {
            const matchSearch = ex.title.toLowerCase().includes(searchInput.value.toLowerCase());
            const matchType = typeFilter.value === "all" || ex.extype === typeFilter.value;
            let matchStatus = true;
            if (currentStatus === "working") matchStatus = (ex.updateStatus === true);
            if (currentStatus === "patched") matchStatus = (ex.updateStatus === false);
            return matchSearch && matchType && matchStatus;
        });
        render(f);
    }

    async function load() {
        try {
            const res = await fetch(API_URL);
            exploits = await res.json();
            
            const countAll = document.getElementById("count-all");
            const countWorking = document.getElementById("count-working");
            const countPatched = document.getElementById("count-patched");

            if(countAll) countAll.textContent = exploits.length;
            if(countWorking) countWorking.textContent = exploits.filter(e => e.updateStatus === true).length;
            if(countPatched) countPatched.textContent = exploits.filter(e => e.updateStatus === false).length;
            
            applyFilters();
        } catch (e) { console.error("Error load:", e); }
    }

    searchInput.addEventListener("input", applyFilters);
    if(typeFilter) typeFilter.addEventListener("change", applyFilters);
    
    filterButtons.forEach(btn => btn.onclick = () => {
        document.querySelector(".filters .active")?.classList.remove("active");
        btn.classList.add("active");
        currentStatus = btn.dataset.filter;
        applyFilters();
    });

    const closeBtn = document.getElementById("close-modal");
    if(closeBtn) closeBtn.onclick = () => modal.classList.add("hidden");

    load();
});