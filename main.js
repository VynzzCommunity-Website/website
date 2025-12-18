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