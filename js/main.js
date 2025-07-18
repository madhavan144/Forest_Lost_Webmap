// Initialize the map
const map = L.map('map').setView([7.8731, 80.7718], 7);

// Dark basemap
const darkBasemap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; CartoDB',
  subdomains: 'abcd'
}).addTo(map);

// Color styling
function getHighlightStyle() {
  return {
    color: '#66c2a5', // light blue border
    weight: 2,
    fillOpacity: 0.3,
    fillColor: '#66c2a5'
  };
}

function getDefaultStyle() {
  return {
    color: 'white',
    weight: 1,
    fillOpacity: 0  // transparent fill
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

            const districtName = feature.properties.shapeName; // <- Update if your field is named differently
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
  d3.select('#chart').html(`<h3>Forest Loss: ${districtName}</h3>`);

  d3.csv('data/district_forest_loss_srilanka.csv').then(data => {
    const filtered = data.filter(d => d.shapeName === districtName);

    const years = filtered.map(d => d.Year);
    const losses = filtered.map(d => +d.Loss);

    // Clear previous chart
    d3.select("#chart").select("svg").remove();

    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", 300)
      .attr("height", 250);

    const margin = { top: 20, right: 10, bottom: 30, left: 40 },
      width = 300 - margin.left - margin.right,
      height = 250 - margin.top - margin.bottom;

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
      .call(d3.axisBottom(x));

    g.append("g")
      .call(d3.axisLeft(y));

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
