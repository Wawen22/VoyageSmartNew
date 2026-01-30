import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Link as LinkIcon, Calendar, Edit2, Loader2, User as UserIcon, Globe, LayoutGrid, Map as MapIcon, Trophy } from "lucide-react";
import { EditProfileDialog, ProfileData } from "@/components/profile/EditProfileDialog";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ProfileMap } from "@/components/maps/ProfileMap";
import { searchPlace } from "@/lib/mapbox";
import { DigitalPassport } from "@/components/profile/DigitalPassport";
import { calculateUserStats, getBadges, UserStats, Badge } from "@/utils/gamification";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [userLocationCoords, setUserLocationCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data as ProfileData);
      
      // Attempt to geocode user location for stats
      if (data.location) {
        const coords = await searchPlace(data.location);
        if (coords) {
          setUserLocationCoords({ lat: coords.lat, lng: coords.lng });
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const enrichTripsWithCoordinates = async (rawTrips: any[]) => {
    const tripsToProcess = rawTrips.filter(t => !t.latitude || !t.longitude || !t.country_code);
    
    if (tripsToProcess.length === 0) return;

    const enrichedTrips = await Promise.all(rawTrips.map(async (trip) => {
      // If we have coords and country code, we are good
      if (trip.latitude && trip.longitude && trip.country_code) return trip;
      
      // If we have destination, try to fetch missing info
      if (trip.destination) {
        // Only fetch if we are missing something
        if (!trip.latitude || !trip.longitude || !trip.country_code) {
           const result = await searchPlace(trip.destination);
           
           if (result) {
             const updates: any = {};
             if (!trip.latitude || !trip.longitude) {
               updates.latitude = result.lat;
               updates.longitude = result.lng;
             }
             if (!trip.country_code && result.countryCode) {
               updates.country_code = result.countryCode;
             }

             if (Object.keys(updates).length > 0) {
               // Update in background
               supabase.from('trips').update(updates).eq('id', trip.id).then(({ error }) => {
                  if (error) console.error("Error updating trip details", trip.id, error);
               });
               
               return { ...trip, ...updates };
             }
           }
        }
      }
      return trip;
    }));

    // Only update state if we actually enriched something to avoid unnecessary re-renders
    // But since we are mapping all trips, we get a full list back.
    // A simple JSON stringify comparison or checking if any changed could work, 
    // but simply setting it is fine as it will settle.
    // However, to avoid infinite loops if enrichment fails, we might want to be careful.
    // For now, let's just set it.
    setTrips(enrichedTrips);
  };

  const fetchUserTrips = async () => {
    if (!user) return;
    setTripsLoading(true);
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false });

      if (error) throw error;
      
      const rawTrips = data || [];
      setTrips(rawTrips);
      enrichTripsWithCoordinates(rawTrips);
      
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setTripsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchUserTrips();
  }, [user]);

  const stats = useMemo(() => calculateUserStats(trips, userLocationCoords), [trips, userLocationCoords]);
  const badges = useMemo(() => getBadges(stats, trips), [stats, trips]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!profile) return null;

  return (
    <AppLayout>
      <main className="pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          
          <Card className="mb-8 border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20 w-full" />
            <div className="px-6 pb-6">
              <div className="relative flex justify-between items-end -mt-12 mb-4">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={profile.avatar_url || ""} objectFit="cover" />
                  <AvatarFallback className="text-2xl">{profile.full_name?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button onClick={() => setIsEditOpen(true)} variant="outline" size="sm" className="gap-2">
                  <Edit2 className="w-4 h-4" />
                  Modifica Profilo
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl font-bold">{profile.full_name || "Utente VoyageSmart"}</h1>
                  <p className="text-muted-foreground">@{profile.username || user?.email?.split('@')[0]}</p>
                </div>

                {profile.bio && (
                  <p className="text-foreground/80 max-w-2xl leading-relaxed">
                    {profile.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-1">
                      <LinkIcon className="w-4 h-4" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary transition-colors">
                        {profile.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Iscritto da {new Date(profile.created_at || new Date()).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="passport" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
              <TabsTrigger value="passport">Passaporto</TabsTrigger>
              <TabsTrigger value="trips">I miei Viaggi</TabsTrigger>
              <TabsTrigger value="about">Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="passport" className="mt-6">
              <DigitalPassport stats={stats} badges={badges} loading={tripsLoading && !stats.totalTrips} />
            </TabsContent>

            <TabsContent value="trips" className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Esplora i tuoi viaggi
                </h3>
                <div className="flex items-center bg-muted/50 p-1 rounded-lg">
                  <Button 
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                    size="sm"
                    className="h-8 px-3 gap-2"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden sm:inline">Griglia</span>
                  </Button>
                  <Button 
                    variant={viewMode === 'map' ? 'secondary' : 'ghost'} 
                    size="sm"
                    className="h-8 px-3 gap-2"
                    onClick={() => setViewMode('map')}
                  >
                    <MapIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Mappa</span>
                  </Button>
                </div>
              </div>

              {tripsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : trips.length > 0 ? (
                <div className="min-h-[400px]">
                  {viewMode === 'map' ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="h-[650px]"
                    >
                       <ProfileMap trips={trips} />
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid gap-4 sm:grid-cols-2"
                    >
                      {trips.map((trip, index) => (
                        <motion.div
                           key={trip.id}
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: index * 0.05 }}
                        >
                          <Link to={`/trips/${trip.id}`}>
                            <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/60">
                              <div className="aspect-video relative overflow-hidden">
                                <img 
                                  src={trip.cover_image || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"} 
                                  alt={trip.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                <div className="absolute bottom-3 left-3 text-white">
                                  <h3 className="font-semibold">{trip.title}</h3>
                                  <p className="text-xs opacity-90">{trip.destination}</p>
                                </div>
                              </div>
                            </Card>
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-xl border-dashed border-muted-foreground/25">
                  <Globe className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground">Nessun viaggio da mostrare.</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link to="/trips/new">Crea un nuovo viaggio</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="about" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Informazioni</h3>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="block font-medium text-foreground mb-1">Email</span>
                        {user?.email}
                      </div>
                      <div>
                        <span className="block font-medium text-foreground mb-1">ID Utente</span>
                        <code className="bg-muted px-2 py-1 rounded text-xs">{user?.id}</code>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <EditProfileDialog 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        profile={profile}
        onProfileUpdated={fetchProfile}
      />
    </AppLayout>
  );
}
