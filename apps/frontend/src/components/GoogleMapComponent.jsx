// frontend/src/components/GoogleMapComponent.jsx
import React, { useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "450px",
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
};

// Default center (Medan)
const defaultCenter = {
  lat: 3.5952,
  lng: 98.6722,
};

const GoogleMapComponent = ({ locations }) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY,
  });

  const [selectedLocation, setSelectedLocation] = useState(null);

  if (!isLoaded) return <div style={{textAlign:"center", padding:"40px", background:"#eee", borderRadius:"16px"}}>Memuat Peta...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={12}
      options={{ streetViewControl: false, mapTypeControl: false }}
    >
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={{ lat: loc.lat, lng: loc.lng }}
          onClick={() => setSelectedLocation(loc)}
        />
      ))}

      {selectedLocation && (
        <InfoWindow
          position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
          onCloseClick={() => setSelectedLocation(null)}
        >
          <div style={{ padding: "8px", color: "#333", maxWidth: "200px" }}>
            <h4 style={{ margin: "0 0 5px", fontSize: "14px", fontWeight: "bold" }}>{selectedLocation.name}</h4>
            <p style={{ margin: "0 0 5px", fontSize: "12px", color: "#666" }}>{selectedLocation.address}</p>
            {selectedLocation.urgent && (
               <span style={{ fontSize: "10px", background: "#d92b2b", color: "white", padding: "2px 6px", borderRadius: "4px" }}>
                 Butuh: {selectedLocation.blood}
               </span>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default React.memo(GoogleMapComponent);