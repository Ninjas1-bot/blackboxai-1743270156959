// DOM Elements
const trackBtn = document.getElementById('track-btn');
const clearBtn = document.getElementById('clear-btn');
const latitudeEl = document.getElementById('latitude');
const longitudeEl = document.getElementById('longitude');
const accuracyEl = document.getElementById('accuracy');
const historyEl = document.getElementById('history');

// App State
let map;
let watchId = null;
let markers = [];
let isTracking = false;

// Initialize Map
function initMap() {
  map = L.map('map').setView([0, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
}

// Update Current Location Display
function updateLocationDisplay(position) {
  const { latitude, longitude, accuracy } = position.coords;
  latitudeEl.textContent = latitude.toFixed(6);
  longitudeEl.textContent = longitude.toFixed(6);
  accuracyEl.textContent = Math.round(accuracy);
  
  // Center map on current location
  map.setView([latitude, longitude], 15);
  
  // Add marker
  clearMarkers();
  addMarker(latitude, longitude, 'Current Location');
}

// Add marker to map
function addMarker(lat, lng, title) {
  const marker = L.marker([lat, lng])
    .addTo(map)
    .bindPopup(title);
  markers.push(marker);
}

// Clear all markers
function clearMarkers() {
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
}

// Save location to database
async function saveLocation(latitude, longitude) {
  try {
    await fetch('http://localhost:8000/api/locations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ latitude, longitude }),
    });
  } catch (error) {
    console.error('Error saving location:', error);
  }
}

// Load location history
async function loadHistory() {
  try {
    const response = await fetch('http://localhost:8000/api/locations');
    const locations = await response.json();
    renderHistory(locations);
  } catch (error) {
    console.error('Error loading history:', error);
  }
}

// Render location history
function renderHistory(locations) {
  historyEl.innerHTML = locations
    .map(loc => `
      <div class="history-item">
        <p class="text-sm">${new Date(loc.timestamp).toLocaleString()}</p>
        <p class="text-xs text-gray-500">Lat: ${loc.latitude.toFixed(4)}, Lng: ${loc.longitude.toFixed(4)}</p>
      </div>
    `)
    .join('');
}

// Clear location history
async function clearHistory() {
  try {
    await fetch('http://localhost:8000/api/locations', {
      method: 'DELETE',
    });
    historyEl.innerHTML = '';
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

// Toggle tracking
function toggleTracking() {
  if (isTracking) {
    navigator.geolocation.clearWatch(watchId);
    trackBtn.textContent = 'Start Tracking';
    isTracking = false;
  } else {
    watchId = navigator.geolocation.watchPosition(
      position => {
        updateLocationDisplay(position);
        saveLocation(position.coords.latitude, position.coords.longitude);
        loadHistory();
      },
      error => {
        console.error('Geolocation error:', error);
        alert('Error getting location: ' + error.message);
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    trackBtn.textContent = 'Stop Tracking';
    isTracking = true;
  }
}

// Event Listeners
trackBtn.addEventListener('click', toggleTracking);
clearBtn.addEventListener('click', clearHistory);

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  loadHistory();
  
  // Check if geolocation is available
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser');
    trackBtn.disabled = true;
  }
});