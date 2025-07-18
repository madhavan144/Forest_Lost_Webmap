// Create the map
var map = L.map('map').setView([7.8731, 80.7718], 7);

// Add OpenStreetMap base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Load CSV data
let forestLossData = {};

d3.csv("district_forest_loss_srilanka.csv").then(csvData => {
    csvData.forEach(row => {
        forestLossData[row.District.trim()] = +row.Loss_ha;
    });

    // Load GeoJSON
    fetch('sri_lanka_districts.geojson')
        .then(res => res.json())
        .then(geoData => {
            // Define color scale
            function getColor(value) {
                return value > 1000 ? '#800026' :
                       value > 500  ? '#BD0026' :
                       value > 200  ? '#E31A1C' :
                       value > 100  ? '#FC4E2A' :
                       value > 50   ? '#FD8D3C' :
                       value > 10   ? '#FEB24C' :
                       value > 0    ? '#FED976' :
                                      '#FFEDA0';
            }

            function style(feature) {
                const district = feature.properties.District.trim();
                const loss = forestLossData[district] || 0;

                return {
                    fillColor: getColor(loss),
                    weight: 1,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            }

            function onEachFeature(feature, layer) {
                const district = feature.properties.District.trim();
                const loss = forestLossData[district] || 0;

                layer.bindPopup(`<strong>${district}</strong><br>Forest Loss: ${loss} ha`);
            }

            L.geoJSON(geoData, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(map);
        });
});
