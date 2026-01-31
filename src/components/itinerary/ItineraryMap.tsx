import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl, MapRef, Source, Layer } from 'react-map-gl';
import type { LineLayer } from 'react-map-gl';
import { getMapboxToken } from '@/lib/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Clock, X, RotateCcw, MapPin, Calendar, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ItineraryActivity } from '@/hooks/useItinerary';
import type { FeatureCollection } from 'geojson';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

interface ItineraryMapProps {
  activities: ItineraryActivity[];
  onMarkerClick?: (activityId: string) => void;
  onViewActivity?: (activity: ItineraryActivity) => void;
  active?: boolean;
}

// Category color configuration
const categoryConfig: Record<string, { bg: string; text: string; label: string }> = {
  food: { bg: 'bg-orange-500', text: 'text-white', label: 'Cibo' },
  sightseeing: { bg: 'bg-purple-500', text: 'text-white', label: 'Attrazione' },
  activity: { bg: 'bg-primary', text: 'text-white', label: 'Attività' },
  transport: { bg: 'bg-blue-500', text: 'text-white', label: 'Trasporto' },
  accommodation: { bg: 'bg-green-500', text: 'text-white', label: 'Alloggio' },
};

// Helper function to format time without seconds (HH:MM)
const formatTime = (time: string | null): string | null => {
  if (!time) return null;
  // Time could be in format HH:MM:SS or HH:MM
  const parts = time.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return time;
};

// Helper function to format date in Italian
const formatDate = (dateStr: string): string => {
  try {
    const date = parseISO(dateStr);
    return format(date, "EEEE d MMMM", { locale: it });
  } catch {
    return dateStr;
  }
};

