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
            
            // WARNA BACKGROUND (UpdateStatus)
            if (ex.updateStatus === true) {
                card.className = "card status-working"; 
            } else {
                card.className = "card status-patched"; 
            }

            // TEKS BADGE (Detected & Clientmods)
            let statusText = "";
            let badgeColorClass = ""; 

            if (ex.clientmods === true) {
                statusText = "BYPASSED";
                badgeColorClass = "bypassed"; 
            } else if (ex.detected === true) {
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
        
        // --- LOGIKA PESAN DINAMIS BARU ---
        let customMsg = "";
        let msgColor = "";

        if (ex.clientmods === true) {
            customMsg = "This Exploits bypasses client modification bans but potentially could cause ban in banwaves";
            msgColor = "purple";
        } else if (ex.clientmods === false) {
            customMsg = "This Exploit might be detected by hyperion, use at your own risk";
            msgColor = "orange";
        } else if (ex.detected === false) {
            customMsg = "This Exploit is reported as undetected";
            msgColor = "blue-hologram";
        } else {
            customMsg = "Status Unknown";
            msgColor = "red";
        }

        warnBox.textContent = customMsg;
        warnBox.className = `warning-box ${msgColor}`;

        // Info platform & harga
        const displayType = ex.extype === "wexecutor" ? "Internal" : (ex.extype === "mexecutor" ? "MacOS" : "External");
        const displayPrice = ex.free ? "FREE" : (ex.cost || "PAID");

        document.getElementById("modal-extra-info").innerHTML = `
            <div class="info-item"><label>Type</label><span>${displayType}</span></div>
            <div class="info-item"><label>Price</label><span>${displayPrice}</span></div>
            <div class="info-item"><label>Version</label><span>${ex.version || 'N/A'}</span></div>
        `;
        
        document.getElementById("modal-unc").innerHTML = `<span class="val">${ex.uncPercentage || 0}%</span><span class="lbl">UNC</span>`;
        document.getElementById("modal-sunc").innerHTML = `<span class="val">${ex.suncPercentage || 0}%</span><span class="lbl">sUNC</span>`;

        document.getElementById("modal-website").href = ex.websitelink || "#";
        document.getElementById("modal-discord").href = ex.discordlink || "#";
    }

    // Filter, Search, dan Load tetap sama
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
            document.getElementById("count-all").textContent = exploits.length;
            document.getElementById("count-working").textContent = exploits.filter(e => e.updateStatus === true).length;
            document.getElementById("count-patched").textContent = exploits.filter(e => e.updateStatus === false).length;
            applyFilters();
        } catch (e) { console.error(e); }
    }

    searchInput.addEventListener("input", applyFilters);
    if(typeFilter) typeFilter.addEventListener("change", applyFilters);
    filterButtons.forEach(btn => btn.onclick = () => {
        document.querySelector(".filters .active").classList.remove("active");
        btn.classList.add("active");
        currentStatus = btn.dataset.filter;
        applyFilters();
    });
    document.getElementById("close-modal").onclick = () => modal.classList.add("hidden");
    load();
});