// Initialize map centered on Sri Lanka
const map = L.map('map').setView([7.8731, 80.7718], 7);

// Add clean dark basemap without labels
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// Add raster tile layer (from your uploaded tiles)
const rasterLayer = L.tileLayer('tiles/{z}/{x}/{y}.png', {
  attribution: 'Forest Loss Raster',
  tms: false,
  maxZoom: 12
}).addTo(map);

// Object to hold forest loss data from CSV
let forestLossData = {};

// Load CSV data with d3
d3.csv("data/forest_loss.csv").then(data => {
  data.forEach(row => {
    // Store data keyed by lowercase district name for matching
    forestLossData[row.District.trim().toLowerCase()] = row;
  });
});

// Load GeoJSON district boundaries and add to map
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

        // On click, show chart for that district
        layer.on('click', () => {
          showChart(feature.properties.DISTRICT, stats);
        });
      }
    }).addTo(map);
  });

// Function to show bar chart of forest loss data for a district using D3
function showChart(district, data) {
  const chartDiv = document.getElementById("chart");
  chartDiv.innerHTML = `<h4>${district}</h4>`;

  if (!data) {
    chartDiv.innerHTML += `<p>No data available</p>`;
    return;
  }

  // Remove any previous SVG
  d3.select("#chart").select("svg").remove();

  // Chart margins and size
  const margin = { top: 20, right: 30, bottom: 40, left: 60 };
  const width = 300 - margin.left - margin.right;
  const height = 200 - margin.top - margin.bottom;

  // Create SVG container
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Data for bars
  const values = [
    { label: "Forest Loss (ha)", value: +data.Loss_ha },
    { label: "Remaining Forest", value: +data.Remaining_ha || 0 }
  ];

  // X scale - categorical
  const x = d3.scaleBand()
    .domain(values.map(d => d.label))
    .range([0, width])
    .padding(0.3);

  // Y scale - linear
  const y = d3.scaleLinear()
    .domain([0, d3.max(values, d => d.value)])
    .nice()
    .range([height, 0]);

  // Y axis
  svg.append("g")
    .call(d3.axisLeft(y));

  // X axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Bars
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
