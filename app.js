const tableBody = document.getElementById("tableBody");
const areaFilter = document.getElementById("areaFilter");
const availabilityFilter = document.getElementById("availabilityFilter");

const APIURL = "https://maps2.bristol.gov.uk/server2/rest/services/ext/ll_transport/MapServer/5/query?where=1%3D1&outFields=NAME,SPACES,OCCUPANCY,AREA_NAME,TYPE_DESCRIPTION&f=json";

let allData = [];

async function loadData() {
    try {
        const response = await fetch(APIURL);
        const json = await response.json();
        allData = json.features.map(f => f.attributes);
        populateAreaFilter(allData);
        displayData(allData);
    } catch (error) {
        tableBody.innerHTML = "<tr><td colspan='3'>Failed to load data. Please try again.</td></tr>";
    }
}

function populateAreaFilter(data) {
    const areas = [...new Set(data.map(park => park.AREA_NAME).filter(Boolean))].sort();
    areaFilter.innerHTML = "<option>All Areas</option>";
    areas.forEach(area => {
        areaFilter.innerHTML += `<option>${area}</option>`;
    });
}

function displayData(data) {
    tableBody.innerHTML = "";

    if (data.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='3'>No results found.</td></tr>";
        return;
    }

    data.forEach(park => {
        const name = park.NAME || "Unknown";
        const total = park.SPACES || 0;
        const occupancy = park.OCCUPANCY || 0;
        const available = total - occupancy;
        const percent = total > 0 ? Math.round((available / total) * 100) : 0;
        const colorClass = percent > 30 ? "green" : "red";

        const row = `
            <tr>
                <td>${name}</td>
                <td>${total}</td>
                <td>
                    ${available} (${percent}%)
                    <div class="progress-bar">
                        <div class="progress ${colorClass}" style="width:${percent}%"></div>
                    </div>
                </td>
            </tr>
        `;

        tableBody.innerHTML += row;
    });
}

function applyFilters() {
    let filtered = allData;

    const selectedArea = areaFilter.value;
    const selectedAvailability = availabilityFilter.value;

    if (selectedArea !== "All Areas") {
        filtered = filtered.filter(park => park.AREA_NAME === selectedArea);
    }

    if (selectedAvailability === "Available Only") {
        filtered = filtered.filter(park => (park.SPACES - park.OCCUPANCY) > 0);
    }

    displayData(filtered);
}

document.getElementById("refreshBtn").addEventListener("click", loadData);
areaFilter.addEventListener("change", applyFilters);
availabilityFilter.addEventListener("change", applyFilters);

loadData();