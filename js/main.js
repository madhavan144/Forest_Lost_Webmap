// Setup the map
const map = L.map('map').setView([7.8, 80.5], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Sample Puttalam & Mannar-like district boundaries
fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
  .then(res => res.json())
  .then(data => {
    // This is just global data – replace this with your own district-level GeoJSON for Sri Lanka if available
    L.geoJSON(data, {
      onEachFeature: function (feature, layer) {
        layer.on('click', function () {
          showChart(feature.properties.NAME || 'District', feature.properties);
        });
      },
      style: {
        color: '#2ecc71',
        weight: 2
      }
    }).addTo(map);
  });

// Dummy chart data – Replace with your real CSV/JSON values
const forestLossData = {
  "Puttalam": [500, 600, 800, 750, 400, 300, 200, 100],
  "Mannar": [200, 300, 250, 220, 180, 100, 50, 20],
};

const labels = ["2001", "2005", "2010", "2013", "2015", "2017", "2020", "2023"];

const ctx = document.getElementById('lossChart').getContext('2d');
let chart;

function showChart(district, data) {
  const values = forestLossData[district] || [0, 0, 0, 0, 0, 0, 0, 0];
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: `Forest Loss in ${district}`,
        data: values,
        backgroundColor: '#e74c3c'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: true,
          text: `Forest Loss Trend in ${district}`
        }
      }
    }
  });
}
