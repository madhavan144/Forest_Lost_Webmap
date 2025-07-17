// js/main.js

// Initialize the map
const map = L.map('map').setView([7.8731, 80.7718], 7);

// Add tree loss tile layer (no labels)
L.tileLayer('data/TreeLoss_Treecover/{z}/{x}/{y}.png', {
  attribution: 'Tree Loss & Tree Cover',
  maxZoom: 12,
  minZoom: 6
}).addTo(map);

// Add district boundary GeoJSON
fetch('data/sri_lanka_districts.geojson')
  .then(response => response.json())
  .then(geojsonData => {
    L.geoJSON(geojsonData, {
      style: {
        color: '#00FF00',
        weight: 1,
        fillOpacity: 0
      }
    }).addTo(map);
  });

// Load and visualize forest loss data
fetch('data/district_forest_loss_srilanka.csv')
  .then(response => response.text())
  .then(csvData => {
    const rows = csvData.split('\n').slice(1); // Skip header
    const lossData = rows.map(row => {
      const [district, year, forestLoss] = row.split(',');
      return { district, year, forestLoss: parseFloat(forestLoss) };
    });

    // Group by district
    const grouped = {};
    lossData.forEach(item => {
      if (!grouped[item.district]) grouped[item.district] = [];
      grouped[item.district].push({ year: item.year, forestLoss: item.forestrLoss });
    });

    // Create chart HTML
    const chartContainer = document.getElementById('chart');
    chartContainer.innerHTML = '<h3>Forest Loss by District</h3>';
    for (const district in grouped) {
      const canvas = document.createElement('canvas');
      chartContainer.appendChild(canvas);

      const years = grouped[district].map(d => d.year);
      const losses = grouped[district].map(d => d.forestLoss);

      new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
          labels: years,
          datasets: [{
            label: district,
            data: losses,
            fill: false,
            borderColor: 'red',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true }
          }
        }
      });
    }
  });
