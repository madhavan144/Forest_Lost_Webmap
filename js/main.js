const map = L.map('map', {
  zoomControl: true,
  attributionControl: false
}).setView([7.8731, 80.7718], 7);

const darkNoLabel = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  subdomains: 'abcd',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
}).addTo(map);

const imageBounds = [[5.9194485647, 79.5211147385], [9.8352048882, 81.8791923593]];
L.imageOverlay('forest_loss.png', imageBounds, {
}).addTo(map);


async function loadIssueTypeChart() {
  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSTBJJ5gIduUwbOOiApi19s8DTg3BA6hxuqbbxCLGOTyzp0l8YU9iIClRU5cXtv_o2V2eZLx1uEdvNf/pub?output=csv";

  const response = await fetch(csvUrl);
  const data = await response.text();
  const rows = data.split("\n").slice(1);

  const counts = {};
  rows.forEach(row => {
    const cols = row.split(",");
    const issue = cols[1]?.trim(); // "Issue Type" is second column
    if (issue && issue !== "") {
      counts[issue] = (counts[issue] || 0) + 1;
    }
  });







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

  });

function showChartImage(districtName) {
  const chartImg = document.getElementById('chart-image');
  const imagePath = `charts/${districtName}.jpg`;
  chartImg.src = imagePath;
  chartImg.alt = `Forest Loss Chart for ${districtName}`;
  chartImg.style.display = 'block';

  document.querySelector('#chart-box h2').innerText =      `Forest_Loss -
            ${districtName}`;
}
//location marker
const searchControl = L.Control.geocoder({
  defaultMarkGeocode: true,
  placeholder: 'Search for a place...'
}).addTo(map);

let searchedMarker = null;

searchControl.on('markgeocode', function(e) {
  const latlng = e.geocode.center;
  const name = e.geocode.name;

  if (searchedMarker) {
    map.removeLayer(searchedMarker);
  }

  searchedMarker = L.marker(latlng).addTo(map)
    .bindPopup(name).openPopup();

  // Fill the Google Form input field
  const locationField = document.querySelector('input[name="entry.1411538969"]');
  if (locationField) {
    locationField.value = `${name} (${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)})`;
  }
});



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
    }, 2000); 
  }

    
const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSTBJJ5gIduUwbOOiApi19s8DTg3BA6hxuqbbxCLGOTyzp0l8YU9iIClRU5cXtv_o2V2eZLx1uEdvNf/pub?output=csv';

function fetchComments() {
  fetch(sheetUrl)
    .then(res => res.text())
    .then(csvText => {
      const rows = csvText.split('\n').slice(1);
      const list = document.getElementById('comments-list');
      list.innerHTML = '';
      rows.slice(-5).reverse().forEach(row => {
        const cols = row.split(',');
        const location = cols[0]?.trim();
        const issue = cols[1]?.trim();
        const cause = cols[2]?.trim();

        const li = document.createElement('li');
        li.innerHTML = `<b style="color:#7be2b6;">${issue}</b> @ ${location}`;
        li.style.cursor = 'pointer';
        li.onclick = () => {
          alert(`⌨ ${location}\n📍${issue}\n⚠⚠ ${cause}`);
        };
        list.appendChild(li);
      });
    });
}

setInterval(fetchComments, 20000);
fetchComments();

  const labels = Object.keys(counts);
  const values = Object.values(counts);

  const ctx = document.getElementById("issueChart").getContext("2d");
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: [
          '#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854',
          '#ffd92f', '#e5c494', '#b3b3b3'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: {
          display: true,
          text: 'Community Reported Issues'
        }
      }
    }
  });
}

loadIssueTypeChart();

