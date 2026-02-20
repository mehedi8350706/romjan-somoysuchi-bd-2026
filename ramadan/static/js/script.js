// ================= LIVE CLOCK =================
function updateClock() {
    const clock = document.getElementById("clock");
    if (!clock) return;

    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;

    clock.textContent =
        `${String(hours).padStart(2, "0")}:` +
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();


// ================= DIVISION → DISTRICT =================
function setupDivisionDistrict() {
    const divisionSelect = document.getElementById("division");
    const districtSelect = document.getElementById("district");

    if (!divisionSelect || !districtSelect) return;
    if (typeof divisionsData === "undefined") return;

    divisionSelect.addEventListener("change", function () {
        const selectedDivision = this.value;

        districtSelect.innerHTML = '<option value="">জেলা নির্বাচন করুন</option>';

        if (!selectedDivision || !divisionsData[selectedDivision]) return;

        const districts = divisionsData[selectedDivision];

        districts.forEach(function (district) {
            const option = document.createElement("option");
            option.value = district;
            option.textContent = district + " জেলা";
            districtSelect.appendChild(option);
        });
    });
}


// ================= TIME PARSER (DISTRICT SAFE) =================
function parseTodayTime(timeStr) {
    if (!timeStr) return null;

    // Example: "05:00 AM"
    const parts = timeStr.trim().split(" ");
    if (parts.length !== 2) return null;

    let [time, modifier] = parts;
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    // 🔥 IMPORTANT: use TODAY date but keep backend time difference
    const now = new Date();
    const target = new Date();

    target.setFullYear(now.getFullYear());
    target.setMonth(now.getMonth());
    target.setDate(now.getDate());
    target.setHours(hours);
    target.setMinutes(minutes);
    target.setSeconds(0);
    target.setMilliseconds(0);

    return target;
}


// ================= SMART COUNTDOWN + WAQT STATUS SYSTEM =================
function startSmartCountdownSystem() {

    // 🔥 IMPORTANT: include BOTH namaz + sehri/iftar boxes
    const allCountdowns = document.querySelectorAll(".countdown");
    if (!allCountdowns.length) return;

    function updateSystem() {
        const now = new Date();

        // ===== HANDLE SEHRI + IFTAR (INFO BOX) =====
        allCountdowns.forEach(el => {
            const parentBox = el.closest(".info-box");
            if (!parentBox) return; // skip namaz here

            const timeStr = el.dataset.time;
            const target = parseTodayTime(timeStr);
            if (!target) return;

            const diff = target - now;

            if (diff <= 0) {
                el.innerHTML = "⌛ সময় শেষ";
            } else {
                const total = Math.floor(diff / 1000);
                const h = Math.floor(total / 3600);
                const m = Math.floor((total % 3600) / 60);
                const s = total % 60;

                el.innerHTML =
                    `⏳ ${h} ঘণ্টা ${m} মিনিট ${s} সেকেন্ড বাকি`;
            }
        });

        // ===== HANDLE 5 WAQT NAMAZ (STATUS + HIGHLIGHT) =====
        const namazBoxes = document.querySelectorAll(".namaz-glass");
        if (!namazBoxes.length) return;

        const waqtList = [];

        namazBoxes.forEach(box => {
            const el = box.querySelector(".countdown");
            const timeStr = box.dataset.time;
            const parsed = parseTodayTime(timeStr);

            if (parsed && el) {
                waqtList.push({
                    box: box,
                    time: parsed,
                    el: el
                });
            }
        });

        // sort by time
        waqtList.sort((a, b) => a.time - b.time);

        // remove previous highlight
        namazBoxes.forEach(box => box.classList.remove("active-waqt"));

        for (let i = 0; i < waqtList.length; i++) {
            const current = waqtList[i];
            const next = waqtList[i + 1];

            // ⏳ FUTURE WAQT → show countdown
            if (now < current.time) {
                const diff = current.time - now;
                const total = Math.floor(diff / 1000);
                const h = Math.floor(total / 3600);
                const m = Math.floor((total % 3600) / 60);
                const s = total % 60;

                current.el.innerHTML =
                    `⏳ ${h} ঘণ্টা ${m} মিনিট ${s} সেকেন্ড বাকি`;
                continue;
            }

            // 🟢 RUNNING WAQT → highlight + started text
            if (!next || (now >= current.time && now < next.time)) {
                current.box.classList.add("active-waqt");
                current.el.innerHTML = "🟢 ওয়াক্ত শুরু হয়েছে";
                continue;
            }

            // ⌛ FINISHED WAQT → only after next waqt starts
            if (next && now >= next.time) {
                current.el.innerHTML = "⌛ নামাজের সময় শেষ";
            }
        }
    }

    updateSystem();
    setInterval(updateSystem, 1000);
}


// ================= AUTO INIT (ALL PAGES SAFE) =================
document.addEventListener("DOMContentLoaded", function () {
    updateClock();
    setupDivisionDistrict();     // dashboard page
    startSmartCountdownSystem(); // 🔥 sehri + iftar + 5 waqt (final)
});