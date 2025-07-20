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

  if (searchedMarker) map.removeLayer(searchedMarker);
  searchedMarker = L.marker(latlng).addTo(map)
    .bindPopup(name).openPopup();

  document.getElementById('locationInput').value = name + " (" + latlng.lat.toFixed(5) + ", " + latlng.lng.toFixed(5) + ")";
});

// Submit to Google Sheets Web App
function submitForm() {
  const location = document.getElementById("locationInput").value;
  const problem = document.getElementById("problem").value;
  const more = document.getElementById("moreInfo").value;
  const media = document.getElementById("mediaUrl").value;
  const name = document.getElementById("name").value;

  if (!problem || !location) {
    alert("Please provide at least location and issue.");
    return;
  }

  fetch("https://script.google.com/macros/s/AKfycbzFHeO0-Z9lqg0pn9e4LpfFbmt79Njlj2sq_184a8JeFWXJ0-Bnt0fGG_3NTm9E9ieK/exec", {
    method: "POST",
    body: JSON.stringify({
      place: location,
      problem: problem,
      more: more,
      media: media,
      name: name
    }),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(res => res.text())
  .then(data => {
    alert("Submitted successfully!");
    // Optionally reset form
    document.getElementById("problem").value = "";
    document.getElementById("moreInfo").value = "";
    document.getElementById("mediaUrl").value = "";
    document.getElementById("name").value = "";
  });

  document.getElementById('toggleReportBtn').addEventListener('click', function () {
  const box = document.getElementById('reportBox');
  box.style.display = (box.style.display === 'none' || box.style.display === '') ? 'block' : 'none';
});

}
function toggleReportBox() {
  const box = document.getElementById("report-box");
  if (box.style.display === "none" || box.style.display === "") {
    box.style.display = "block";
  } else {
    box.style.display = "none";
  }
}

function submitReportForm() {
  // You can handle form submission here (to Google Sheets or wherever)
  alert("Thank you for submitting the report!");
}



    

