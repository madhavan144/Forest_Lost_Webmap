// Initialize the map
const map = L.map('map', {
  zoomControl: true,
  attributionControl: false
}).setView([7.8731, 80.7718], 7);

// Dark basemap with NO labels
const darkNoLabel = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
  subdomains: 'abcd'
}).addTo(map);

// ➕ Forest loss image overlay (from your example)
const imageBounds = [[5.9194485647, 79.5211147385], [9.8352048882, 81.8791923593]];
L.imageOverlay('forest_loss.png', imageBounds, {
  opacity: 0.8
}).addTo(map);


// Color styling
function getHighlightStyle() {
  return {
    color: '#66c2a5', // light blue border
    weight: 1.5,
    fillOpacity: 0.3,
    fillColor: '#66c2a5'
  };
}

function getDefaultStyle() {
  return {
    color: '#66c2a5',
    weight: 0.3,
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

function onEachFeature(feature, layer) {
  layer.on({
    click: function (e) {
      if (selectedDistrict) {
        geojsonLayer.resetStyle(selectedDistrict);
      }

      selectedDistrict = e.target;
      selectedDistrict.setStyle(getHighlightStyle());

      const districtName = feature.properties.shapeName;

      // Load the chart image instead of drawing it
      const chartImg = document.getElementById('chart-image');
      const imagePath = `charts/${districtName}.jpg`;
      chartImg.src = imagePath;
      chartImg.alt = `Forest Loss Chart for ${districtName}`;
      chartImg.style.display = 'block';

      // Update chart title if needed
      document.querySelector('#chart-box h3').innerText = `Forest Loss: ${districtName}`;
    }
  });
}
