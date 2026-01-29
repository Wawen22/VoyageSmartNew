import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Link as LinkIcon, Calendar, Edit2, Loader2, User as UserIcon, Globe } from "lucide-react";
import { EditProfileDialog, ProfileData } from "@/components/profile/EditProfileDialog";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);

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
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTrips = async () => {
    if (!user) return;
    setTripsLoading(true);
    try {
      // Fetch trips where user is owner or member
      // Since we don't have a simple view for this yet without complex joins, 
      // let's just fetch trips owned by user for the profile display for now, 
      // or duplicate the logic from Trips page if needed. 
      // For a "Social Profile", showing trips they OWN is usually the standard first step.
      
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false });

      if (error) throw error;
      setTrips(data || []);
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

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!profile) return null; // Should handle error state better

  return (
    <AppLayout>
      <main className="pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* Profile Header Card */}
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

          {/* Content Tabs */}
          <Tabs defaultValue="trips" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="trips">I miei Viaggi</TabsTrigger>
              <TabsTrigger value="about">Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trips" className="mt-6">
              {tripsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : trips.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {trips.map((trip) => (
                    <Link key={trip.id} to={`/trips/${trip.id}`}>
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
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-xl border-dashed border-muted-foreground/25">
                  <Globe className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground">Nessun viaggio pubblico da mostrare.</p>
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
