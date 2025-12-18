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
                header.innerHTML = `<span style="display:block; margin: 20px 0 10px; font-weight:800; font-size:0.7rem; color:#6366f1;">${cat.label}</span>`;
                list.appendChild(header);
                
                const grid = document.createElement("div");
                grid.className = "grid";
                
                items.forEach(ex => {
                    const card = document.createElement("div");
                    card.className = "card";

                    let sText = "UNDETECTED";
                    let bClass = "working";

                    if (ex.clientmods) { sText = "BYPASSED"; bClass = "bypassed"; }
                    else if (ex.detected) { sText = "PATCHED"; bClass = "patched"; }
                    else if (ex.clientmods === false) { sText = "DETECTED"; bClass = "detected-warn"; }

                    card.innerHTML = `
                        <h2>${ex.title}</h2>
                        <p style="font-size:0.8rem; color:#94a3b8;">${ex.platform}</p>
                        <span class="badge ${bClass}">${sText}</span>
                    `;
                    
                    card.onclick = () => openModal(ex._id);
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
        document.getElementById("modal-description").textContent = ex.slug?.fullDescription || ex.description || "No description.";

        document.getElementById("modal-extra-info").innerHTML = `
            <div class="info-item"><label>Type</label><span>${ex.extype}</span></div>
            <div class="info-item"><label>Price</label><span>${ex.free ? "FREE" : "PAID"}</span></div>
            <div class="info-item"><label>Version</label><span>${ex.version || 'N/A'}</span></div>
            <div class="info-item"><label>Platform</label><span>${ex.platform || 'N/A'}</span></div>
        `;
        
        document.getElementById("modal-unc").innerHTML = `<b>UNC:</b> ${ex.uncPercentage || 0}%`;
        document.getElementById("modal-sunc").innerHTML = `<b>sUNC:</b> ${ex.suncPercentage || 0}%`;

        document.getElementById("modal-website").href = ex.websitelink || "#";
        document.getElementById("modal-discord").href = ex.discordlink || "#";
    };

    async function loadData() {
        try {
            const res = await fetch(API_URL);
            exploits = await res.json();
            render(exploits);
        } catch (e) { console.error(e); }
    }

    document.getElementById("close-modal").onclick = () => modal.classList.add("hidden");
    loadData();
});