export function ItineraryMap({ activities, onMarkerClick, onViewActivity, active = true }: ItineraryMapProps) {
  const [popupInfo, setPopupInfo] = useState<ItineraryActivity | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<MapRef>(null);
  const mapboxToken = getMapboxToken();

  // Filter and sort valid activities
  const validActivities = useMemo(() => 
    activities
      .filter(a => a.latitude !== null && a.longitude !== null && a.latitude !== undefined && a.longitude !== undefined)
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

  // Calculate bounds from activities (manual calculation, no mapboxgl dependency)
  const bounds = useMemo(() => {
    if (validActivities.length === 0) return null;
    
    const lats = validActivities.map(a => a.latitude!);
    const lngs = validActivities.map(a => a.longitude!);
    
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  }, [validActivities]);

  // Calculate initial view state
  const initialViewState = useMemo(() => {
    if (validActivities.length === 0) {
      return {
        latitude: 41.9028,
        longitude: 12.4964,
        zoom: 3
      };
    }
    
    if (bounds) {
      return {
        latitude: (bounds.minLat + bounds.maxLat) / 2,
        longitude: (bounds.minLng + bounds.maxLng) / 2,
        zoom: validActivities.length === 1 ? 12 : 10
      };
    }

    return {
      latitude: validActivities[0].latitude!,
      longitude: validActivities[0].longitude!,
      zoom: 12
    };
  }, [validActivities, bounds]);

  // Create GeoJSON for the route line
  const routeGeoJSON: FeatureCollection = useMemo(() => ({
    type: 'FeatureCollection',
    features: validActivities.length > 1 ? [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: validActivities.map(a => [a.longitude!, a.latitude!])
        }
      }
    ] : []
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
      'line-color': '#3b82f6',
      'line-width': 4,
      'line-opacity': 0.7,
      'line-dasharray': [2, 1]
    }
  };

  // Fit bounds when map is loaded and activities change
  const fitBounds = useCallback(() => {
    if (!mapRef.current || !bounds || validActivities.length === 0) return;

    try {
      // Use flyTo for smooth animation without LngLatBounds dependency
      const centerLat = (bounds.minLat + bounds.maxLat) / 2;
      const centerLng = (bounds.minLng + bounds.maxLng) / 2;
      
      // Calculate appropriate zoom based on bounds spread
      const latDiff = bounds.maxLat - bounds.minLat;
      const lngDiff = bounds.maxLng - bounds.minLng;
      const maxDiff = Math.max(latDiff, lngDiff);
      
      let zoom = 12;
      if (maxDiff > 10) zoom = 4;
      else if (maxDiff > 5) zoom = 5;
      else if (maxDiff > 2) zoom = 7;
      else if (maxDiff > 1) zoom = 8;
      else if (maxDiff > 0.5) zoom = 9;
      else if (maxDiff > 0.1) zoom = 11;
      
      mapRef.current.flyTo({
        center: [centerLng, centerLat],
        zoom: Math.min(zoom, 15),
        duration: 1000,
        essential: true
      });
    } catch (error) {
      console.error('Error fitting bounds:', error);
    }
  }, [bounds, validActivities.length]);

  // Fit bounds when map loads
  const handleMapLoad = useCallback(() => {
    setMapLoaded(true);
    // Small delay to ensure map is fully ready
    setTimeout(fitBounds, 100);
  }, [fitBounds]);

  // Resize map when tab becomes active
  useEffect(() => {
    if (active && mapRef.current && mapLoaded) {
      // Force resize when tab becomes active
      setTimeout(() => {
        mapRef.current?.resize();
        fitBounds();
      }, 100);
    }
  }, [active, mapLoaded, fitBounds]);

  // Fit bounds when activities change
  useEffect(() => {
    if (mapLoaded && validActivities.length > 0) {
      fitBounds();
    }
  }, [validActivities, mapLoaded, fitBounds]);

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

  const handleResetView = () => {
    setPopupInfo(null);
    fitBounds();
  };

  if (!mapboxToken) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-muted/20 rounded-xl border border-dashed">
        <div className="text-center px-6">
          <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Token Mapbox mancante</p>
          <p className="text-xs text-muted-foreground mt-1">
            Imposta VITE_MAPBOX_TOKEN per abilitare la mappa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden border border-border/60 shadow-sm relative bg-muted/20">
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={mapboxToken}
        attributionControl={false}
        onLoad={handleMapLoad}
        onError={(event) => {
          const message = event?.error?.message || "Errore durante il caricamento della mappa.";
          console.error('Map error:', message);
          setMapError(message);
        }}
      >
        <NavigationControl position="top-right" showCompass={false} />
        
        {/* Reset View Button */}
        {validActivities.length > 0 && (
          <div className="absolute top-20 right-2.5 z-10">
            <button
              onClick={handleResetView}
              className="p-2 bg-white dark:bg-slate-900 border border-border shadow-md rounded-md hover:bg-muted transition-colors text-foreground"
              title="Reset visualizzazione"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Draw Route Line */}
        {validActivities.length > 1 && (
          <Source id="route-source" type="geojson" data={routeGeoJSON}>
            <Layer {...routeShadowLayerStyle} />
            <Layer {...routeLayerStyle} />
          </Source>
        )}

        {/* Activity Markers */}
        {validActivities.map((activity, index) => {
          const config = categoryConfig[activity.category] || categoryConfig.activity;
          return (
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
              <div className="group relative flex flex-col items-center cursor-pointer">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-md font-bold text-xs transition-transform hover:scale-110
                  ${config.bg} ${config.text}
                `}>
                  {index + 1}
                </div>
                <div className="absolute -bottom-1 w-2 h-1 bg-black/20 rounded-full blur-[1px]" />
              </div>
            </Marker>
          );
        })}

        {/* Popup */}
        <AnimatePresence>
          {popupInfo && (() => {
            const config = categoryConfig[popupInfo.category] || categoryConfig.activity;
            const formattedStartTime = formatTime(popupInfo.start_time);
            const formattedEndTime = formatTime(popupInfo.end_time);
            
            return (
              <Popup
                anchor="bottom"
                longitude={popupInfo.longitude!}
                latitude={popupInfo.latitude!}
                onClose={() => setPopupInfo(null)}
                className="z-50"
                closeButton={false}
                maxWidth="300px"
                offset={15}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-[280px] bg-background/98 backdrop-blur-xl rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-border/50 overflow-hidden"
                >
                  {/* Header with gradient */}
                  <div className={`px-4 py-3 ${config.bg} relative`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                    <div className="relative flex justify-between items-start gap-2">
                      <div>
                        <Badge
                          variant="secondary"
                          className="bg-white/20 text-white border-0 text-[10px] h-5 px-2 uppercase tracking-wider font-semibold backdrop-blur-sm"
                        >
                          {config.label}
                        </Badge>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPopupInfo(null);
                        }}
                        className="text-white/80 hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <h4 className="font-bold text-base leading-tight mt-2 text-white drop-shadow-sm">
                      {popupInfo.title}
                    </h4>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Location */}
                    {popupInfo.location && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground leading-tight">{popupInfo.location}</p>
                      </div>
                    )}

                    {/* Date and Time */}
                    <div className="flex flex-col gap-2 bg-muted/40 p-3 rounded-lg border border-border/30">
                      {/* Date */}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-sm font-medium capitalize">
                          {formatDate(popupInfo.activity_date)}
                        </span>
                      </div>
                      
                      {/* Time */}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary shrink-0" />
                        {formattedStartTime ? (
                          <span className="text-sm">
                            {formattedStartTime}
                            {formattedEndTime && (
                              <span className="text-muted-foreground"> → {formattedEndTime}</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Orario non definito</span>
                        )}
                      </div>
                    </div>

                    {/* Description if available */}
                    {popupInfo.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {popupInfo.description}
                      </p>
                    )}

                    {/* View Details Button */}
                    {onViewActivity && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPopupInfo(null);
                          onViewActivity(popupInfo);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        Visualizza dettagli
                      </Button>
                    )}
                  </div>
                </motion.div>
              </Popup>
            );
          })()}
        </AnimatePresence>
      </Map>

      {/* Overlay Messages */}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-background/90 backdrop-blur-sm border border-border/60 rounded-xl px-4 py-3 text-center shadow-md">
            <p className="text-sm font-semibold text-foreground">Impossibile caricare la mappa</p>
            <p className="text-xs text-muted-foreground mt-1">{mapError}</p>
          </div>
        </div>
      )}

      {!mapError && mapLoaded && activities.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-background/90 backdrop-blur-sm border border-border/60 rounded-xl px-4 py-3 text-center shadow-md">
            <p className="text-sm text-muted-foreground">Nessuna attività da mostrare sulla mappa.</p>
          </div>
        </div>
      )}

      {!mapError && mapLoaded && activities.length > 0 && validActivities.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-background/90 backdrop-blur-sm border border-border/60 rounded-xl px-4 py-3 text-center shadow-md">
            <p className="text-sm text-muted-foreground">Nessuna attività con coordinate.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Seleziona un luogo dai suggerimenti per visualizzarlo sulla mappa.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
