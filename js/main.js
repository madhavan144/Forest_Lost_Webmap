const map = L.map('map', {
  zoomControl: true,
  attributionControl: false
}).setView([7.8731, 80.7718], 7);

// Dark basemap with NO labels
const darkNoLabel = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  subdomains: 'abcd',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
}).addTo(map);



// Forest loss image overlay
const imageBounds = [[5.9194485647, 79.5211147385], [9.8352048882, 81.8791923593]];
L.imageOverlay('forest_loss.png', imageBounds, {
}).addTo(map);




// Styling
function getHighlightStyle() {
  return {
    color: '#66c2a5',
    weight: 1,
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

  document.querySelector('#chart-box h2').innerText =      `Forest_Loss -
            ${districtName}`;
}




// Search control (requires leaflet-control-geocoder plugin)
const searchControl = L.Control.geocoder({
  defaultMarkGeocode: true,
  placeholder: 'Search for a place...'
}).addTo(map);

// Update location input when search result selected
let searchedMarker = null;
searchControl.on('markgeocode', function(e) {
  const latlng = e.geocode.center;
  const name = e.geocode.name;

  if (searchedMarker) {map.removeLayer(searchedMarker);
                      }
  searchedMarker = L.marker(latlng).addTo(map)
    .bindPopup(name).openPopup();

   document.getElementById('location').value = `${name} (${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)})`;
  });
// Submit to Google Sheets Web App
let submitted = false;

  const toggleBtn = document.getElementById('report-toggle-button');
  const formContainer = document.getElementById('report-form-container');

  toggleBtn.addEventListener('click', () => {
    formContainer.style.display = (formContainer.style.display === 'block') ? 'none' : 'block';
  });

  function handleSuccess() {
    document.getElementById('gform').style.display = 'none';
    document.getElementById('success-message').style.display = 'block';

    setTimeout(() => {
      formContainer.style.display = 'none';
      document.getElementById('gform').reset();
      document.getElementById('gform').style.display = 'block';
      document.getElementById('success-message').style.display = 'none';
    }, 2000); // 2 seconds delay to auto-close
  }

      // Try to add marker on map after submission
L.Control.Geocoder.nominatim().geocode(location, function(results) {
  if (results.length > 0) {
    const latlng = results[0].center;
    addReportMarker(latlng, issueType, observations);
  }
});



// Icon colors for different issue types
const iconColors = {
  "Tree Cutting": "red",
  "Illegal Burning": "orange",
  "Land Clearing": "green",
  "Wildlife Displaced": "purple",
  "Other": "gray"
};

function getMarkerOptions(issueType) {
  return {
    radius: 8,
    fillColor: iconColors[issueType] || "blue",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  };
}

// Show marker on map
function addReportMarker(latlng, issueType, description) {
  L.circleMarker(latlng, getMarkerOptions(issueType))
    .addTo(map)
    .bindPopup(`<b>${issueType}</b><br>${description}`);
}
