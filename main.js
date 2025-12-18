const API_URL = "/api/exploits";

document.addEventListener("DOMContentLoaded", function() {
    const list = document.getElementById("exploit-list");
    const searchInput = document.getElementById("search");
    const typeFilter = document.getElementById("type-filter");
    const modal = document.getElementById("exploit-modal");
    
    let exploits = [];
    let currentStatus = "all";

    // Fungsi Render Original Anda (Manual Grouping)
    function render(data) {
        if (!list) return;
        list.innerHTML = "";
        
        // Filter manual per platform (Logic asli Anda)
        const windows = data.filter(ex => ex.extype === "wexecutor");
        const androids = data.filter(ex => ex.extype === "aexecutor");
        const ios = data.filter(ex => ex.extype === "iexecutor");
        const macos = data.filter(ex => ex.extype === "mexecutor");
        const externals = data.filter(ex => ex.extype === "wexternal");

        const addGroup = (title, items) => {
            if (items.length > 0) {
                const h = document.createElement("div");
                h.className = "group-header";
                h.innerHTML = `<span>${title}</span>`;
                list.appendChild(h);
                
                const gridWrapper = document.createElement("div");
                gridWrapper.className = "grid";
                
                items.forEach(ex => {
                    const card = document.createElement("div");
                    card.className = `card ${ex.updateStatus ? 'status-working' : 'status-patched'}`;

                    let statusText = "UNDETECTED";
                    let badgeColorClass = "working"; 

                    if (ex.clientmods === true) {
                        statusText = "BYPASSED";
                        badgeColorClass = "bypassed"; 
                    } else if (ex.detected === true) {
                        statusText = "PATCHED";
                        badgeColorClass = "patched"; 
                    } else if (ex.clientmods === false) {
                        statusText = "DETECTED";
                        badgeColorClass = "detected-warn"; 
                    }

                    card.innerHTML = `
                        <h2>${ex.title}</h2>
                        <p>Platform: ${ex.platform}</p>
                        <span class="badge ${badgeColorClass}">${statusText}</span>
                    `;
                    
                    card.onclick = () => openModal(ex._id);
                    gridWrapper.appendChild(card);
                });
                list.appendChild(gridWrapper);
            }
        };

        // Urutan pemanggilan grup
        addGroup("WINDOWS EXECUTORS", windows);
        addGroup("ANDROID EXECUTORS", androids);
        addGroup("iOS EXECUTORS", ios);
        addGroup("MACOS EXECUTORS", macos);
        addGroup("EXTERNAL EXECUTORS", externals);
    }

    // Fungsi Modal yang sudah disinkronkan dengan CSS baru
    window.openModal = function(id) {
        const ex = exploits.find(e => (e._id === id || e.id === id));
        if (!ex) return;
        
        modal.classList.remove("hidden");
        
        // Update Title & Logo
        document.getElementById("modal-title").textContent = ex.title;
        document.getElementById("modal-logo").src = ex.slug?.logo || ex.logo || "";
        
        // Update Description (Fix slug)
        document.getElementById("modal-description").textContent = ex.slug?.fullDescription || ex.description || "No description available.";

        // Logic Warning Box & Status
        const warnBox = document.getElementById("modal-warning-text");
        let msg = "Status Unknown";
        let colorClass = "red";

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

        // Perbaikan Penamaan Tipe (Sesuai Permintaan)
        let displayType = "External";
        if (ex.extype === "wexecutor") {
            displayType = "Executor";
        } else if (ex.extype === "iexecutor") {
            displayType = "iOS Executor";
        } else if (ex.extype === "aexecutor") {
            displayType = "Android Executor";
        } else if (ex.extype === "mexecutor") {
            displayType = "MacOS";
        }

        const price = ex.free ? "FREE" : (ex.cost || "PAID");

        // Info Grid
        document.getElementById("modal-extra-info").innerHTML = `
            <div class="info-item"><label>Type</label><span>${displayType}</span></div>
            <div class="info-item"><label>Price</label><span>${price}</span></div>
            <div class="info-item"><label>Version</label><span>${ex.version || 'N/A'}</span></div>
            <div class="info-item"><label>Platform</label><span>${ex.platform || 'N/A'}</span></div>
        `;
        
        // UNC Stats
        document.getElementById("modal-unc").innerHTML = `<span class="val">${ex.uncPercentage || 0}%</span><span class="lbl">UNC</span>`;
        document.getElementById("modal-sunc").innerHTML = `<span class="val">${ex.suncPercentage || 0}%</span><span class="lbl">sUNC</span>`;

        // Buttons
        document.getElementById("modal-website").href = ex.websitelink || "#";
        document.getElementById("modal-discord").href = ex.discordlink || "#";
    };

    function applyFilters() {
        const query = searchInput.value.toLowerCase();
        const res = exploits.filter(ex => {
            const mSearch = ex.title.toLowerCase().includes(query);
            const mType = typeFilter.value === "all" || ex.extype === typeFilter.value;
            let mStatus = true;
            if (currentStatus === "working") mStatus = (ex.updateStatus === true);
            if (currentStatus === "patched") mStatus = (ex.updateStatus === false);
            return mSearch && mType && mStatus;
        });
        render(res);
    }

    async function loadData() {
        try {
            const response = await fetch(API_URL);
            exploits = await response.json();
            
            // Stats counter (Sinkron dengan HTML baru)
            const allEl = document.getElementById("count-all");
            if(allEl) allEl.textContent = exploits.length;
            
            const workEl = document.getElementById("count-working");
            if(workEl) workEl.textContent = exploits.filter(e => e.updateStatus === true).length;
            
            const patchEl = document.getElementById("count-patched");
            if(patchEl) patchEl.textContent = exploits.filter(e => e.updateStatus === false).length;
            
            applyFilters();
        } catch (err) {
            console.log("Error loading data:", err);
        }
    }

    // Event Listeners
    searchInput.oninput = applyFilters;
    if (typeFilter) typeFilter.onchange = applyFilters;

    document.querySelectorAll(".filters button").forEach(btn => {
        btn.onclick = () => {
            document.querySelector(".filters .active")?.classList.remove("active");
            btn.classList.add("active");
            currentStatus = btn.dataset.filter;
            applyFilters();
        };
    });

    document.getElementById("close-modal").onclick = () => modal.classList.add("hidden");
    
    window.onclick = (e) => {
        if (e.target === modal) modal.classList.add("hidden");
    };

    loadData();
});