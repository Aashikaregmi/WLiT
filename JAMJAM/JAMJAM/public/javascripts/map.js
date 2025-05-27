document.addEventListener('DOMContentLoaded', () => {
  const mapContainer = document.getElementById('map');
  if (mapContainer) {
    const map = L.map('map').setView([28.2096, 83.9595], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    const route = [
      [28.2096, 83.9595], // Lakeside
      [28.2296, 83.9895]  // Prithvi Chowk
    ];
    L.polyline(route, { color: '#0056B3' }).addTo(map);
    L.marker([28.2096, 83.9595]).addTo(map).bindPopup('Lakeside');
    L.marker([28.2296, 83.9895]).addTo(map).bindPopup('Prithvi Chowk');
  }
});