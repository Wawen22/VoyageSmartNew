import { useState, useRef, useEffect } from 'react';
import Map, { Marker, NavigationControl, MapRef } from 'react-map-gl';
import { getMapboxToken } from '@/lib/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';

interface TripMapWidgetProps {
  latitude?: number | null;
  longitude?: number | null;
  destinationName?: string;
  className?: string;
}

export function TripMapWidget({ latitude, longitude, destinationName, className }: TripMapWidgetProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const mapboxToken = getMapboxToken();

  const hasCoordinates = latitude && longitude;

  useEffect(() => {
    if (mapLoaded && hasCoordinates && mapRef.current) {
        mapRef.current.flyTo({
            center: [longitude!, latitude!],
            zoom: 11,
            duration: 1000
        });
    }
  }, [latitude, longitude, mapLoaded, hasCoordinates]);

  if (!mapboxToken) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-muted/20 rounded-xl border border-dashed ${className}`}>
        <div className="text-center px-4">
          <MapPin className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Token mappa mancante</p>
        </div>
      </div>
    );
  }

  if (!hasCoordinates) {
    return (
        <div className={`w-full h-full flex items-center justify-center bg-muted/20 rounded-xl border border-dashed ${className}`}>
          <div className="text-center px-4">
            <MapPin className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Coordinate non disponibili</p>
          </div>
        </div>
      );
  }

  return (
    <div className={`w-full h-full rounded-xl overflow-hidden relative ${className}`}>
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: latitude!,
          longitude: longitude!,
          zoom: 11
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={mapboxToken}
        attributionControl={false}
        onLoad={() => setMapLoaded(true)}
        reuseMaps
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        
        <Marker
            longitude={longitude!}
            latitude={latitude!}
            anchor="bottom"
        >
            <div className="relative flex flex-col items-center">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg transform -translate-y-1/2">
                    <MapPin className="w-5 h-5" />
                </div>
                <div className="w-2 h-2 bg-primary rounded-full mt-1" />
            </div>
        </Marker>
      </Map>
    </div>
  );
}
