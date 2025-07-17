// Initialize the map
const map = L.map('map').setView([7.8731, 80.7718], 7);

// Base dark map
const darkBasemap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
  subdomains: 'abcd'
}).addTo(map);

// Optional: Raster tile layer for tree loss (if present locally)
const treeLossTiles = L.tileLayer('./data/TreeLoss_Treecover/{z}/{x}/{y}.png', {
  attribution: 'Tree Cover Loss Tiles'
});

L.control.layers({ "Dark Basemap": darkBasemap }, { "Tree Loss": treeLossTiles }).addTo(map);

// Legend
const legend = L.control({ position: 'bottomright' });
legend.onAdd = function () {
  const div = L.DomUtil.create('div', 'info legend');
  div.innerHTML += '<b>Forest Loss (Ha)</b><br>';
  div.innerHTML += '<i style="background:#ffeda0"></i> Low<br>';
  div.innerHTML += '<i style="background:#f03b20"></i> High<br>';
  return div;
};
legend.addTo(map);

// Normalize function to match district names
function normalizeName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

// Color scale
function getColor(loss) {
  return loss > 10000 ? '#f03b20' :
         loss > 5000  ? '#fd8d3c' :
         loss > 1000  ? '#feb24c' :
                        '#ffeda0';
}

let geojsonLayer;
let selectedDistrict = null;
let forestChartInstance = null;
let forestLossData = {}; // holds total loss per district

// First load CSV, then GeoJSON
fetch("data/district_forest_loss_srilanka.csv")
  .then(res => res.text())
  .then(csvText => {
    const data = d3.csvParse(csvText);

    // Compute total loss per district
    data.forEach(row => {
      const name = normalizeName(row.District);
      const loss = +row.Loss;
      if (!forestLossData[name]) forestLossData[name] = 0;
      forestLossData[name] += loss;
    });

    // Now load GeoJSON
    return fetch('data/sri_lanka_districts.geojson')
      .then(res => res.json())
      .then(geo => {
        geo.features.forEach(f => {
          const district = normalizeName(f.properties.DISTRICT);
          f.properties.total_loss = forestLossData[district] || 0;
        });

        geojsonLayer = L.geoJSON(geo, {
          style: feature => ({
            fillColor: getColor(feature.properties.total_loss),
            weight: 1,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.7
          }),
          onEachFeature: (feature, layer) => {
            layer.on({
              click: () => {
                if (selectedDistrict) geojsonLayer.resetStyle(selectedDistrict);
                selectedDistrict = layer;
                selectedDistrict.setStyle({ fillColor: '#74c476' });
                loadChart(feature.properties.DISTRICT);
                document.getElementById("district-name").textContent =
                  `Forest Loss in ${feature.properties.DISTRICT}`;
              }
            });
          }
        }).addTo(map);

        // Auto-select first district
        const first = geo.features[0];
        loadChart(first.properties.DISTRICT);
        document.getElementById("district-name").textContent =
          `Forest Loss in ${first.properties.DISTRICT}`;
      });
  });

// Load CSV and render chart for selected district
function loadChart(districtName) {
  fetch("data/district_forest_loss_srilanka.csv")
    .then(res => res.text())
    .then(csvText => {
      const data = d3.csvParse(csvText);

      const filtered = data.filter(d =>
        normalizeName(d.District) === normalizeName(districtName)
      );

      const labels = filtered.map(d => d.Year);
      const values = filtered.map(d => +d.Loss);

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
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { title: { display: true, text: "Year" } },
            y: { title: { display: true, text: "Hectares" } }
          }
        }
      });
    });
}
