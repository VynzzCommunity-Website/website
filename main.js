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
        list.innerHTML = ""; // Ini yang menghapus isi sebelumnya
        
        const windows = data.filter(ex => ex.extype === "wexecutor");
        const androids = data.filter(ex => ex.extype === "aexecutor");
        const ios = data.filter(ex => ex.extype === "iexecutor");
        const macos = data.filter(ex => ex.extype === "mexecutor");
        const externals = data.filter(ex => ex.extype === "wexternal");

        const createCard = (ex) => {
            const card = document.createElement("div");
            
            if (ex.updateStatus === true) {
                card.className = "card status-working"; 
            } else {
                card.className = "card status-patched"; 
            }

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
                
                const gridWrapper = document.createElement("div");
                gridWrapper.className = "grid";
                
                items.forEach(ex => gridWrapper.appendChild(createCard(ex)));
                list.appendChild(gridWrapper);
            }
        };

        addGroup("WINDOWS EXECUTORS", windows);
        addGroup("ANDROID EXECUTORS", androids);
        addGroup("iOS EXECUTORS", ios);
        addGroup("MACOS EXECUTORS", macos);
        addGroup("EXTERNAL EXECUTORS", externals);

        // Tambahkan Footer di sini agar tidak hilang saat render
        const footerHTML = `
            <footer style="text-align: center; padding: 50px 20px; font-family: sans-serif; width: 100%;">
                <p style="font-size: 11px; color: #888; letter-spacing: 2px; text-transform: uppercase; margin: 0; opacity: 0.8;">
                    Powered By <span style="color: #555; font-weight: 600;">Vynzz Exploit</span>
                </p>
                <p style="font-size: 9px; color: #bbb; letter-spacing: 1.5px; text-transform: uppercase; margin: 5px 0 0 0; opacity: 0.7;">
                    Big Thanks <span style="color: #999; font-weight: 500;">DIFZ25X COMMUNITY</span>
                </p>
            </footer>
        `;
        list.insertAdjacentHTML('beforeend', footerHTML);
    }

    function openModal(id) {
        const ex = exploits.find(e => (e._id === id || e.id === id));
        if (!ex) return;
        
        modal.classList.remove("hidden");
        document.getElementById("modal-title").textContent = ex.title;
        document.getElementById("modal-logo").src = ex.logo || "https://via.placeholder.com/60";
        document.getElementById("modal-description").textContent = ex.description || ex.cost || "No description.";

        const warnBox = document.getElementById("modal-warning-text");
        
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

        const displayType = ex.extype === "wexecutor" ? "Internal" : (ex.extype === "mexecutor" ? "MacOS" : "External");
        const displayPrice = ex.free ? "FREE" : (ex.cost || "PAID");

        document.getElementById("modal-extra-info").innerHTML = `
            <div class="info-item"><label>Type</label><span>${displayType}</span></div>
            <div class="info-item"><label>Price</label><span>${displayPrice}</span></div>
            <div class="info-item"><label>Version</label><span>${ex.version || 'N/A'}</span></div>
            <div class="info-item"><label>Platform</label><span>${ex.platform || 'N/A'}</span></div>
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
            
            const cAll = document.getElementById("count-all");
            const cWork = document.getElementById("count-working");
            const cPatch = document.getElementById("count-patched");

            if(cAll) cAll.textContent = exploits.length;
            if(cWork) cWork.textContent = exploits.filter(e => e.updateStatus === true).length;
            if(cPatch) cPatch.textContent = exploits.filter(e => e.updateStatus === false).length;
            
            applyFilters();
        } catch (e) {
            console.error(e);
            list.innerHTML = '<p style="text-align:center;color:#9ca3af;padding:40px;">Failed to load exploits. Please try again later.</p>';
        }
    }

    searchInput.addEventListener("input", applyFilters);
    if(typeFilter) typeFilter.addEventListener("change", applyFilters);
    filterButtons.forEach(btn => btn.onclick = () => {
        document.querySelector(".filters .active")?.classList.remove("active");
        btn.classList.add("active");
        currentStatus = btn.dataset.filter;
        applyFilters();
    });
    document.getElementById("close-modal").onclick = () => modal.classList.add("hidden");
    modal.onclick = (e) => {
        if (e.target === modal) modal.classList.add("hidden");
    };
    load();
});