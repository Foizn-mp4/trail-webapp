import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

// --- Fix for Default Leaflet Marker Icons in React ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom Red Icon for the Tracker
const trackerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// --- Helper Component to Pan the Map ---
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
}

function App() {
  // --- STATE MANAGEMENT ---
  const [itemLocation, setItemLocation] = useState({ 
    lat: 17.515972, 
    lng: 78.397916 
  });
  
  const [userLocation, setUserLocation] = useState(null); // { lat, lng, accuracy }
  const [status, setStatus] = useState({ text: "System initialized.", type: "normal" });

  // --- HANDLERS ---
  
  // 1. Refresh Tracker Position (Simulated)
  const handleRefresh = () => {
    // Simulate drift
    const newLat = itemLocation.lat + (Math.random() - 0.5) * 0.002;
    const newLng = itemLocation.lng + (Math.random() - 0.5) * 0.002;

    setItemLocation({ lat: newLat, lng: newLng });
    setStatus({ text: "🔄 Tracker data refreshed from server.", type: "normal" });
  };

  // 2. Find User Position (Browser API)
  const handleFindMe = () => {
    setStatus({ text: "Requesting GPS access...", type: "loading" });

    if (!navigator.geolocation) {
      setStatus({ text: "❌ Geolocation is not supported by your browser", type: "error" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude, accuracy });
        setStatus({ 
          text: `✅ User located at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, 
          type: "success" 
        });
      },
      (error) => {
        setStatus({ text: `❌ Error: ${error.message}`, type: "error" });
      }
    );
  };

  return (
    <div className="App">
      {/* Header */}
      <header>
        <div className="nav-container">
          <h1>📡 Trail <span style={{ fontWeight: 'lighter', opacity: 0.8 }}>| Lost Item Tracker</span></h1>
          <span className="status-badge">System Online</span>
        </div>
      </header>

      <main>
        {/* LEFT COLUMN: Map & Controls */}
        <section className="card">
          <h2>📍 Live Tracking View</h2>
          
          <div className="map-container-wrapper" style={{ height: "500px", width: "100%" }}>
            <MapContainer 
              center={[itemLocation.lat, itemLocation.lng]} 
              zoom={15} 
              style={{ height: "100%", width: "100%", borderRadius: "8px" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Pan map when item moves */}
              <MapController center={[itemLocation.lat, itemLocation.lng]} />

              {/* The Lost Item Marker */}
              <Marker position={[itemLocation.lat, itemLocation.lng]} icon={trackerIcon}>
                <Popup>
                  <div style={{ textAlign: 'center' }}>
                    <b>🛰️ Active Tracker</b><br />
                    <span style={{ color: 'green' }}>Signal: Good</span><br />
                    Lat: {itemLocation.lat.toFixed(5)}<br />
                    Lng: {itemLocation.lng.toFixed(5)}
                  </div>
                </Popup>
              </Marker>

              {/* The User Location (Blue Circle) */}
              {userLocation && (
                <Circle 
                  center={[userLocation.lat, userLocation.lng]}
                  pathOptions={{ color: '#3498db', fillColor: '#3498db', fillOpacity: 0.2 }}
                  radius={userLocation.accuracy / 2}
                >
                  <Popup><b>📍 You are here</b></Popup>
                </Circle>
              )}
            </MapContainer>
          </div>

          <div className="map-controls">
            <button className="btn-refresh" onClick={handleRefresh}>
              <span>🔄</span> Refresh Tracker
            </button>
            <button className="btn-locate" onClick={handleFindMe}>
              <span>🎯</span> Find My Position
            </button>
          </div>

          <p className={`status-text status-${status.type}`}>
            {status.text}
          </p>
        </section>

        {/* RIGHT COLUMN: Hardware Info */}
        <aside className="card">
          <h2>🛠️ Hardware Architecture</h2>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
            This tracker utilizes a low-power IoT stack designed for real-time remote asset monitoring.
          </p>
          
          <ul className="specs-list">
            <li>
              <strong>💾 ESP32 Microcontroller</strong>
              <span style={{ fontSize: '0.9rem' }}>The "Brain". Processes sensor data and manages power states.</span>
            </li>
            <li>
              <strong>🛰️ Neo-6M GPS Module</strong>
              <span style={{ fontSize: '0.9rem' }}>The "Eyes". Receives NMEA sentences to calculate coordinates.</span>
            </li>
            <li>
              <strong>📶 GSM Module (SIM800L)</strong>
              <span style={{ fontSize: '0.9rem' }}>The "Voice". Transmits data via 2G/GPRS networks.</span>
            </li>
          </ul>
        </aside>
      </main>

      <footer>
        <p>&copy; 2025 IoT Lost Item Tracker Project | Built with React & Leaflet</p>
      </footer>
    </div>
  );
}

export default App;