// Initialize the map
const map = L.map('map', {
  zoomControl: true,
  attributionControl: false
}).setView([7.8731, 80.7718], 7);

// Dark basemap with NO labels
const darkNoLabel = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
  subdomains: 'abcd'
}).addTo(map);
L.Control.geocoder({
  defaultMarkGeocode: true,
  placeholder: 'Search for a place...'
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
// Create a layer group to hold public reports
const reportLayer = L.geoJSON([], {
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, {
      radius: 6,
      fillColor: '#ff4d4d',
      color: '#fff',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.9
    });
  },
  onEachFeature: function (feature, layer) {
    layer.bindPopup(`<b>Public Report:</b><br>${feature.properties.comment}`);
  }
}).addTo(map);

// Add click handler to map for public reporting
map.on('click', function (e) {
  const latlng = e.latlng;

  const popupContent = `
    <b>Submit a Deforestation Report</b><br>
    <textarea id="reportText" placeholder="Describe the deforestation issue..." rows="3" style="width: 100%;"></textarea><br>
    <button onclick="submitReport(${latlng.lat}, ${latlng.lng})">Submit</button>
  `;

  L.popup()
    .setLatLng(latlng)
    .setContent(popupContent)
    .openOn(map);
});

// Handle report submission
function submitReport(lat, lng) {
  const comment = document.getElementById("reportText").value.trim();
  if (!comment) {
    alert("Please enter a description.");
    return;
  }

  const reportFeature = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [lng, lat]
    },
    properties: {
      comment: comment
    }
  };

  reportLayer.addData(reportFeature);
  map.closePopup();
}


// Example: add tree emoji marker
L.marker([7.9, 80.7], { icon: treeIcon }).addTo(map)
  .bindPopup("Forest Area");

// Example: add axe emoji marker
L.marker([7.6, 80.4], { icon: axeIcon }).addTo(map)
  .bindPopup("Deforestation Site");
let searchedMarker = null;

function updateFormLocation(latlng, name) {
  document.getElementById('locationInput').value = name + " (" + latlng.lat.toFixed(5) + ", " + latlng.lng.toFixed(5) + ")";
}

// Assuming you already have a search control:
searchControl.on('results', function (data) {
  if (data.results.length > 0) {
    const latlng = data.results[0].latlng;
    const name = data.results[0].name;

    if (searchedMarker) map.removeLayer(searchedMarker);

    searchedMarker = L.marker(latlng, {
      icon: L.divIcon({
        className: 'black-marker-icon',
        html: "🪓"
      })
    }).addTo(map).bindPopup("You searched: " + name).openPopup();

    updateFormLocation(latlng, name);
  }
});
fetch("https://script.google.com/macros/s/AKfycbzFHeO0-Z9lqg0pn9e4LpfFbmt79Njlj2sq_184a8JeFWXJ0-Bnt0fGG_3NTm9E9ieK/exec", {
  method: "POST",
  body: JSON.stringify({
    place: searchedPlaceName,
    lat: searchedLat,
    lng: searchedLng,
    problem: document.getElementById("problem").value,
    more: document.getElementById("moreInfo").value,
    media: document.getElementById("mediaUrl").value
  }),
  headers: {
    "Content-Type": "application/json"
  }
})
.then(res => res.text())
.then(data => {
  alert("Submitted successfully!");
});
