import { useMemo } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import { PublicTrip } from "@/hooks/usePublicProfile";
import { MapPin } from "lucide-react";
import 'mapbox-gl/dist/mapbox-gl.css';

interface PublicProfileMapProps {
  trips: PublicTrip[];
}

export function PublicProfileMap({ trips }: PublicProfileMapProps) {
  const token = "pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbjz2NjV2b3AwMzgxMm90Y3V4Y2Z4Y3F4In0.28zP9p1z572_77288"; // Use environment variable in real app

  const markers = useMemo(() => trips.filter(t => t.latitude && t.longitude), [trips]);

  // Calculate bounds? Or just default view.
  const initialViewState = {
    longitude: 12.4964,
    latitude: 41.9028,
    zoom: 1.5
  };

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border shadow-sm relative">
      <Map
        mapboxAccessToken={token} // Using Lovable/Demo token found in project if any, otherwise standard public one
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" />
        
        {markers.map((trip) => (
          <Marker 
            key={trip.id} 
            longitude={trip.longitude!} 
            latitude={trip.latitude!}
            anchor="bottom"
          >
            <div className="group relative flex flex-col items-center">
               <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                 {trip.destination}
               </div>
               <MapPin className="w-6 h-6 text-primary fill-primary/20 hover:scale-110 transition-transform cursor-pointer drop-shadow-md" />
            </div>
          </Marker>
        ))}
      </Map>
      
      {/* Overlay Title */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md border shadow-sm text-sm font-semibold text-muted-foreground">
        🗺️ Mappa dei Viaggi
      </div>
    </div>
  );
}
