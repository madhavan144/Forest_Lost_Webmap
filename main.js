let map = L.map("map").setView([7.8731, 80.7718], 7);
function drawChart(data) {
    const chartData = Object.entries(data).sort((a, b) => b[1] - a[1]); // Sort descending

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", 600)
        .attr("height", chartData.length * 20 + 50);

    const margin = { top: 20, right: 20, bottom: 30, left: 150 };
    const width = 600 - margin.left - margin.right;
    const height = chartData.length * 20;

    const x = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d[1])])
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(chartData.map(d => d[0]))
        .range([0, height])
        .padding(0.1);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.selectAll("rect")
        .data(chartData)
        .enter()
        .append("rect")
        .attr("y", d => y(d[0]))
        .attr("width", d => x(d[1]))
        .attr("height", y.bandwidth())
        .attr("fill", "#69b3a2");

    g.selectAll("text")
        .data(chartData)
        .enter()
        .append("text")
        .attr("x", d => x(d[1]) + 5)
        .attr("y", d => y(d[0]) + y.bandwidth() / 2 + 4)
        .text(d => d[1]);

    svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .call(d3.axisLeft(y));
}

// Add basemap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let geojsonLayer;
let chart;

function onEachFeature(feature, layer) {
  layer.on({
    click: function (e) {
      const districtName = feature.properties.DISTRICT || feature.properties.district;
      document.getElementById("district-name").textContent = districtName;
      highlightDistrict(e.target);
      showChart(districtName);
    },
    mouseover: function (e) {
      e.target.setStyle({ weight: 3, color: "#ff9900", fillOpacity: 0.6 });
    },
    mouseout: function (e) {
      geojsonLayer.resetStyle(e.target);
    }
  });
}

function highlightDistrict(layer) {
  geojsonLayer.eachLayer(l => geojsonLayer.resetStyle(l));
  layer.setStyle({ color: "#ff0000", weight: 3, fillOpacity: 0.4 });
}

function showChart(districtName) {
  const years = Array.from({ length: 23 }, (_, i) => 2001 + i);
  const fakeData = years.map(() => Math.floor(Math.random() * 1000)); // Replace with real data if you have CSV
  
  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("forestChart"), {
    type: "bar",
    data: {
      labels: years,
      datasets: [{
        label: "Forest Loss (ha)",
        backgroundColor: "#26a69a",
        data: fakeData
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Load GeoJSON
fetch("data/sri_lanka_districts.geojson")
  .then(res => res.json())
  .then(data => {
    geojsonLayer = L.geoJSON(data, {
      style: {
        color: "#3388ff",
        weight: 2,
        fillOpacity: 0.2
      },
      onEachFeature: onEachFeature
    }).addTo(map);
  });
