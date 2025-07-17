// 1. Initialize the Leaflet map
const map = L.map('map').setView([7.8731, 80.7718], 7); // Center of Sri Lanka

// 2. Add OpenStreetMap base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OSM contributors'
}).addTo(map);

// 3. Add raster tile layer (forest loss visualization)
const rasterLayer = L.tileLayer('./tiles/{z}/{x}/{y}.png', {
  tms: false,
  opacity: 0.7
}).addTo(map);

// 4. Prepare a color scale for forest loss
function getColor(loss) {
  return loss > 3000 ? '#800026' :
         loss > 2000 ? '#BD0026' :
         loss > 1000 ? '#E31A1C' :
         loss > 500  ? '#FC4E2A' :
         loss > 100  ? '#FD8D3C' :
         loss > 50   ? '#FEB24C' :
         loss > 0    ? '#FED976' :
                       '#FFEDA0';
}

// 5. Load CSV and GeoJSON data
Promise.all([
  d3.csv("data/district_forest_loss_srilanka.csv"),
  fetch("data/sri_lanka_districts.geojson").then(res => res.json())
]).then(([csvData, geoData]) => {
  // Convert CSV to a dictionary for easy lookup
  const lossDict = {};
  csvData.forEach(row => {
    lossDict[row.District.toLowerCase()] = +row.Forest_Loss;
  });

  // 6. Style function for district coloring
  function style(feature) {
    const districtName = feature.properties.DISTRICT.toLowerCase();
    const loss = lossDict[districtName] || 0;
    return {
      fillColor: getColor(loss),
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    };
  }

  // 7. Add GeoJSON to map with interaction
  L.geoJSON(geoData, {
    style: style,
    onEachFeature: (feature, layer) => {
      const name = feature.properties.DISTRICT;
      const loss = lossDict[name.toLowerCase()] || 0;
      layer.on('click', () => showChart(name, loss));
      layer.bindTooltip(`${name}<br>Forest Loss: ${loss} ha`);
    }
  }).addTo(map);
});

// 8. Chart configuration using Chart.js
const ctx = document.getElementById('lossChart').getContext('2d');
const chart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Forest Loss (ha)'],
    datasets: [{
      label: 'Forest Loss',
      data: [0],
      backgroundColor: '#E31A1C'
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  }
});

// 9. Show chart when district is clicked
function showChart(district, loss) {
  chart.data.labels = [district];
  chart.data.datasets[0].data = [loss];
  chart.update();
}
