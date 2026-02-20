// ===== DISTRICT SELECT SYSTEM =====
document.addEventListener("DOMContentLoaded", function () {
    const divisionSelect = document.getElementById("division");
    const districtSelect = document.getElementById("district");

    if (divisionSelect && districtSelect && window.divisionsData) {
        const divisions = window.divisionsData;

        divisionSelect.addEventListener("change", function () {
            const selectedDivision = this.value;
            districtSelect.innerHTML = '<option value="">জেলা নির্বাচন করুন</option>';

            if (!selectedDivision || !divisions[selectedDivision]) return;

            divisions[selectedDivision].forEach(function (district) {
                const option = document.createElement("option");
                option.value = district;
                option.textContent = district;
                districtSelect.appendChild(option);
            });
        });
    }

    // ===== COUNTDOWN + WAKTO HIGHLIGHT SYSTEM =====
    const sehriEl = document.getElementById("sehri-time");
    const iftarEl = document.getElementById("iftar-time");

    if (!sehriEl || !iftarEl) return;

    function parseTime(timeStr) {
        if (!timeStr || timeStr.includes("সময়") || timeStr.includes("শুরু")) return null;

        const [time, period] = timeStr.split(" ");
        let [h, m] = time.split(":").map(Number);

        if (period === "PM" && h !== 12) h += 12;
        if (period === "AM" && h === 12) h = 0;

        const now = new Date();
        const bdNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
        const target = new Date(bdNow);
        target.setHours(h, m, 0, 0);
        return target;
    }

    function updateCountdown() {
        const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));

        const sehriTime = parseTime(sehriEl.innerText);
        const iftarTime = parseTime(iftarEl.innerText);

        const cards = document.querySelectorAll(".wakto-card");

        cards.forEach(card => card.classList.remove("active-wakto"));

        if (!sehriTime || !iftarTime) return;

        if (now >= sehriTime && now < iftarTime) {
            document.getElementById("fajar-card")?.classList.add("active-wakto");
        }

        if (now >= iftarTime) {
            document.getElementById("magrib-card")?.classList.add("active-wakto");
        }

        // Countdown to next (Iftar priority)
        let target = iftarTime;
        if (now > iftarTime) {
            target = new Date(sehriTime.getTime() + 24 * 60 * 60 * 1000);
        }

        const diff = target - now;

        if (diff > 0) {
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);

            const cd = document.getElementById("countdown");
            if (cd) {
                cd.innerText = `${h} ঘন্টা ${m} মিনিট ${s} সেকেন্ড বাকি`;
            }
        }
    }

    setInterval(updateCountdown, 1000);
});
