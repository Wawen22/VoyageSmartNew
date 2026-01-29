import { useState, useMemo, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl, MapRef } from 'react-map-gl';
import { getMapboxToken } from '@/lib/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Calendar, ArrowRight, X, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface MapTrip {
  id: string;
  title: string;
  destination: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  cover_image: string | null;
  start_date: string;
  end_date: string;
}

interface ProfileMapProps {
  trips: MapTrip[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
  planning: { label: "Planning", color: "bg-blue-500/80 text-white" },
  upcoming: { label: "In Arrivo", color: "bg-amber-500/80 text-white" },
  active: { label: "In Corso", color: "bg-green-500/80 text-white" },
  completed: { label: "Completato", color: "bg-slate-500/80 text-white" },
};

export function ProfileMap({ trips }: ProfileMapProps) {
  const [popupInfo, setPopupInfo] = useState<MapTrip | null>(null);
  const mapRef = useRef<MapRef>(null);

  const validTrips = useMemo(() => 
    trips.filter(t => t.latitude !== null && t.longitude !== null && t.latitude !== undefined && t.longitude !== undefined), 
  [trips]);

  const initialViewState = useMemo(() => {
    if (validTrips.length === 0) {
      return {
        latitude: 41.9028,
        longitude: 12.4964,
        zoom: 3
      };
    }
    
    const lats = validTrips.map(t => t.latitude!);
    const lngs = validTrips.map(t => t.longitude!);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      zoom: 3
    };
  }, [validTrips]);

  if (trips.length === 0) return null;

  const handleMarkerClick = (trip: MapTrip) => {
    mapRef.current?.flyTo({
      center: [trip.longitude!, trip.latitude!],
      zoom: 8,
      duration: 1500,
      essential: true,
      offset: [0, 150]
    });
    setPopupInfo(trip);
  };

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [initialViewState.longitude, initialViewState.latitude],
        zoom: initialViewState.zoom,
        duration: 1500,
        essential: true,
        offset: [0, 0]
      });
      setPopupInfo(null);
    }
  };

  return (
    <div className="w-full h-full min-h-[650px] rounded-2xl overflow-hidden border border-border/60 shadow-card relative bg-muted/20">
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={getMapboxToken()}
        attributionControl={false}
      >
        <NavigationControl position="top-right" showCompass={false} />
        
        <div className="absolute top-20 right-2.5 z-10">
          <button
            onClick={handleResetView}
            className="p-2 bg-white dark:bg-slate-900 border border-border shadow-md rounded-md hover:bg-muted transition-colors text-foreground"
            title="Reset visualizzazione"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {validTrips.map((trip) => (
          <Marker
            key={trip.id}
            longitude={trip.longitude!}
            latitude={trip.latitude!}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleMarkerClick(trip);
            }}
          >
            <div className="cursor-pointer hover:scale-110 transition-transform duration-300 group relative">
              <MapPin 
                className={`w-12 h-12 ${
                  trip.status === 'completed' ? 'text-slate-500 fill-slate-200' : 
                  trip.status === 'active' ? 'text-green-600 fill-green-200' :
                  'text-primary fill-primary/20'
                } drop-shadow-2xl filter`} 
                strokeWidth={1.5}
              />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-black/30 blur-[4px] rounded-full scale-50 group-hover:scale-100 transition-transform" />
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
              maxWidth="320px"
              offset={25}
            >
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative w-[280px] bg-background/80 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-white/20 overflow-hidden group"
              >
                 <div className="h-40 relative overflow-hidden">
                   <img 
                      src={popupInfo.cover_image || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400"} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt={popupInfo.title}
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                   
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       setPopupInfo(null);
                     }}
                     className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all backdrop-blur-md opacity-0 group-hover:opacity-100"
                   >
                     <X className="w-4 h-4" />
                   </button>

                   <div className="absolute top-3 left-3">
                      <Badge className={`border-0 backdrop-blur-md shadow-lg font-medium px-2.5 py-0.5 rounded-lg ${statusConfig[popupInfo.status]?.color || "bg-primary"}`}>
                        {statusConfig[popupInfo.status]?.label}
                      </Badge>
                   </div>

                   <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="font-bold text-lg leading-tight drop-shadow-md">{popupInfo.title}</h3>
                      <div className="flex items-center gap-1 text-white/80 text-xs mt-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{popupInfo.destination}</span>
                      </div>
                   </div>
                 </div>

                 <div className="p-4 space-y-4">
                   <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/50 p-2.5 rounded-xl border border-white/5">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>
                        {new Date(popupInfo.start_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} 
                        {' - '}
                        {new Date(popupInfo.end_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                   </div>

                   <Link to={`/trips/${popupInfo.id}`} className="block w-full">
                      <button className="w-full py-2.5 bg-gradient-to-r from-primary to-primary/90 hover:to-primary text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                        Vedi Dettagli
                        <ArrowRight className="w-4 h-4" />
                      </button>
                   </Link>
                 </div>
              </motion.div>
            </Popup>
          )}
        </AnimatePresence>
      </Map>
    </div>
  );
}