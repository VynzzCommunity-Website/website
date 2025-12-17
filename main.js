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

            if (ex.updateStatus) {
                statusText = "PATCHED";
                statusClass = "patched";
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
        document.getElementById("modal-description").textContent = ex.slug?.fullDescription || "No description.";
        
        // LOGIKA TEKS PENJELASAN
        const warnBox = document.getElementById("modal-warning-text");
        let warnText = "";
        let warnColor = "";
        let modalTag = "";

        if (ex.updateStatus) {
            warnText = "This Exploit is currently patched due to a Roblox update.";
            warnColor = "red";
            modalTag = "🔴 PATCHED";
        } else if (ex.bypassed) {
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

        document.getElementById("modal-extra-info").innerHTML = `
            <div class="info-item"><label>Status</label><span>${modalTag}</span></div>
            <div class="info-item"><label>Type</label><span>${ex.extype}</span></div>
            <div class="info-item"><label>Price</label><span>${ex.free ? 'FREE' : 'PAID'}</span></div>
            <div class="info-item"><label>Version</label><span>${ex.version || 'N/A'}</span></div>
        `;
        
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

    searchInput.addEventListener("input", applyFilters);
    typeFilter.addEventListener("change", applyFilters);
    filterButtons.forEach(btn => btn.onclick = () => {
        document.querySelector(".filters .active")?.classList.remove("active");
        btn.classList.add("active");
        currentStatus = btn.dataset.filter;
        applyFilters();
    });

    async function load() {
        const res = await fetch(API_URL);
        exploits = await res.json();
        applyFilters();
    }
    document.getElementById("close-modal").onclick = () => modal.classList.add("hidden");
    load();
});