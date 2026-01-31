import { useState, useMemo, useRef, useEffect } from 'react';
import Map, { Marker, Popup, NavigationControl, MapRef, Source, Layer, LineLayer } from 'react-map-gl';
import { getMapboxToken } from '@/lib/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Clock, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { ItineraryActivity } from '@/hooks/useItinerary';
import type { FeatureCollection } from 'geojson';

interface ItineraryMapProps {
  activities: ItineraryActivity[];
  onMarkerClick?: (activityId: string) => void;
  active?: boolean;
}

export function ItineraryMap({ activities, onMarkerClick, active = true }: ItineraryMapProps) {
  const [popupInfo, setPopupInfo] = useState<ItineraryActivity | null>(null);
  const mapRef = useRef<MapRef>(null);
  const mapboxToken = getMapboxToken();
  const [mapError, setMapError] = useState<string | null>(null);

  const validActivities = useMemo(() => 
    activities.filter(a => a.latitude !== null && a.longitude !== null && a.latitude !== undefined && a.longitude !== undefined)
      .sort((a, b) => {
        if (a.activity_date !== b.activity_date) {
          return a.activity_date.localeCompare(b.activity_date);
        }
        if (!a.start_time && !b.start_time) return 0;
        if (!a.start_time) return 1;
        if (!b.start_time) return -1;
        return a.start_time.localeCompare(b.start_time);
      }), 
  [activities]);

  const initialViewState = useMemo(() => {
    if (validActivities.length === 0) {
      return {
        latitude: 41.9028,
        longitude: 12.4964,
        zoom: 3
      };
    }
    
    // Center on the first activity
    return {
      latitude: validActivities[0].latitude!,
      longitude: validActivities[0].longitude!,
      zoom: 12
    };
  }, [validActivities]);

  // Create GeoJSON for the route line
  const routeGeoJSON: FeatureCollection = useMemo(() => ({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: validActivities.map(a => [a.longitude!, a.latitude!])
        }
      }
    ]
  }), [validActivities]);

  const routeShadowLayerStyle: LineLayer = {
    id: 'route-shadow',
    type: 'line',
    paint: {
      'line-color': '#2563eb',
      'line-width': 10,
      'line-opacity': 0.25,
      'line-blur': 2
    }
  };

  const routeLayerStyle: LineLayer = {
    id: 'route',
    type: 'line',
    paint: {
      'line-color': '#3b82f6', // Primary blue
      'line-width': 4,
      'line-opacity': 0.7,
      'line-dasharray': [2, 1] // Dashed line to imply sequence
    }
  };

  // Fit bounds when activities change
  useEffect(() => {
    if (validActivities.length > 0 && mapRef.current) {
      const bounds = new mapboxgl.LngLatBounds();
      validActivities.forEach(a => bounds.extend([a.longitude!, a.latitude!]));
      
      mapRef.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
        duration: 1000
      });
    }
  }, [validActivities]);

  useEffect(() => {
    if (active && mapRef.current) {
      mapRef.current.resize();
    }
  }, [active]);

  const handleMarkerClick = (activity: ItineraryActivity) => {
    mapRef.current?.flyTo({
      center: [activity.longitude!, activity.latitude!],
      zoom: 14,
      duration: 1000,
      essential: true,
      offset: [0, 100]
    });
    setPopupInfo(activity);
    if (onMarkerClick) onMarkerClick(activity.id);
  };

  if (!mapboxToken) return (
    <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-xl border border-dashed">
      <div className="text-center px-6">
        <p className="text-muted-foreground">Token Mapbox mancante.</p>
        <p className="text-xs text-muted-foreground mt-1">
          Imposta VITE_MAPBOX_TOKEN per abilitare la mappa.
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-border/60 shadow-sm relative bg-muted/20">
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={mapboxToken}
        attributionControl={false}
        onError={(event) => {
          const message = event?.error?.message || "Errore durante il caricamento della mappa.";
          setMapError(message);
        }}
      >
        <NavigationControl position="top-right" showCompass={false} />
        
        {/* Draw Route Line */}
        {validActivities.length > 1 && (
          <Source id="route-source" type="geojson" data={routeGeoJSON}>
            <Layer {...routeShadowLayerStyle} />
            <Layer {...routeLayerStyle} />
          </Source>
        )}

        {validActivities.map((activity, index) => (
          <Marker
            key={activity.id}
            longitude={activity.longitude!}
            latitude={activity.latitude!}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleMarkerClick(activity);
            }}
          >
            <div className="group relative flex flex-col items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-md font-bold text-xs transition-transform hover:scale-110
                ${activity.category === 'food' ? 'bg-orange-500 text-white' : 
                  activity.category === 'sightseeing' ? 'bg-purple-500 text-white' : 
                  'bg-primary text-white'}
              `}>
                {index + 1}
              </div>
              <div className="absolute -bottom-1 w-2 h-1 bg-black/20 rounded-full blur-[1px]" />
            </div>
          </Marker>
        ))}

        <AnimatePresence>
          {popupInfo && (
            <Popup
              anchor="bottom"
              longitude={popupInfo.longitude!}
              latitude={popupInfo.latitude!}
              onClose={() => setPopupInfo(null)}
              className="z-50"
              closeButton={false}
              maxWidth="280px"
              offset={15}
            >
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative w-[240px] bg-background/95 backdrop-blur-md rounded-xl shadow-xl border border-border/50 overflow-hidden"
              >
                 <div className="p-3">
                   <div className="flex justify-between items-start gap-2 mb-2">
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 uppercase tracking-wide">
                        {popupInfo.category}
                      </Badge>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setPopupInfo(null);
                        }}
                        className="text-muted-foreground hover:text-foreground p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                   </div>

                   <h4 className="font-bold text-sm leading-tight mb-1">{popupInfo.title}</h4>
                   <p className="text-xs text-muted-foreground truncate mb-3">{popupInfo.location}</p>

                   <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                      {popupInfo.start_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-primary" />
                          <span>{popupInfo.start_time}</span>
                        </div>
                      )}
                      {!popupInfo.start_time && (
                        <span className="italic">Orario non definito</span>
                      )}
                   </div>
                 </div>
              </motion.div>
            </Popup>
          )}
        </AnimatePresence>
      </Map>

      {(mapError || activities.length === 0 || validActivities.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-background/90 backdrop-blur-sm border border-border/60 rounded-xl px-4 py-3 text-center shadow-md">
            {mapError ? (
              <>
                <p className="text-sm font-semibold text-foreground">Impossibile caricare la mappa</p>
                <p className="text-xs text-muted-foreground mt-1">{mapError}</p>
              </>
            ) : activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nessuna attività da mostrare sulla mappa.</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Nessuna attività con coordinate.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Seleziona un luogo dai suggerimenti per visualizzarlo sulla mappa.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Need to import mapboxgl globally to access LngLatBounds if typescript complains, 
// but usually it works if @types/mapbox-gl is present. 
// If not, we can import mapboxgl from 'mapbox-gl'.
import mapboxgl from 'mapbox-gl';
