"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Phone, ExternalLink } from "lucide-react";

// Fix leaflet icon issue in Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icon for CSC Centers
const cscIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Mock locations
const CENTERS = [
  { id: 1, name: "CSC Center Rampur", type: "Common Service Center", lat: 28.7041, lng: 77.1025, distance: "2.1 km", waitTime: "15 mins", phone: "+91 98765 43210" },
  { id: 2, name: "Tehsil Office Janakpuri", type: "Govt Office", lat: 28.7150, lng: 77.0900, distance: "3.5 km", waitTime: "45 mins", phone: "+91 11 2345 6789" },
  { id: 3, name: "Post Office CSC", type: "Post Office", lat: 28.6900, lng: 77.1200, distance: "4.2 km", waitTime: "5 mins", phone: "+91 11 9876 5432" },
];

export default function DynamicMap() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Simulate getting user location
    const timer = setTimeout(() => {
      setUserLocation([28.7000, 77.1000]); // Mock coordinates (Delhi)
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!userLocation) return <div className="h-full w-full bg-secondary/20 animate-pulse flex items-center justify-center">Loading Map...</div>;

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-white/10 relative z-0">
      <MapContainer 
        center={userLocation} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // Optional: Dark mode tiles can be used here if needed, keeping standard OSM for clarity
        />
        
        {/* User Location */}
        <Marker position={userLocation} icon={userIcon}>
          <Popup>
            <div className="font-semibold">Your Location</div>
          </Popup>
        </Marker>

        {/* Assistance Centers */}
        {CENTERS.map(center => (
          <Marker key={center.id} position={[center.lat, center.lng]} icon={cscIcon}>
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px]">
                <h3 className="font-bold text-sm text-foreground mb-1">{center.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{center.type}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs">
                    <Navigation className="w-3 h-3 mr-2 text-primary" /> {center.distance} away
                  </div>
                  <div className="flex items-center text-xs">
                    <MapPin className="w-3 h-3 mr-2 text-primary" /> Est. wait: {center.waitTime}
                  </div>
                  <div className="flex items-center text-xs">
                    <Phone className="w-3 h-3 mr-2 text-primary" /> {center.phone}
                  </div>
                </div>

                <button className="w-full bg-primary text-primary-foreground text-xs font-semibold py-1.5 rounded flex items-center justify-center hover:bg-primary/90">
                  <ExternalLink className="w-3 h-3 mr-1" /> Get Directions
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
