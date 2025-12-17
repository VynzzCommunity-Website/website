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
            card.className = "card";
            
            let statusText = "WORKING";
            let statusClass = "working";

            // LOGIKA BADGE HALAMAN UTAMA
            if (ex.updateStatus) {
                statusText = "PATCHED";
                statusClass = "patched";
            } else if (ex.clientmods) { // JIKA clientmods true, gunakan warna UNGU
                statusText = "WORKING (CLIENT MODS)";
                statusClass = "bypassed"; 
            } else if (ex.bypassed) {
                statusText = "WORKING (BYPASSED)";
                statusClass = "bypassed";
            } else if (ex.detected) {
                statusClass = "detected-warn";
            }

            card.innerHTML = `
                <h2>${ex.title}</h2>
                <p>Platform: ${ex.platform}</p>
                <span class="badge ${statusClass}">${statusText}</span>
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
                items.forEach(ex => list.appendChild(createCard(ex)));
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

        const longDesc = ex.slug?.fullDescription || ex.description || ex.cost || "No additional description available.";
        document.getElementById("modal-description").textContent = longDesc;

        const warnBox = document.getElementById("modal-warning-text");
        let warnText = "", warnColor = "", modalTag = "";

        // LOGIKA PENENTUAN TEXT PERINGATAN (MODAL)
        if (ex.updateStatus) {
            warnText = "This Exploit is currently patched due to a Roblox update.";
            warnColor = "red";
            modalTag = "🔴 PATCHED";
        } else if (ex.clientmods) {
            warnText = "This Exploit Bypassed Client Modification bans but potentially could cause bans in banwaves";
            warnColor = "purple";
            modalTag = "🟣 BYPASSED";
        } else if (ex.detected) {
            warnText = "This Exploits Might Be Detected By Hyperion, use at your own risk";
            warnColor = "orange";
            modalTag = "🟠 DETECTED";
        } else {
            warnText = "This Exploit Reported As undetected";
            warnColor = "green";
            modalTag = "🟢 UNDETECTED";
        }

        warnBox.textContent = warnText;
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
            if (currentStatus === "working") matchStatus = !ex.updateStatus;
            if (currentStatus === "patched") matchStatus = ex.updateStatus;
            return matchSearch && matchType && matchStatus;
        });
        render(f);
    }

    async function load() {
        try {
            const res = await fetch(API_URL);
            exploits = await res.json();
            document.getElementById("count-all").textContent = exploits.length;
            document.getElementById("count-working").textContent = exploits.filter(e => !e.updateStatus).length;
            document.getElementById("count-patched").textContent = exploits.filter(e => e.updateStatus).length;
            applyFilters();
        } catch (error) { console.error(error); }
    }

    searchInput.addEventListener("input", applyFilters);
    typeFilter.addEventListener("change", applyFilters);
    filterButtons.forEach(btn => btn.onclick = () => {
        document.querySelector(".filters .active")?.classList.remove("active");
        btn.classList.add("active");
        currentStatus = btn.dataset.filter;
        applyFilters();
    });
    document.getElementById("close-modal").onclick = () => modal.classList.add("hidden");
    load();
});