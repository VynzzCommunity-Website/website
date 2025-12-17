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
        
        if (data.length === 0) {
            list.innerHTML = "<p class='no-data'>No exploit found.</p>";
            return;
        }

        // 1. PISAHKAN DATA BERDASARKAN TIPE (Grouping)
        const internals = data.filter(ex => ex.extype === "wexecutor");
        const externals = data.filter(ex => ex.extype === "wexternal");
        const macos = data.filter(ex => ex.extype === "mexecutor");

        // 2. FUNGSI UNTUK MEMBUAT KARTU (Dengan Logika 3 Warna)
        const createCard = (ex) => {
            const card = document.createElement("div");
            card.className = "card";
            
            let statusText = "";
            let statusClass = "";

            // LOGIKA 3 WARNA STATUS:
            if (ex.updateStatus === true) { 
                // Jika updateStatus true = PATCHED (Tidak bekerja sama sekali)
                statusText = "PATCHED";
                statusClass = "patched"; // Merah di CSS
            } else if (ex.detected === true) {
                // Jika bekerja (updateStatus false) tapi detected
                statusText = "WORKING (DETECTED)";
                statusClass = "detected-warn"; // Orange di CSS
            } else {
                // Jika bekerja dan tidak detected
                statusText = "UNDETECTED";
                statusClass = "working"; // Hijau di CSS
            }

            card.innerHTML = `
                <h2>${ex.title}</h2>
                <p>Platform: ${ex.platform}</p>
                <span class="badge ${statusClass}">
                    ${statusText}
                </span>
            `;
            card.onclick = () => openModal(ex._id);
            return card;
        };

        // 3. RENDER GRUP INTERNAL
        if (internals.length > 0) {
            const header = document.createElement("div");
            header.className = "group-header";
            header.innerHTML = "<span>INTERNAL EXECUTORS</span>";
            list.appendChild(header);
            internals.forEach(ex => list.appendChild(createCard(ex)));
        }

        // 4. RENDER GRUP EXTERNAL
        if (externals.length > 0) {
            const header = document.createElement("div");
            header.className = "group-header";
            header.innerHTML = "<span>EXTERNAL EXECUTORS</span>";
            list.appendChild(header);
            externals.forEach(ex => list.appendChild(createCard(ex)));
        }

        // 5. RENDER GRUP MACOS
        if (macos.length > 0) {
            const header = document.createElement("div");
            header.className = "group-header";
            header.innerHTML = "<span>MACOS EXECUTORS</span>";
            list.appendChild(header);
            macos.forEach(ex => list.appendChild(createCard(ex)));
        }
    }

    // LOGIKA FILTER (SEARCH & STATUS)
    function applyFilters() {
        let filtered = [...exploits];

        // Filter Search
        const query = searchInput.value.toLowerCase().trim();
        if (query) {
            filtered = filtered.filter(ex => ex.title.toLowerCase().includes(query));
        }

        // Filter Status Berdasarkan Tombol
        if (currentStatus === "working") {
            // Tombol "Working" hanya menampilkan yang tidak Patched (updateStatus: false)
            filtered = filtered.filter(ex => !ex.updateStatus);
        } else if (currentStatus === "patched") {
            // Tombol "Patched" menampilkan yang updateStatus: true
            filtered = filtered.filter(ex => ex.updateStatus);
        }

        // Filter Dropdown Tipe
        const selectedType = typeFilter.value;
        if (selectedType !== "all") {
            filtered = filtered.filter(ex => ex.extype === selectedType);
        }

        render(filtered);
    }

    // LOAD DATA DARI API
    async function loadExploits() {
        try {
            const res = await fetch(API_URL);
            exploits = await res.json();
            
            // Update Counter di Header
            document.getElementById("count-all").textContent = exploits.length;
            document.getElementById("count-working").textContent = exploits.filter(e => !e.updateStatus).length;
            document.getElementById("count-patched").textContent = exploits.filter(e => e.updateStatus).length;

            applyFilters();
        } catch (err) { 
            console.error("Gagal memuat data:", err); 
            list.innerHTML = "<p class='no-data'>Error loading data. Please try again later.</p>";
        }
    }

    // Event Listeners
    searchInput.addEventListener("input", applyFilters);
    typeFilter.addEventListener("change", applyFilters);
    
    filterButtons.forEach(btn => {
        btn.onclick = () => {
            document.querySelector(".filters .active")?.classList.remove("active");
            btn.classList.add("active");
            currentStatus = btn.dataset.filter;
            applyFilters();
        };
    });

    // Modal Detail
    function openModal(id) {
        const ex = exploits.find(e => (e._id === id || e.id === id));
        if (!ex) return;
        
        modal.classList.remove("hidden");
        document.getElementById("modal-title").textContent = ex.title;
        document.getElementById("modal-description").textContent = ex.slug?.fullDescription || "No description provided.";
        document.getElementById("modal-unc").innerHTML = `<span class="val">${ex.uncPercentage ?? 'N/A'}%</span><span class="lbl">UNC</span>`;
        document.getElementById("modal-sunc").innerHTML = `<span class="val">${ex.suncPercentage ?? 'N/A'}%</span><span class="lbl">sUNC</span>`;
        
        // Modal Extra Info dengan ikon status
        let modalStatus = "";
        if (ex.updateStatus) modalStatus = "🔴 Patched";
        else if (ex.detected) modalStatus = "🟠 Working (Detected)";
        else modalStatus = "🟢 Undetected";

        document.getElementById("modal-extra-info").innerHTML = `
            <div class="info-item"><label>Status</label><span>${modalStatus}</span></div>
            <div class="info-item"><label>Type</label><span>${ex.extype === 'wexternal' ? 'External' : 'Internal'}</span></div>
            <div class="info-item"><label>Price</label><span>${ex.free ? 'FREE' : 'PAID'}</span></div>
            <div class="info-item"><label>Version</label><span>${ex.version || 'N/A'}</span></div>
        `;

        document.getElementById("modal-website").href = ex.websitelink || "#";
        document.getElementById("modal-discord").href = ex.discordlink || "#";
        
        // Set Logo jika ada field logo, jika tidak gunakan placeholder
        const modalLogo = document.getElementById("modal-logo");
        if (modalLogo) modalLogo.src = ex.logo || "https://via.placeholder.com/60";
    }

    // Close Modal
    const closeBtn = document.getElementById("close-modal");
    if (closeBtn) {
        closeBtn.onclick = () => modal.classList.add("hidden");
    }

    // Tutup modal jika klik di luar area konten
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.classList.add("hidden");
        }
    };

    loadExploits();
});