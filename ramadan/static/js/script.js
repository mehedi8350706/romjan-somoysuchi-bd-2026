// ===== BD REAL TIME CLOCK + COUNTDOWN + WAKT HIGHLIGHT =====

// Bangladesh Time (Auto Sync)
function getBDTime() {
    const now = new Date();
    const bdTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
    return bdTime;
}

// Convert "05:00 AM" → Date Object Today
function timeStringToDate(timeStr) {
    if (!timeStr || timeStr.includes("সময়") || timeStr.includes("শুরু")) {
        return null;
    }

    const parts = timeStr.trim().split(" ");
    const time = parts[0];
    const modifier = parts[1];

    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) {
        hours += 12;
    }
    if (modifier === "AM" && hours === 12) {
        hours = 0;
    }

    const bdNow = getBDTime();
    return new Date(
        bdNow.getFullYear(),
        bdNow.getMonth(),
        bdNow.getDate(),
        hours,
        minutes,
        0
    );
}

// Countdown Format
function formatCountdown(ms) {
    if (ms <= 0) return "ওয়াক্ত শুরু হয়েছে";

    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    return `⏳ ${h} ঘন্টা ${m} মিনিট ${s} সেকেন্ড বাকি`;
}

// Highlight Active Wakt
function highlightWakt(current, fajar, zohor, asor, magrib, esha, nextFajar) {
    const waktCards = {
        fajar: document.getElementById("card-fajar"),
        zohor: document.getElementById("card-zohor"),
        asor: document.getElementById("card-asor"),
        magrib: document.getElementById("card-magrib"),
        esha: document.getElementById("card-esha")
    };

    // Remove all highlights
    Object.values(waktCards).forEach(card => {
        if (card) card.classList.remove("active-wakt");
    });

    // Logic (Your Exact Rule)
    if (current >= fajar && current < zohor) {
        waktCards.fajar?.classList.add("active-wakt");
    } 
    else if (current >= zohor && current < asor) {
        waktCards.zohor?.classList.add("active-wakt");
    } 
    else if (current >= asor && current < magrib) {
        waktCards.asor?.classList.add("active-wakt");
    } 
    else if (current >= magrib && current < esha) {
        waktCards.magrib?.classList.add("active-wakt");
    } 
    else {
        // Esha until next Fajar (including after midnight)
        waktCards.esha?.classList.add("active-wakt");
    }
}

// Main Live System
function startLiveSystem() {
    const sehriText = document.getElementById("sehri-time")?.innerText;
    const iftarText = document.getElementById("iftar-time")?.innerText;

    const fajarText = document.getElementById("fajar-time")?.innerText;
    const zohorText = document.getElementById("zohor-time")?.innerText;
    const asorText = document.getElementById("asor-time")?.innerText;
    const magribText = document.getElementById("magrib-time")?.innerText;
    const eshaText = document.getElementById("esha-time")?.innerText;

    if (!sehriText || sehriText.includes("সময়")) return;

    setInterval(() => {
        const now = getBDTime();

        const sehri = timeStringToDate(sehriText);
        const iftar = timeStringToDate(iftarText);
        const fajar = timeStringToDate(fajarText);
        const zohor = timeStringToDate(zohorText);
        const asor = timeStringToDate(asorText);
        const magrib = timeStringToDate(magribText);
        const esha = timeStringToDate(eshaText);

        if (!sehri || !iftar || !fajar) return;

        // Next Fajar (Tomorrow)
        const nextFajar = new Date(fajar);
        nextFajar.setDate(nextFajar.getDate() + 1);

        // ===== SEHRI COUNTDOWN =====
        const sehriCountdownEl = document.getElementById("sehri-countdown");
        if (sehriCountdownEl) {
            let target = sehri;
            if (now > sehri) {
                target = nextFajar; // After sehri → next day's fajar system
            }
            const diff = target - now;
            sehriCountdownEl.innerText = formatCountdown(diff);
        }

        // ===== IFTAR COUNTDOWN =====
        const iftarCountdownEl = document.getElementById("iftar-countdown");
        if (iftarCountdownEl) {
            let target = iftar;
            if (now > iftar) {
                target = new Date(iftar);
                target.setDate(target.getDate() + 1);
            }
            const diff = target - now;
            iftarCountdownEl.innerText = formatCountdown(diff);
        }

        // ===== WAKT HIGHLIGHT SYSTEM =====
        highlightWakt(now, fajar, zohor, asor, magrib, esha, nextFajar);

    }, 1000);
}

// Start after page load
window.addEventListener("load", () => {
    startLiveSystem();
});
