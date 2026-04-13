import { MapPin, Navigation } from 'lucide-react';
import type { FoodItem } from '../App';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix generic Leaflet icon missing issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom pin for food items
const foodIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom pin for User Location
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper component to center map on user dynamically
function ChangeView({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], 13);
  }, [center, map]);
  return null;
}

interface GoogleMapViewProps {
  items: FoodItem[];
  userLocation: { lat: number; lng: number };
}

export default function GoogleMapView({ items, userLocation }: GoogleMapViewProps) {
  // Using OpenStreetMap/Leaflet to simulate map interface
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col">
      {/* Map Container */}
      <div className="h-96 w-full relative z-0">
        <style>{`.leaflet-container { width: 100%; height: 100%; min-height: 24rem; }`}</style>
        <MapContainer 
          center={[userLocation.lat, userLocation.lng]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <ChangeView center={userLocation} />

          {/* Food Item Pins */}
          {items.map((item, index) => {
            const isOverlap = item.latitude === userLocation.lat && item.longitude === userLocation.lng;
            return (
            <Marker 
              key={item.id} 
              position={[
                isOverlap ? item.latitude + 0.002 : item.latitude, 
                isOverlap ? item.longitude + 0.002 : item.longitude
              ]}
              icon={foodIcon}
              zIndexOffset={10}
            >
              <Popup>
                <div className="text-sm p-1">
                  <div className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mb-1 float-right ml-2">
                    {index + 1}
                  </div>
                  <p className="font-bold text-gray-800 mb-1">{item.name}</p>
                  <p className="text-xs text-gray-600">{item.donorName}</p>
                  <p className="text-xs text-gray-500">{item.location}</p>
                </div>
              </Popup>
            </Marker>
          )})}

          {/* User Location Marker (Moved below food pins & given extreme zIndexOffset so it overlaps instead of getting buried) */}
          <Marker 
            position={[userLocation.lat, userLocation.lng]} 
            icon={userIcon}
            zIndexOffset={1000}
          >
            <Popup>
              <div className="font-semibold text-blue-700">You are here</div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Map Instructions */}
      <div className="p-6 bg-gray-50 border-t-2 border-gray-200 z-10 relative">
        <div className="flex items-start gap-3 mb-4">
          <MapPin className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-gray-800 mb-1">OpenStreetMap Integration</h4>
            <p className="text-gray-600 text-sm">
              Live coordinate mapping is powered entirely implicitly by Leaflet. Real-Time geolocation mapping simulates actual live tracking.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 rounded-full p-2">
              <Navigation className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-700 font-semibold">Your Location</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-green-600" fill="#22c55e" />
            <span className="text-gray-700 font-semibold">Approved Pickup Location</span>
          </div>
        </div>
      </div>

      {/* List of items below map */}
      <div className="p-6 space-y-3 z-10 relative bg-white border-t-2 border-gray-100">
        <h4 className="font-bold text-gray-800 text-lg mb-4">Your Scheduled Pickups</h4>
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-green-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <div>
                <p className="font-bold text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-600">{item.location} • {item.donorName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700">Ready for Pickup</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
