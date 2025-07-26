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

            // Zoom to selected district at zoom level 19
            map.fitBounds(selectedDistrict.getBounds(), { maxZoom: 19 });

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

  document.querySelector('#chart-box h2').innerText = `Forest_Loss - ${districtName}`;
}


const searchControl = L.Control.geocoder({
  defaultMarkGeocode: true,
  placeholder: 'Search for a place...'
}).addTo(map);

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

let issueChart;

async function fetchAndRenderLiveIssueChart() {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSTBJJ5gIduUwbOOiApi19s8DTg3BA6hxuqbbxCLGOTyzp0l8YU9iIClRU5cXtv_o2V2eZLx1uEdvNf/pub?output=csv';
  const statusEl = document.getElementById('chart-status');

  try {
    const res = await fetch(csvUrl);
    const text = await res.text();

    const rows = text.trim().split('\n');
    if (rows.length < 2) {
      statusEl.innerText = "No data rows found.";
      return;
    }

    const issueIndex = rows[0].split(',').findIndex(h => h.toLowerCase().includes("issue"));
    if (issueIndex === -1) {
      statusEl.innerText = "‘Issue Type’ column not found.";
      return;
    }

    const counts = {};
    rows.slice(1).forEach(row => {
      const cols = row.split(',');
      const type = cols[issueIndex]?.trim();
      if (type) counts[type] = (counts[type] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const data = Object.values(counts);

    if (labels.length === 0) {
      statusEl.innerText = "No valid issue types found.";
      return;
    }

    statusEl.innerText = `Loaded ${rows.length - 1} responses`;

    renderLivePieChart(labels, data);
  } catch (e) {
    console.error("Chart loading error:", e);
    statusEl.innerText = "Error loading chart data.";
  }
}

function renderLivePieChart(labels, data) {
  const ctx = document.getElementById('live-issue-chart').getContext('2d');

  if (issueChart) {
    issueChart.data.labels = labels;
    issueChart.data.datasets[0].data = data;
    issueChart.update();
    return;
  }

  issueChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ['#ff6f69', '#ffcc5c', '#88d8b0', '#6a9fb5', '#f67280']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'black'
          }
        }
      }
    }
  });
}


fetchAndRenderLiveIssueChart();
setInterval(fetchAndRenderLiveIssueChart, 30000);

const toggleRecentCommentsBtn = document.getElementById('toggle-recent-comments-btn');
const recentCommentsBox = document.getElementById('recent-comments');

toggleRecentCommentsBtn.addEventListener('click', () => {
  if (recentCommentsBox.style.display === 'none' || recentCommentsBox.style.display === '') {
    recentCommentsBox.style.display = 'block';
  } else {
    recentCommentsBox.style.display = 'none';
  }
});


