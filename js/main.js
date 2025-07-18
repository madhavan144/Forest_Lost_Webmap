// Load final GeoJSON with forest loss data already joined
fetch('data/districts_forest_loss_final.geojson')
  .then(res => res.json())
  .then(geoData => {
    const geojsonLayer = L.geoJson(geoData, {
      style: feature => ({
        fillColor: getColor(feature.properties.Total_Loss), // Use your column here
        fillOpacity: 0.7,
        color: '#333',
        weight: 1
      }),
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        layer.bindPopup(`
          <strong>${props.DISTRICT}</strong><br>
          Total Forest Loss: ${props.Total_Loss || 'N/A'}
        `);
      }
    }).addTo(map);
  });

// Example color scale function
function getColor(loss) {
  return loss > 10000 ? '#800026' :
         loss > 5000  ? '#BD0026' :
         loss > 1000  ? '#E31A1C' :
         loss > 500   ? '#FC4E2A' :
         loss > 100   ? '#FD8D3C' :
         loss > 0     ? '#FEB24C' :
                        '#FFEDA0';
}
