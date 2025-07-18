// Initialize the map
const map = L.map('map').setView([7.8731, 80.7718], 7);

// Base map (no labels)
const darkBasemap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
  subdomains: 'abcd'
}).addTo(map);

// Raster tree loss tile layer
const treeLossTiles = L.tileLayer('./data/TreeLoss_Treecover/{z}/{x}/{y}.png', {
  attribution: 'Tree Cover Loss Tiles'
});

// Add controls
L.control.layers({ "Dark Basemap": darkBasemap }, { "Tree Loss": treeLossTiles }).addTo(map);

// Legend
const legend = L.control({ position: 'bottomright' });
legend.onAdd = function() {
  const div = L.DomUtil.create('div', 'info legend');
  div.innerHTML += '<b>Forest Loss (Ha)</b><br>';
  div.innerHTML += '<i style="background:#ffeda0"></i> Low<br>';
  div.innerHTML += '<i style="background:#f03b20"></i> High<br>';
  return div;
};
legend.addTo(map);

// Color scale
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
let forestChartInstance = null;

// Load GeoJSON
fetch('data/sri_lanka_districts.geojson')
  .then(res => res.json())
  .then(data => {
    geojsonLayer = L.geoJSON(data, {
      style: style,
      onEachFeature: (feature, layer) => {
        layer.on({
          click: () => {
            if (selectedDistrict) geojsonLayer.resetStyle(selectedDistrict);
            selectedDistrict = layer;
            selectedDistrict.setStyle({ fillColor: '#74c476' });
            loadChart(feature.properties.DISTRICT);
            document.getElementById("district-name").textContent = `Forest Loss: ${feature.properties.DISTRICT}`;
          }
        });
      }
    }).addTo(map);

    // Auto-select first district
    const first = data.features[0];
    loadChart(first.properties.DISTRICT);
    document.getElementById("district-name").textContent = `Forest Loss: ${first.properties.DISTRICT}`;
  });

// Load CSV and render Chart.js
function loadChart(districtName) {
  fetch("data/district_forest_loss_srilanka.csv")
    .then(res => res.text())
    .then(csvText => {
      const data = d3.csvParse(csvText);
      const districtData = data.filter(d => d.District === districtName);

      const labels = districtData.map(d => d.Year);
      const values = districtData.map(d => +d.Loss);

      if (forestChartInstance) forestChartInstance.destroy();

      const ctx = document.getElementById("forestChart").getContext("2d");

      forestChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            label: "Forest Loss (ha)",
            backgroundColor: "#1976d2",
            data: values
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: { title: { display: true, text: "Year" } },
            y: { title: { display: true, text: "Hectares" } }
          }
        }
      });
    });
}
