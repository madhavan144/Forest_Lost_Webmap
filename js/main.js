// Initialize map
const map = L.map('map').setView([7.8731, 80.7718], 7);

// Add clean dark basemap (no labels)
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// 1️⃣ Add raster tile layer (from uploaded TIF as tiles)
const rasterLayer = L.tileLayer('tiles/{z}/{x}/{y}.png', {
  attribution: 'Forest Loss Raster',
  tms: false,
  maxZoom: 12
}).addTo(map);

// 2️⃣ Load CSV: forest loss data
let forestLossData = {};
d3.csv("data/forest_loss.csv").then(data => {
  data.forEach(row => {
    forestLossData[row.District.trim().toLowerCase()] = row; // use lowercase for matching
  });
});

// 3️⃣ Load GeoJSON: district boundaries
fetch("data/sri_lanka_districts.geojson")
  .then(res => res.json())
  .then(geojsonData => {
    L.geoJSON(geojsonData, {
      style: feature => ({
        color: "#00ffff",
        weight: 1,
        fillColor: "#004466",
        fillOpacity: 0.5
      }),
      onEachFeature: (feature, layer) => {
        const districtName = feature.properties.DISTRICT.trim().toLowerCase();
        const stats = forestLossData[districtName];

        if (stats) {
          layer.bindPopup(`<strong>${feature.properties.DISTRICT}</strong><br>Loss: ${stats.Loss_ha} ha`);
        } else {
          layer.bindPopup(`<strong>${feature.properties.DISTRICT}</strong><br>No data`);
        }

        layer.on('click', () => {
          showChart(feature.properties.DISTRICT, stats);
        });
      }
    }).addTo(map);
  });

// 4️⃣ Chart display using D3
function showChart(district, data) {
  const chartDiv = document.getElementById("chart");
  chartDiv.innerHTML = `<h4>${district}</h4>`;

  if (!data) {
    chartDiv.innerHTML += `<p>No data available</p>`;
    return;
  }

  // Clear previous chart
  d3.select("#chart").select("svg").remove();

  // Sample bar chart: adjust based on your CSV columns
  const margin = { top: 20, right: 30, bottom: 40, left: 60 };
  const width = 300 - margin.left - margin.right;
  const height = 200 - margin.top - margin.bottom;

  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const values = [
    { label: "Forest Loss (ha)", value: +data.Loss_ha },
    { label: "Remaining Forest", value: +data.Remaining_ha || 0 } // optional column
  ];

  const x = d3.scaleBand()
    .domain(values.map(d => d.label))
    .range([0, width])
    .padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, d3.max(values, d => d.value)])
    .nice()
    .range([height, 0]);

  svg.append("g")
    .call(d3.axisLeft(y));

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  svg.selectAll("rect")
    .data(values)
    .enter()
    .append("rect")
    .attr("x", d => x(d.label))
    .attr("y", d => y(d.value))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.value))
    .attr("fill", "#00ff88");
}
