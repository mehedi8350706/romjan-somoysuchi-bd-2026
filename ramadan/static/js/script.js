document.addEventListener("DOMContentLoaded", function () {
    const divisionSelect = document.getElementById("division");
    const districtSelect = document.getElementById("district");

    // Load divisions.json data from embedded variable
    if (!window.divisionsData) {
        console.error("Divisions data not found!");
        return;
    }

    const divisions = window.divisionsData;

    // Populate districts when division changes
    divisionSelect.addEventListener("change", function () {
        const selectedDivision = this.value;

        // Clear old districts
        districtSelect.innerHTML = '<option value="">জেলা নির্বাচন করুন</option>';

        if (!selectedDivision || !divisions[selectedDivision]) return;

        const districts = divisions[selectedDivision];

        districts.forEach(function (district) {
            const option = document.createElement("option");
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
    });
});
