import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, 
  Link as LinkIcon, 
  Calendar, 
  Edit2, 
  Loader2, 
  User as UserIcon, 
  Globe, 
  LayoutGrid, 
  Map as MapIcon, 
  Trophy, 
  AlertTriangle, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Star,
  ChevronRight,
  Info,
  CreditCard,
  Crown
} from "lucide-react";
import { EditProfileDialog, ProfileData } from "@/components/profile/EditProfileDialog";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileMap } from "@/components/maps/ProfileMap";
import { searchPlace } from "@/lib/mapbox";
import { DigitalPassport } from "@/components/profile/DigitalPassport";
import { SubscriptionCard } from "@/components/profile/SubscriptionCard";
import { RedeemCodeCard } from "@/components/subscription/RedeemCodeCard";
import { calculateUserStats, getBadges, UserStats, Badge } from "@/utils/gamification";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge as UIBadge } from "@/components/ui/badge";

export default function Profile() {
  const { user } = useAuth();
  const { isPro, proSource, trialEndsAt, manageSubscription, subscribe } = useSubscription();
  const [activeTab, setActiveTab] = useState("passport");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [userLocationCoords, setUserLocationCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#subscription") {
      setActiveTab("subscription");
      let attempts = 0;
      const scrollToSubscription = () => {
        const target = document.getElementById("subscription-section");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        if (attempts < 10) {
          attempts += 1;
          window.setTimeout(scrollToSubscription, 100);
        }
      };
      scrollToSubscription();
    }
  }, [location.hash]);

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
      if (trip.latitude && trip.longitude && trip.country_code) return trip;
      if (trip.destination) {
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
    setTrips(enrichedTrips);
  };

  const fetchUserTrips = async () => {
    if (!user) return;
    setTripsLoading(true);
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
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
      <main className="pt-24 pb-16 relative z-10 overflow-x-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* Header Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-8"
          >
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-card/50 via-card/30 to-background/50 backdrop-blur-xl shadow-2xl">
              {/* Cover Area */}
              <div className="h-40 bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-rose-500/20 w-full relative">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
              </div>
              
              <div className="px-8 pb-8">
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end -mt-16 mb-6 gap-6">
                  <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                    <div className="relative group">
                      <Avatar className="h-32 w-32 border-8 border-background/50 shadow-2xl ring-1 ring-white/10">
                        <AvatarImage src={profile.avatar_url || ""} className="object-cover" />
                        <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-primary/60 text-white font-bold">
                          {profile.full_name?.charAt(0) || user?.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {isPro && (
                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-amber-400 to-amber-600 p-2 rounded-2xl shadow-lg border-2 border-background">
                          <Crown className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-3xl font-bold tracking-tight">{profile.full_name || "Utente VoyageSmart"}</h1>
                        {isPro && (
                          <UIBadge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 transition-colors uppercase tracking-widest text-[10px] font-black py-0.5">
                            PRO Member
                          </UIBadge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {profile.username && (
                          <span className="text-primary font-medium text-lg">@{profile.username}</span>
                        )}
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span className="text-muted-foreground text-sm flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Iscritto nel {new Date(profile.created_at || new Date()).getFullYear()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 w-full md:w-auto">
                    {profile.username && (
                      <Button variant="outline" size="lg" asChild className="gap-2 flex-1 md:flex-none rounded-2xl bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10">
                        <Link to={`/u/${profile.username}`} target="_blank">
                          <Globe className="w-4 h-4" />
                          <span className="hidden sm:inline">Anteprima Pubblica</span>
                        </Link>
                      </Button>
                    )}
                    <Button onClick={() => setIsEditOpen(true)} size="lg" className="gap-2 flex-1 md:flex-none rounded-2xl shadow-xl shadow-primary/20">
                      <Edit2 className="w-4 h-4" />
                      Modifica Profilo
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    {profile.bio ? (
                      <p className="text-foreground/70 text-lg leading-relaxed max-w-2xl italic">
                        "{profile.bio}"
                      </p>
                    ) : (
                      <p className="text-muted-foreground/50 text-sm italic">
                        Nessuna biografia impostata. Racconta qualcosa di te...
                      </p>
                    )}

                    <div className="flex flex-wrap gap-6 text-sm">
                      {profile.location && (
                        <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10 text-primary font-medium">
                          <MapPin className="w-4 h-4" />
                          {profile.location}
                        </div>
                      )}
                      {profile.website && (
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-2xl border border-border/50 hover:border-primary/30 transition-all hover:text-primary"
                        >
                          <LinkIcon className="w-4 h-4" />
                          {profile.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
                     <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                        <Trophy className="w-32 h-32" />
                     </div>
                     <div className="relative z-10 flex flex-col justify-between h-full">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Quick Stats</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-2xl font-bold tracking-tighter tabular-nums text-primary">{stats.totalTrips}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Viaggi</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold tracking-tighter tabular-nums text-primary">{stats.countriesVisited}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Paesi</p>
                          </div>
                          <div className="col-span-2">
                             <div className="flex items-center gap-2 mt-2">
                               <div className="flex -space-x-2">
                                 {badges.slice(0, 3).map((badge, i) => (
                                   <div key={i} className={`p-1.5 rounded-full border-2 border-background shadow-sm ${badge.unlocked ? 'bg-amber-100' : 'bg-muted'}`}>
                                      <Star className={`w-3 h-3 ${badge.unlocked ? 'text-amber-600 fill-amber-600' : 'text-muted-foreground'}`} />
                                   </div>
                                 ))}
                               </div>
                               <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                 {badges.filter(b => b.unlocked).length} Badge sbloccati
                               </span>
                             </div>
                          </div>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {!profile.username && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent p-6 mb-8 flex flex-col sm:flex-row items-center gap-6"
            >
              <div className="bg-amber-500/20 p-4 rounded-2xl">
                <Globe className="w-8 h-8 text-amber-600" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-xl font-bold text-amber-900 dark:text-amber-200">Sblocca il tuo Profilo Pubblico</h4>
                <p className="text-amber-800/80 dark:text-amber-200/60 mt-1 max-w-xl">
                  Imposta un username per condividere i tuoi viaggi e mostrare il tuo passaporto digitale personalizzato.
                </p>
              </div>
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white border-0 shrink-0 rounded-2xl" onClick={() => setIsEditOpen(true)}>
                Imposta Username
              </Button>
            </motion.div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
            <div className="flex justify-center">
              <TabsList className="bg-muted/30 backdrop-blur-sm p-1.5 rounded-2xl h-14 w-full md:w-auto border border-white/10">
                <TabsTrigger value="passport" className="rounded-xl px-8 data-[state=active]:bg-background data-[state=active]:shadow-lg">Passaporto</TabsTrigger>
                <TabsTrigger value="trips" className="rounded-xl px-8 data-[state=active]:bg-background data-[state=active]:shadow-lg">Viaggi</TabsTrigger>
                <TabsTrigger value="subscription" className="rounded-xl px-8 data-[state=active]:bg-background data-[state=active]:shadow-lg">Premium</TabsTrigger>
                <TabsTrigger value="about" className="rounded-xl px-8 data-[state=active]:bg-background data-[state=active]:shadow-lg">Info</TabsTrigger>
              </TabsList>
            </div>
            
            <AnimatePresence mode="wait">
              <TabsContent value="passport" className="mt-0 focus-visible:outline-none focus-visible:ring-0 outline-none">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <DigitalPassport stats={stats} badges={badges} loading={tripsLoading && !stats.totalTrips} />
                </motion.div>
              </TabsContent>

              <TabsContent value="trips" className="mt-0 focus-visible:outline-none focus-visible:ring-0 outline-none space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between bg-card/30 backdrop-blur-sm p-4 rounded-[2rem] border border-white/5">
                    <h3 className="text-xl font-bold flex items-center gap-3 ml-2">
                      <div className="p-2 rounded-xl bg-primary/10">
                        <Globe className="w-5 h-5 text-primary" />
                      </div>
                      I tuoi viaggi
                    </h3>
                    <div className="flex items-center bg-muted/50 p-1.5 rounded-xl border border-white/5">
                      <Button 
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                        size="sm"
                        className="h-10 px-4 rounded-lg gap-2"
                        onClick={() => setViewMode('grid')}
                      >
                        <LayoutGrid className="w-4 h-4" />
                        <span className="hidden sm:inline">Griglia</span>
                      </Button>
                      <Button 
                        variant={viewMode === 'map' ? 'secondary' : 'ghost'} 
                        size="sm"
                        className="h-10 px-4 rounded-lg gap-2"
                        onClick={() => setViewMode('map')}
                      >
                        <MapIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Mappa</span>
                      </Button>
                    </div>
                  </div>

                  {tripsLoading ? (
                    <div className="flex justify-center py-24">
                      <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
                    </div>
                  ) : trips.length > 0 ? (
                    <div className="min-h-[400px]">
                      {viewMode === 'map' ? (
                        <Card className="overflow-hidden rounded-[2.5rem] border-white/10 shadow-2xl h-[650px]">
                          <ProfileMap trips={trips} />
                        </Card>
                      ) : (
                        <div className="grid gap-6 sm:grid-cols-2">
                          {trips.map((trip, index) => (
                            <motion.div
                               key={trip.id}
                               initial={{ opacity: 0, scale: 0.95 }}
                               animate={{ opacity: 1, scale: 1 }}
                               transition={{ delay: index * 0.05 }}
                            >
                              <Link to={`/trips/${trip.id}`}>
                                <Card className="group relative overflow-hidden rounded-[2rem] border-white/10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-card/40 backdrop-blur-sm">
                                  <div className="aspect-[16/10] relative overflow-hidden">
                                    <img 
                                      src={trip.cover_image || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"} 
                                      alt={trip.title}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
                                    
                                    <div className="absolute top-4 right-4">
                                      <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                        {new Date(trip.start_date).getFullYear()}
                                      </div>
                                    </div>

                                    <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                                      <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">{trip.title}</h3>
                                      <p className="text-sm opacity-70 flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {trip.destination}
                                      </p>
                                    </div>
                                  </div>
                                </Card>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-24 rounded-[2.5rem] border-2 border-dashed border-white/10 bg-white/5">
                      <div className="p-6 bg-white/5 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <Globe className="w-12 h-12 text-muted-foreground opacity-20" />
                      </div>
                      <h4 className="text-xl font-bold text-foreground">Ancora nessun viaggio?</h4>
                      <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                        Inizia la tua avventura creando il tuo primo itinerario personalizzato.
                      </p>
                      <Button asChild className="mt-8 rounded-2xl h-12 px-8" size="lg">
                        <Link to="/trips/new">Crea un nuovo viaggio</Link>
                      </Button>
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="subscription" id="subscription-section" className="mt-0 focus-visible:outline-none focus-visible:ring-0 outline-none">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  {/* Status Card */}
                  <div className={`relative overflow-hidden rounded-[2.5rem] border p-8 bg-gradient-to-br ${isPro ? 'border-amber-500/30 from-amber-500/10 to-transparent' : 'border-white/10 from-card/50 to-transparent backdrop-blur-xl'}`}>
                    <div className="absolute -right-12 -top-12 opacity-[0.03]">
                       {isPro ? <Crown className="w-48 h-48" /> : <ShieldCheck className="w-48 h-48" />}
                    </div>
                    
                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                      <div className="space-y-6">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Stato Abbonamento</p>
                          <h3 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            {isPro ? 'Premium' : 'Free Plan'}
                            {isPro && <UIBadge className="bg-amber-500 text-white border-0 py-1 px-3">ACTIVE</UIBadge>}
                          </h3>
                        </div>

                        <p className="text-foreground/70 text-lg leading-relaxed">
                          {isPro 
                            ? "Goditi l'esperienza completa di VoyageSmart con intelligenza artificiale illimitata, export PDF premium e molto altro."
                            : "Il tuo account attuale ha dei limiti sulle funzionalità avanzate. Passa a Premium per sbloccare tutto il potenziale."}
                        </p>

                        <div className="flex flex-col gap-3">
                          {isPro ? (
                            <Button size="lg" variant="outline" className="rounded-[1.5rem] h-14 border-white/10 hover:bg-white/5 gap-2" onClick={manageSubscription}>
                              <CreditCard className="w-5 h-5" />
                              Gestisci Abbonamento
                            </Button>
                          ) : (
                            <Button size="lg" className="rounded-[1.5rem] h-14 bg-gradient-to-r from-primary to-indigo-600 shadow-2xl shadow-primary/30 gap-2 font-bold" onClick={() => subscribe()}>
                              <Zap className="w-5 h-5 fill-white" />
                              Passa a Premium
                            </Button>
                          )}
                          
                          {proSource === 'promo_code' && trialEndsAt && (
                            <div className="flex items-center gap-2 text-sm text-amber-600 font-medium bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
                              <Info className="w-4 h-4" />
                              La tua promo scade il {new Date(trialEndsAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {[
                          { icon: Zap, label: "AI illimitata", pro: true },
                          { icon: Trophy, label: "Badge Premium", pro: true },
                          { icon: Globe, label: "Export PDF HD", pro: true },
                          { icon: ShieldCheck, label: "Vault Criptato", pro: true },
                        ].map((feat, i) => (
                          <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <div className={`p-2.5 rounded-xl ${isPro ? 'bg-amber-500/20' : 'bg-muted'}`}>
                              <feat.icon className={`w-5 h-5 ${isPro ? 'text-amber-500' : 'text-muted-foreground'}`} />
                            </div>
                            <span className="font-semibold text-foreground/90">{feat.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <RedeemCodeCard />
                    <Card className="rounded-[2rem] bg-card/30 backdrop-blur-xl border-white/10 overflow-hidden relative group">
                       <div className="absolute -right-10 -top-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                         <Star className="w-32 h-32" />
                       </div>
                       <CardContent className="p-8 space-y-4">
                         <h4 className="text-xl font-bold">Perché Premium?</h4>
                         <ul className="space-y-3">
                           {[
                             "Pianifica viaggi senza limiti di destinazioni",
                             "Consigli AI personalizzati in tempo reale",
                             "Accesso esclusivo alle nuove funzionalità",
                             "Supporto prioritario 24/7"
                           ].map((text, i) => (
                             <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                               <div className="mt-1 p-0.5 rounded-full bg-emerald-500/20 text-emerald-500">
                                 <ChevronRight className="w-3 h-3" />
                               </div>
                               {text}
                             </li>
                           ))}
                         </ul>
                       </CardContent>
                    </Card>
                  </div>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="about" className="mt-0 focus-visible:outline-none focus-visible:ring-0 outline-none">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-2xl mx-auto"
                >
                  <Card className="rounded-[2.5rem] bg-card/30 backdrop-blur-xl border-white/10 overflow-hidden">
                    <CardContent className="p-10 space-y-8">
                      <div>
                        <h3 className="text-2xl font-bold mb-6">Dettagli Account</h3>
                        <div className="grid gap-6">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email di accesso</span>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-foreground font-medium flex items-center justify-between">
                              {user?.email}
                              <ShieldCheck className="w-5 h-5 text-emerald-500/50" />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">ID Identificativo</span>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 font-mono text-xs text-muted-foreground break-all">
                              {user?.id}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/5 space-y-6">
                        <h4 className="font-bold">Sicurezza & Privacy</h4>
                        <div className="grid sm:grid-cols-2 gap-4">
                           <Button variant="outline" className="rounded-2xl h-12 border-white/10 hover:bg-white/5 text-sm gap-2">
                             Cambia Password
                           </Button>
                           <Button variant="outline" className="rounded-2xl h-12 border-white/10 hover:bg-white/5 text-sm text-destructive hover:text-destructive gap-2">
                             Elimina Account
                           </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
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
