var map = L.map('map').setView([8.5, 79.9], 7);

// Base Map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Load GeoJSON district boundaries
fetch('data/srilanka_districts.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      onEachFeature: function (feature, layer) {
        var district = feature.properties.DISTRICT;
        layer.bindPopup(`<b>${district}</b><br><canvas id="chart-${district}" width="250" height="150"></canvas>`);
        layer.on('click', function () {
          showChart(district);
        });
      },
      style: {
        color: '#226d00',
        fillColor: '#90ee90',
        fillOpacity: 0.5,
        weight: 1
      }
    }).addTo(map);
  });

// Show chart
function showChart(district) {
  fetch('data/forest_loss.csv')
    .then(res => res.text())
    .then(csv => {
      const rows = csv.trim().split('\n').slice(1);
      const years = [], values = [];

      rows.forEach(row => {
        const [d, year, loss] = row.split(',');
        if (d === district) {
          years.push(year);
          values.push(parseFloat(loss));
        }
      });

      const ctx = document.getElementById(`chart-${district}`);
      if (ctx) {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: years,
            datasets: [{
              label: 'Forest Loss (km²)',
              data: values,
              borderColor: 'red',
              fill: false
            }]
          },
          options: {
            responsive: false,
            maintainAspectRatio: false
          }
        });
      }
    });
}
