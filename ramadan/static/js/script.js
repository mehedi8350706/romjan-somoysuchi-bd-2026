document.addEventListener("DOMContentLoaded", function () {

    // ===== DISTRICT SELECT FIX =====
    const divisionSelect = document.getElementById("division");
    const districtSelect = document.getElementById("district");

    if (divisionSelect && districtSelect && window.divisionsData) {
        const divisions = window.divisionsData;

        divisionSelect.addEventListener("change", function () {
            const selected = this.value;
            districtSelect.innerHTML = '<option value="">জেলা নির্বাচন করুন</option>';

            if (!selected || !divisions[selected]) return;

            divisions[selected].forEach(function (district) {
                const option = document.createElement("option");
                option.value = district;
                option.textContent = district;
                districtSelect.appendChild(option);
            });
        });
    }

    // ===== COUNTDOWN + HIGHLIGHT (3rd Page) =====
    const sehriEl = document.getElementById("sehri-time");
    const iftarEl = document.getElementById("iftar-time");
    const countdownEl = document.getElementById("countdown");

    if (!sehriEl || !iftarEl) return;

    function getBDTime() {
        return new Date(
            new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })
        );
    }

    function parseTime(str) {
        if (!str || str.includes("শুরু") || str.includes("শেষ")) return null;

        const parts = str.split(" ");
        if (parts.length < 2) return null;

        let [hour, minute] = parts[0].split(":").map(Number);
        const period = parts[1];

        if (period === "PM" && hour !== 12) hour += 12;
        if (period === "AM" && hour === 12) hour = 0;

        const now = getBDTime();
        const t = new Date(now);
        t.setHours(hour, minute, 0, 0);
        return t;
    }

    function updateSystem() {
        const now = getBDTime();
        const sehri = parseTime(sehriEl.innerText);
        const iftar = parseTime(iftarEl.innerText);

        if (!sehri || !iftar) return;

        // ===== COUNTDOWN (Next Iftar priority) =====
        let target = iftar;
        if (now > iftar) {
            target = new Date(sehri.getTime() + 86400000);
        }

        const diff = target - now;

        if (diff > 0 && countdownEl) {
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);

            countdownEl.innerText = `${h} ঘন্টা ${m} মিনিট ${s} সেকেন্ড বাকি`;
        }

        // ===== WAKTO HIGHLIGHT =====
        document.querySelectorAll(".wakto-card").forEach(card => {
            card.classList.remove("active-wakto");
        });

        const hours = now.getHours() + now.getMinutes()/60;

        if (hours >= 4.5 && hours < 6.5) {
            document.getElementById("fajar-card")?.classList.add("active-wakto");
        } else if (hours >= 12.15 && hours < 16.3) {
            document.getElementById("zohor-card")?.classList.add("active-wakto");
        } else if (hours >= 16.3 && now < iftar) {
            document.getElementById("asor-card")?.classList.add("active-wakto");
        } else if (now >= iftar && hours < 19.75) {
            document.getElementById("magrib-card")?.classList.add("active-wakto");
        } else {
            document.getElementById("esha-card")?.classList.add("active-wakto");
        }
    }

    setInterval(updateSystem, 1000);
});
