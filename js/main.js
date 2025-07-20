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

            conEachFeature: (feature, layer) => {
        layer.on("click", () => {
          const districtName = feature.properties.shapeName;
          showChart(districtName);
          layer.setStyle({ fillColor: "#ff7800", fillOpacity: 0.6 });
        });

        layer.on("mouseover", () => {
          layer.setStyle({ weight: 3 });
        });

        layer.on("mouseout", () => {
          layer.setStyle({ weight: 1 });
        });
      },
    }).addTo(map);
  });

// Show chart image
function showChart(districtName) {
  const chartContainer = document.getElementById("chart-container");
  const chartImage = document.getElementById("chart-image");
  const chartTitle = document.getElementById("chart-title");

  const imagePath = `charts/${districtName}.jpg`;

  chartTitle.textContent = `Forest Loss in ${districtName}`;
  chartImage.src = imagePath;
  chartContainer.style.display = "block";
}
