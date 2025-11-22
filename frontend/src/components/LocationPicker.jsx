import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Fix para el ícono de Leaflet
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Este componente mueve la cámara del mapa cuando cambian las coordenadas
function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 13);
    }
  }, [position, map]); // Solo se mueve si la 'position' que viene del padre cambia
  return null;
}

// Este componente detecta los clics y avisa al padre
function LocationMarker({ position, onLocationSelect }) {
  useMapEvents({
    click(e) {
      // Al hacer clic, NO guardamos estado aquí.
      // Solo le avisamos al padre: "Oye, el usuario quiere esta ubicación"
      onLocationSelect(e.latlng);
    },
  });
  // Renderiza el marcador donde diga el padre (position)
  return position === null ? null : <Marker position={position}></Marker>;
}

function LocationPicker({ onLocationSelect, initialPosition }) {
  const defaultCenter = [19.4326, -99.1332];

  // NOTA: Ya no hay useState ni useEffect aquí.
  // Confiamos ciegamente en 'initialPosition' que viene desde EditEventPage.

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
          attribution="&copy; OpenStreetMap"
        />

        {/* Componentes controlados por las props */}
        <MapUpdater position={initialPosition} />

        <LocationMarker
          position={initialPosition}
          onLocationSelect={onLocationSelect}
        />
      </MapContainer>
    </div>
  );
}

export default LocationPicker;
