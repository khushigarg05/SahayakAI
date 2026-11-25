"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Phone, Building2 } from "lucide-react";
import { Kiosk } from "@/lib/api";

// 100% Offline-Safe SVG Pin Icons (No external CDN image downloads needed!)
const createSvgPin = (bgColor: string, symbol: string) => {
  return L.divIcon({
    className: "custom-map-pin",
    html: `
      <div style="
        background-color: ${bgColor};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: 800;
          font-size: 13px;
        ">${symbol}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const cscPin = createSvgPin("#15803d", "🏛️");
const citizenPin = createSvgPin("#1d4ed8", "📍");

interface DynamicMapProps {
  kiosks?: Kiosk[];
  onSelectKiosk?: (k: Kiosk) => void;
}

export default function DynamicMap({ kiosks = [], onSelectKiosk }: DynamicMapProps) {
  // Default coordinates centered on Varanasi, Uttar Pradesh
  const defaultCenter: [number, number] = [25.3176, 82.9739];

  // Coordinates mapping for sample kiosks in Varanasi region
  const kioskCoords: { [key: number]: [number, number] } = {
    1: [25.3176, 82.9739],
    2: [25.2677, 82.9090],
    3: [25.5412, 82.8021],
  };

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden relative z-0 min-h-[480px]">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Citizen Current Location Pin */}
        <Marker position={defaultCenter} icon={citizenPin}>
          <Popup>
            <div className="p-1 text-xs">
              <span className="font-bold text-blue-900 block">नागरिक का स्थान (Your Location)</span>
              <span className="text-slate-500">Varanasi, Uttar Pradesh</span>
            </div>
          </Popup>
        </Marker>

        {/* CSC Kendra Markers */}
        {kiosks.map((kiosk, idx) => {
          const coords = kioskCoords[kiosk.id] || [
            defaultCenter[0] + (idx === 0 ? 0.015 : idx === 1 ? -0.02 : 0.03),
            defaultCenter[1] + (idx === 0 ? -0.015 : idx === 1 ? 0.025 : -0.035),
          ];

          return (
            <Marker key={kiosk.id} position={coords} icon={cscPin}>
              <Popup>
                <div className="p-2 min-w-[220px] text-xs font-sans space-y-2">
                  <div className="border-b border-slate-100 pb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      CSC JAN SEVA KENDRA
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">
                      {kiosk.center_name || kiosk.name}
                    </h3>
                    <p className="text-slate-500 text-[11px] mt-0.5">{kiosk.address}</p>
                  </div>

                  <div className="space-y-1 text-slate-700 text-[11px]">
                    <div className="flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{kiosk.phone || kiosk.contact_number || "+91 94150 12345"}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>संचालक: {kiosk.vle_operator_name || kiosk.operator_name || "सुरेंद्र यादव"}</span>
                    </div>
                  </div>

                  {onSelectKiosk && (
                    <button
                      onClick={() => onSelectKiosk(kiosk)}
                      className="w-full mt-2 py-1.5 px-3 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                    >
                      अपॉइंटमेंट टोकन बुक करें
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
