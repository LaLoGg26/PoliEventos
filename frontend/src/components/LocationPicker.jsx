import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// --- Fix para el ícono de Leaflet en React ---
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;
// ---------------------------------------------

function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng); // Enviar coordenadas al padre
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
}

function LocationPicker({ onLocationSelect }) {
  // Coordenadas iniciales (Centro de México por defecto, puedes cambiarlo)
  const defaultCenter = [19.4326, -99.1332];

  return (
    <div
      style={{
        height: "300px",
        width: "100%",
        borderRadius: "8px",
        overflow: "hidden",
        border: "2px solid #ddd",
      }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <LocationMarker onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  );
}

export default LocationPicker;
