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
                    card.className = `card ${ex.updateStatus ? 'status-working' : 'status-patched'}`;
                    
                    let sText = "UNDETECTED", bClass = "working";
                    if (ex.clientmods === true) { sText = "BYPASSED"; bClass = "bypassed"; }
                    else if (ex.detected === true) { sText = "PATCHED"; bClass = "patched"; }
                    else if (ex.clientmods === false) { sText = "DETECTED"; bClass = "detected-warn"; }

                    card.innerHTML = `
                        <h2>${ex.title}</h2>
                        <p>Platform: ${ex.platform}</p>
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
        
        // Header Modal (Logo samping judul)
        document.getElementById("modal-title").textContent = ex.title;
        document.getElementById("modal-logo").src = ex.slug?.logo || ex.logo || "";
        
        // Deskripsi dengan area scroll
        document.getElementById("modal-description").innerHTML = `
            <div class="desc-scroll-area">${ex.slug?.fullDescription || ex.description || "No description available."}</div>
        `;

        // Warning Box Status
        const warnBox = document.getElementById("modal-warning-text");
        let msg = "Status Unknown", color = "red";
        if (ex.clientmods === true) { msg = "Bypasses client modification bans."; color = "purple"; }
        else if (ex.clientmods === false) { msg = "Might be detected by Hyperion."; color = "orange"; }
        else if (ex.detected === false) { msg = "Reported as undetected."; color = "blue-hologram"; }
        warnBox.textContent = msg;
        warnBox.className = `warning-box ${color}`;

        // Info Grid
        let displayType = "External";
        if (ex.extype === "wexecutor") displayType = "Executor";
        else if (ex.extype === "iexecutor") displayType = "iOS Executor";
        else if (ex.extype === "aexecutor") displayType = "Android Executor";
        
        document.getElementById("modal-extra-info").innerHTML = `
            <div class="info-item"><label>Type</label><span class="val-styled">${displayType}</span></div>
            <div class="info-item"><label>Price</label><span class="val-styled highlight">${ex.free ? "FREE" : (ex.cost || "PAID")}</span></div>
            <div class="info-item"><label>Version</label><span class="val-styled">${ex.version || 'N/A'}</span></div>
            <div class="info-item"><label>Platform</label><span class="val-styled">${ex.platform || 'N/A'}</span></div>
        `;
        
        document.getElementById("modal-unc").innerHTML = `<span class="val">${ex.uncPercentage || 0}%</span><span class="lbl">UNC</span>`;
        document.getElementById("modal-sunc").innerHTML = `<span class="val">${ex.suncPercentage || 0}%</span><span class="lbl">sUNC</span>`;

        document.getElementById("modal-website").href = ex.websitelink || "#";
        document.getElementById("modal-discord").href = ex.discordlink || "#";
    };

    async function loadData() {
        try {
            const res = await fetch(API_URL);
            exploits = await res.json();
            
            if(document.getElementById("count-all")) document.getElementById("count-all").textContent = exploits.length;
            if(document.getElementById("count-working")) document.getElementById("count-working").textContent = exploits.filter(e => e.updateStatus).length;
            if(document.getElementById("count-patched")) document.getElementById("count-patched").textContent = exploits.filter(e => !e.updateStatus).length;
            
            render(exploits);
        } catch (e) { console.error(e); }
    }

    document.getElementById("close-modal").onclick = () => modal.classList.add("hidden");
    window.onclick = (e) => { if (e.target === modal) modal.classList.add("hidden"); };
    loadData();
});