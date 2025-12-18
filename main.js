const API_URL = "/api/exploits";

document.addEventListener("DOMContentLoaded", function() {
    const list = document.getElementById("exploit-list");
    const searchInput = document.getElementById("search");
    const typeFilter = document.getElementById("type-filter");
    const modal = document.getElementById("exploit-modal");
    
    let exploits = [];
    let currentStatus = "all";

    function render(data) {
        if (!list) return;
        list.innerHTML = "";
        
        const categories = [
            { label: "WINDOWS EXECUTORS", type: "wexecutor" },
            { label: "ANDROID EXECUTORS", type: "aexecutor" },
            { label: "iOS EXECUTORS", type: "iexecutor" },
            { label: "MACOS EXECUTORS", type: "mexecutor" },
            { label: "EXTERNAL EXECUTORS", type: "wexternal" }
        ];

        categories.forEach(cat => {
            const items = data.filter(ex => ex.extype === cat.type);
            if (items.length > 0) {
                const header = document.createElement("div");
                header.className = "group-header";
                header.innerHTML = `<span>${cat.label}</span>`;
                list.appendChild(header);
                
                const grid = document.createElement("div");
                grid.className = "grid";
                
                items.forEach(ex => {
                    const card = document.createElement("div");
                    const statusClass = ex.updateStatus ? 'status-working' : 'status-patched';
                    card.className = `card ${statusClass}`;

                    let sText = "UNDETECTED";
                    let bClass = "working";

                    if (ex.clientmods) { sText = "BYPASSED"; bClass = "bypassed"; }
                    else if (ex.detected) { sText = "PATCHED"; bClass = "patched"; }
                    else if (ex.clientmods === false) { sText = "DETECTED"; bClass = "detected-warn"; }

                    card.innerHTML = `
                        <h2>${ex.title}</h2>
                        <p>Platform: ${ex.platform}</p>
                        <span class="badge ${bClass}">${sText}</span>
                    `;
                    
                    card.onclick = () => openModal(ex._id || ex.id);
                    grid.appendChild(card);
                });
                list.appendChild(grid);
            }
        });
    }

window.openModal = function(id) {
        const ex = exploits.find(e => (e._id === id || e.id === id));
        if (!ex) return;
        
        modal.classList.remove("hidden");
        
        document.getElementById("modal-title").textContent = ex.title;
        document.getElementById("modal-logo").src = ex.slug?.logo || ex.logo || "";
        document.getElementById("modal-description").textContent = ex.slug?.fullDescription || ex.description || "No description available.";

        // --- LOGIKA PLATFORM (Mac -> MacOS) ---
        let displayPlatform = ex.platform || "N/A";
        if (displayPlatform.toLowerCase() === "mac" || displayPlatform.toLowerCase() === "macos") {
            displayPlatform = "MacOS";
        }
        document.getElementById("modal-platform").textContent = displayPlatform;
        // --------------------------------------

        const typeMap = { 
            'wexecutor': 'Executor', 
            'wexternal': 'External', 
            'aexecutor': 'Executor', 
            'iexecutor': 'Executor', 
            'mexecutor': 'Executor' 
        };
        document.getElementById("modal-type").textContent = typeMap[ex.extype] || "N/A";
        document.getElementById("modal-price").textContent = ex.free ? "FREE" : "PAID";
        document.getElementById("modal-version").textContent = ex.version || "N/A";

        const warnBox = document.getElementById("modal-warning-text");
        let msg = "Status Unknown";
        let colorClass = "orange";

        if (ex.clientmods === true) {
            msg = "This Exploit bypasses client modification bans but potentially could cause ban in banwaves";
            colorClass = "purple";
        } else if (ex.clientmods === false) {
            msg = "This Exploit might be detected by hyperion, use at your own risk";
            colorClass = "orange";
        } else if (ex.detected === false) {
            msg = "This Exploit is reported as undetected";
            colorClass = "blue-hologram";
        }

        warnBox.textContent = msg;
        warnBox.className = `warning-box ${colorClass}`;

        document.getElementById("modal-unc").innerHTML = `<span>${ex.uncPercentage || 0}%</span><label>UNC</label>`;
        document.getElementById("modal-sunc").innerHTML = `<span>${ex.suncPercentage || 0}%</span><label>sUNC</label>`;

        document.getElementById("modal-website").href = ex.websitelink || "#";
        document.getElementById("modal-discord").href = ex.discordlink || "#";
    };

    function applyFilters() {
        const query = searchInput.value.toLowerCase();
        const filtered = exploits.filter(ex => {
            const matchSearch = ex.title.toLowerCase().includes(query);
            const matchType = typeFilter.value === "all" || ex.extype === typeFilter.value;
            let matchStatus = true;
            if (currentStatus === "working") matchStatus = (ex.updateStatus === true);
            if (currentStatus === "patched") matchStatus = (ex.updateStatus === false);
            return matchSearch && matchType && matchStatus;
        });
        render(filtered);
    }

    async function loadData() {
        try {
            const res = await fetch(API_URL);
            exploits = await res.json();
            document.getElementById('count-all').textContent = exploits.length;
            document.getElementById('count-working').textContent = exploits.filter(e => e.updateStatus).length;
            document.getElementById('count-patched').textContent = exploits.filter(e => !e.updateStatus).length;
            applyFilters();
        } catch (e) { console.error(e); }
    }

    searchInput.oninput = applyFilters;
    typeFilter.onchange = applyFilters;
    document.querySelectorAll(".filters button").forEach(btn => {
        btn.onclick = () => {
            document.querySelector(".filters .active").classList.remove("active");
            btn.classList.add("active");
            currentStatus = btn.dataset.filter;
            applyFilters();
        };
    });
    document.getElementById("close-modal").onclick = () => modal.classList.add("hidden");
    loadData();
});