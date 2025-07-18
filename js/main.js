// Initialize the map
const map = L.map('map', {
  zoomControl: true,
  attributionControl: false
}).setView([7.8731, 80.7718], 7);

// Dark basemap with NO labels
const darkNoLabel = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
  maxZoom: 18
}).addTo(map);

// Color styling
function getHighlightStyle() {
  return {
    color: '#66c2a5', // light blue border
    weight: 1.5,       // thinner than before
    fillOpacity: 0.3,
    fillColor: '#66c2a5'
  };
}

function getDefaultStyle() {
  return {
    color: 'white',
    weight: 0.5,       // thinner district boundary
    fillOpacity: 0
  };
}

let geojsonLayer;
let selectedDistrict = null;

// Load GeoJSON
fetch('data/sri_lanka_districts.geojson')
  .then(response => response.json())
  .then(geoData => {
    geojsonLayer = L.geoJSON(geoData, {
      style: getDefaultStyle,
      onEachFeature: function (feature, layer) {
        layer.on({
          click: function (e) {
            if (selectedDistrict) {
              geojsonLayer.resetStyle(selectedDistrict);
            }

            selectedDistrict = e.target;
            selectedDistrict.setStyle(getHighlightStyle());

            const districtName = feature.properties.shapeName;
            loadChart(districtName);
          }
        });
      }
    }).addTo(map);

    // Auto-select the first district
    const first = geoData.features[0];
    loadChart(first.properties.shapeName);
  });

// Load CSV and draw chart
function loadChart(districtName) {
  // Corrected: Added backticks (` `) for string interpolation
  d3.select('#chart').html(`<h3 style="color:white">Forest Loss: ${districtName}</h3>`);

  d3.csv('data/district_forest_loss_srilanka.csv').then(data => {
    const filtered = data.filter(d => d.shapeName === districtName);
    const years = filtered.map(d => d.Year);
    const losses = filtered.map(d => +d.Loss);

    d3.select("#chart").select("svg").remove();

    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", "100%")
      .attr("height", 300);

    const margin = { top: 20, right: 30, bottom: 30, left: 50 },
          width = 600 - margin.left - margin.right,
          height = 300 - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(years)
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(losses) || 1000])
      .range([height, 0]);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .selectAll("text")
      .style("fill", "white");

    g.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("fill", "white");

    g.selectAll("rect")
      .data(filtered)
      .enter()
      .append("rect")
      .attr("x", d => x(d.Year))
      .attr("y", d => y(+d.Loss))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(+d.Loss))
      .attr("fill", "steelblue");
  });
}
