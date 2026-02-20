<script>
// ===== RAMADAN WAQT HIGHLIGHT + COUNTDOWN SYSTEM (FULL FINAL) =====

// Convert 12h time (05:16 AM) → minutes
function parseTimeToMinutes(timeStr) {
    if (!timeStr || timeStr.includes("সময়") || timeStr.includes("শুরু")) {
        return null;
    }

    const parts = timeStr.trim().split(" ");
    if (parts.length < 2) return null;

    let [hour, minute] = parts[0].split(":").map(Number);
    const period = parts[1];

    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;

    return hour * 60 + minute;
}

// Get Bangladesh local time (mobile + pc auto)
function getNowMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
}

// Remove all highlights
function resetHighlights() {
    document.querySelectorAll(".waqt-card").forEach(card => {
        card.classList.remove("active-waqt");
    });
}

// Highlight current waqt based on your custom logic
function highlightCurrentWaqt() {
    const nowMin = getNowMinutes();

    const fajarText = document.getElementById("fajar-time")?.innerText;
    const zohorText = document.getElementById("zohor-time")?.innerText;
    const asorText = document.getElementById("asor-time")?.innerText;
    const magribText = document.getElementById("magrib-time")?.innerText;
    const eshaText = document.getElementById("esha-time")?.innerText;

    const fajarMin = parseTimeToMinutes(fajarText);
    const zohorMin = parseTimeToMinutes(zohorText);
    const asorMin = parseTimeToMinutes(asorText);
    const magribMin = parseTimeToMinutes(magribText);
    const eshaMin = parseTimeToMinutes(eshaText);

    if (
        fajarMin === null ||
        zohorMin === null ||
        asorMin === null ||
        magribMin === null ||
        eshaMin === null
    ) {
        return;
    }

    resetHighlights();

    // ===== YOUR EXACT WAQT RULE SYSTEM =====

    // Esha (7:45 PM → Fajar start)
    if (nowMin >= eshaMin || nowMin < fajarMin) {
        document.getElementById("esha-card")?.classList.add("active-waqt");
        setNextLabel("ফজর শুরু হবে");
    }
    // Fajar (Fajar → Zohor approx)
    else if (nowMin >= fajarMin && nowMin < zohorMin) {
        document.getElementById("fajar-card")?.classList.add("active-waqt");
        setNextLabel("যোহর শুরু হবে");
    }
    // Zohor (12:15 → Asor)
    else if (nowMin >= zohorMin && nowMin < asorMin) {
        document.getElementById("zohor-card")?.classList.add("active-waqt");
        setNextLabel("আসর শুরু হবে");
    }
    // Asor (Asor → Magrib/Iftar)
    else if (nowMin >= asorMin && nowMin < magribMin) {
        document.getElementById("asor-card")?.classList.add("active-waqt");
        setNextLabel("মাগরিব শুরু হবে");
    }
    // Magrib (Iftar → Esha)
    else if (nowMin >= magribMin && nowMin < eshaMin) {
        document.getElementById("magrib-card")?.classList.add("active-waqt");
        setNextLabel("এশা শুরু হবে");
    }
}

// Set countdown label text
function setNextLabel(text) {
    const label = document.getElementById("countdown-label");
    if (label) {
        label.innerText = "পরবর্তী ওয়াক্ত: " + text;
    }
}

// Countdown to next waqt
function startWaqtCountdown() {
    const countdownEl = document.getElementById("countdown");
    if (!countdownEl) return;

    setInterval(() => {
        const now = new Date();

        const fajarText = document.getElementById("fajar-time")?.innerText;
        const zohorText = document.getElementById("zohor-time")?.innerText;
        const asorText = document.getElementById("asor-time")?.innerText;
        const magribText = document.getElementById("magrib-time")?.innerText;
        const eshaText = document.getElementById("esha-time")?.innerText;

        const times = [
            { name: "ফজর", min: parseTimeToMinutes(fajarText) },
            { name: "যোহর", min: parseTimeToMinutes(zohorText) },
            { name: "আসর", min: parseTimeToMinutes(asorText) },
            { name: "মাগরিব", min: parseTimeToMinutes(magribText) },
            { name: "এশা", min: parseTimeToMinutes(eshaText) }
        ];

        const nowMin = now.getHours() * 60 + now.getMinutes();

        let next = null;

        for (let t of times) {
            if (t.min !== null && t.min > nowMin) {
                next = t;
                break;
            }
        }

        // If all passed → next is Fajar (next day)
        if (!next) {
            next = times[0];
        }

        if (next && next.min !== null) {
            const target = new Date();
            target.setHours(Math.floor(next.min / 60), next.min % 60, 0, 0);

            if (target <= now) {
                target.setDate(target.getDate() + 1);
            }

            const diff = target - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            countdownEl.innerText =
                `⏳ ${next.name} শুরু হতে বাকি: ${hours}ঘ ${minutes}মি ${seconds}সে`;
        }
    }, 1000);
}

// Auto run
document.addEventListener("DOMContentLoaded", function () {
    highlightCurrentWaqt();
    startWaqtCountdown();

    // Update highlight every 30 sec (live)
    setInterval(highlightCurrentWaqt, 30000);
});
</script>
