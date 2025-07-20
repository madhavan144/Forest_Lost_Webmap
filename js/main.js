// Initialize the map
const map = L.map('map', {
  zoomControl: true,
  attributionControl: false
}).setView([7.8731, 80.7718], 7);

// Dark basemap with NO labels
const darkNoLabel = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
  subdomains: 'abcd'
}).addTo(map);

// Forest loss image overlay
const imageBounds = [[5.9194485647, 79.5211147385], [9.8352048882, 81.8791923593]];
L.imageOverlay('forest_loss.png', imageBounds, {
  opacity: 0.8
}).addTo(map);

// Create a custom legend control
const legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
  const div = L.DomUtil.create('div', 'info legend');
  div.innerHTML += '<h4>Forest Loss</h4>';
  div.innerHTML += '<p>Data from 2001 to 2023</p>';
  div.innerHTML += '<img src="forest_loss.png" alt="Forest Loss Legend" style="width:150px;">';
  return div;
};

legend.addTo(map);


// Styling
function getHighlightStyle() {
  return {
    color: '#66c2a5',
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

// Load GeoJSON and add interactivity
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
            showChartImage(districtName);
          }
        });
      }
    }).addTo(map);

    // Auto-select first district
    const first = geoData.features[0];
    const firstName = first.properties.shapeName;
    showChartImage(firstName);
  });

// Function to show chart image by district name
function showChartImage(districtName) {
  const chartImg = document.getElementById('chart-image');
  const imagePath = `charts/${districtName}.jpg`;
  chartImg.src = imagePath;
  chartImg.alt = `Forest Loss Chart for ${districtName}`;
  chartImg.style.display = 'block';

  document.querySelector('#chart-box h2').innerText = `Forest Loss: ${districtName}`;
}
