// main.js

// Initialize the map
const map = L.map('map').setView([7.8731, 80.7718], 7);

// Base map layer (dark theme without labels)
const darkBasemap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
  subdomains: 'abcd'
}).addTo(map);

// Overlay raster tiles for tree cover loss
const treeLossTiles = L.tileLayer('./data/TreeLoss_Treecover/{z}/{x}/{y}.png', {
  attribution: 'Tree Cover Loss Tiles'
});

// Layer control
const baseMaps = {
  "Dark Basemap": darkBasemap
};

const overlayMaps = {
  "Tree Loss": treeLossTiles
};

L.control.layers(baseMaps, overlayMaps).addTo(map);

// Legend
const legend = L.control({position: 'bottomright'});
legend.onAdd = function(map) {
  const div = L.DomUtil.create('div', 'info legend');
  div.innerHTML += '<b>Forest Loss (Ha)</b><br>';
  div.innerHTML += '<i style="background:#ffeda0"></i> Low<br>';
  div.innerHTML += '<i style="background:#f03b20"></i> High<br>';
  return div;
};
legend.addTo(map);

// Function to style districts based on a dummy property (e.g., loss)
function getColor(loss) {
  return loss > 10000 ? '#f03b20' :
         loss > 5000  ? '#fd8d3c' :
         loss > 1000  ? '#feb24c' :
                        '#ffeda0';
}

function style(feature) {
  return {
    fillColor: getColor(feature.properties.total_loss || 0),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

let geojsonLayer;
let selectedDistrict = null;

// Load district GeoJSON
fetch('data/sri_lanka_districts.geojson')
  .then(response => response.json())
  .then(data => {
    geojsonLayer = L.geoJSON(data, {
      style: style,
      onEachFeature: function(feature, layer) {
        layer.on({
          click: function(e) {
            if (selectedDistrict) {
              geojsonLayer.resetStyle(selectedDistrict);
            }
            selectedDistrict = e.target;
            selectedDistrict.setStyle({fillColor: '#74c476'});
            loadChart(feature.properties.DISTRICT);
          }
        });
      }
    }).addTo(map);

    // Auto-select first district and load chart
    const firstFeature = data.features[0];
    loadChart(firstFeature.properties.DISTRICT);
  });

// Function to load and display chart
function loadChart(districtName) {
  d3.select('#chart').html("<h3>Loading chart for " + districtName + "...</h3>");

  d3.csv("data/district_forest_loss_srilanka.csv").then(data => {
    const districtData = data.filter(d => d.District === districtName);

    const years = districtData.map(d => d.Year);
    const losses = districtData.map(d => +d.Loss);

    const chartArea = d3.select("#chart");
    chartArea.html("<h3>Forest Loss: " + districtName + "</h3>");

    const svg = chartArea.append("svg")
      .attr("width", 300)
      .attr("height", 250);

    const margin = {top: 20, right: 10, bottom: 30, left: 40},
          width = 300 - margin.left - margin.right,
          height = 250 - margin.top - margin.bottom;

    const x = d3.scaleBand()
      .domain(years)
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(losses)])
      .range([height, 0]);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append("g")
      .call(d3.axisLeft(y));

    g.selectAll("rect")
      .data(districtData)
      .enter()
      .append("rect")
      .attr("x", d => x(d.Year))
      .attr("y", d => y(+d.Loss))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(+d.Loss))
      .attr("fill", "steelblue");
  });
}
