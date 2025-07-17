// js/main.js

// Initialize the map
const map = L.map('map').setView([7.8731, 80.7718], 7);

// Add Tree Loss & Cover PNG tiles
L.tileLayer('data/TreeLoss_Treecover/{z}/{x}/{y}.png', {
  attribution: 'Tree Loss & Cover',
  maxZoom: 12,
  minZoom: 6
}).addTo(map);

// Add district boundaries
let geoLayer;
fetch('data/sri_lanka_districts.geojson')
  .then(res => res.json())
  .then(data => {
    geoLayer = L.geoJSON(data, {
      style: {
        color: '#004d40',
        weight: 1.5,
        fillOpacity: 0
      },
      onEachFeature: (feature, layer) => {
        layer.on('click', () => {
          const district = feature.properties.DISTRICT;
          document.getElementById('district-name').textContent = `Forest Loss in ${district}`;
          showChart(district);
        });
      }
    }).addTo(map);
  });

// Load CSV forest loss data
let forestData = {};
fetch('data/district_forest_loss_srilanka.csv')
  .then(res => res.text())
  .then(text => {
    const rows = text.trim().split('\n').slice(1); // skip header
    rows.forEach(row => {
      const [district, year, loss] = row.split(',');
      if (!forestData[district]) forestData[district] = {};
      forestData[district][year] = parseFloat(loss);
    });
  });

let chart; // Chart instance

function showChart(district) {
  if (!forestData[district]) return;

  const years = Object.keys(forestData[district]);
  const losses = years.map(year => forestData[district][year]);

  const ctx = document.getElementById('forestChart').getContext('2d');

  if (chart) chart.destroy(); // destroy previous chart if exists

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: years,
      datasets: [{
        label: `Forest Loss (ha)`,
        data: losses,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: '#c62828',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Hectares' }
        },
        x: {
          title: { display: true, text: 'Year' }
        }
      }
    }
  });
}
