// Initialize the map
const map = L.map('map', {
  zoomControl: true,
  attributionControl: false
}).setView([7.8731, 80.7718], 7);

L.tileLayer('https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
  attribution: '',
  opacity: 0.3 // optional: adjust for fading effect
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

  function toggleReportBox() {
    const box = document.getElementById("report-box");
    box.style.display = (box.style.display === "none" || box.style.display === "") ? "block" : "none";
  }

  function closeForm() {
    document.getElementById("report-box").style.display = "none";
  }

  function submitReportForm() {
    // Get all values from form fields
    const location = document.getElementById("location").value.trim();
    const observations = document.getElementById("observations").value.trim();
    const causeEffect = document.getElementById("causeEffect").value.trim();
    const suggestions = document.getElementById("suggestions").value.trim();
    const issueType = document.getElementById("issueType").value.trim();
    const mediaFile = document.getElementById("mediaUpload").files[0];

    // Validate required fields
    if (!location || !observations || !causeEffect || !suggestions || !additionalComments) {
      alert("Please fill in all required fields.");
      return;
    }

    // Optional: convert file to base64 if you want to send it
    // For now, just send text data

    // Submit to Google Apps Script
    fetch("https://script.google.com/macros/s/AKfycbzFHeO0-Z9lqg0pn9e4LpfFbmt79Njlj2sq_184a8JeFWXJ0-Bnt0fGG_3NTm9E9ieK/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        place: location,
        problem: observations,
        more: causeEffect,
        media: mediaFile ? mediaFile.name : "",
        name: suggestions + " | " + additionalComments
      })
    })
    .then(res => res.text())
    .then(data => {
      alert("Submitted successfully!");
      // Reset form
      document.getElementById("location").value = "";
      document.getElementById("observations").value = "";
      document.getElementById("causeEffect").value = "";
      document.getElementById("suggestions").value = "";
      document.getElementById("additionalComments").value = "";
      document.getElementById("mediaUpload").value = "";


      // Try to add marker on map after submission
L.Control.Geocoder.nominatim().geocode(location, function(results) {
  if (results.length > 0) {
    const latlng = results[0].center;
    addReportMarker(latlng, issueType, observations);
  }
});


      // Hide the form after submission
      closeForm();
    })
    .catch(error => {
      console.error("Error:", error);
      alert("There was an error submitting your report.");
    });
  }
 function submitReportForm() {
    alert("Report submitted!");
    closeForm();
  }

  function closeForm() {
    document.getElementById('report-box').style.display = 'none';
  }


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

