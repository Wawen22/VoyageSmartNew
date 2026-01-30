import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Globe, Trophy, Calendar, ExternalLink, Compass, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const getBadgeIcon = (iconName: string) => {
  switch (iconName) {
    case "Globe": return Globe;
    case "MapPin": return MapPin;
    case "Compass": return Compass;
    case "Zap": return Zap;
    case "Crown": return Crown;
    default: return Trophy;
  }
};

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const { data, isLoading, error } = usePublicProfile(username);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !data || !data.profile) {
    return (
      <AppLayout>
        <div className="flex flex-col h-screen items-center justify-center gap-4 text-center">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-muted-foreground">Profilo non trovato o non esistente.</p>
          <Button asChild>
            <Link to="/">Torna alla Home</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const { profile, trips, badges, stats } = data;

  return (
    <AppLayout>
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-5xl space-y-8">
          
          {/* PROFILE HEADER */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-card rounded-2xl border p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-purple-600" />
            
            <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-md">
              <AvatarImage src={profile.avatar_url || ""} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {profile.full_name?.substring(0, 2).toUpperCase() || profile.username?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">{profile.full_name || profile.username}</h1>
                <Badge variant="secondary" className="text-sm font-normal text-muted-foreground">
                  @{profile.username}
                </Badge>
              </div>
              
              {profile.bio && (
                <p className="text-muted-foreground max-w-2xl text-lg">
                  {profile.bio}
                </p>
              )}
              
              <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {profile.location}
                  </div>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                    <ExternalLink className="w-4 h-4" /> {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>

            {/* STATS */}
            <div className="flex gap-6 md:gap-8 bg-muted/30 p-4 rounded-xl border shrink-0">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalTrips}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Viaggi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalCountries}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Paesi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{badges.length}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Badge</div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN: Trips List */}
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Diario di Viaggio
                </h2>
                {trips.length === 0 ? (
                  <div className="text-center py-12 border rounded-xl border-dashed bg-muted/10">
                    <p className="text-muted-foreground">Nessun viaggio pubblico visibile.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {trips.map((trip) => (
                      <Link key={trip.id} to={`/share/${trip.id}`} className="block group">
                        <Card className="h-full overflow-hidden hover:shadow-md transition-all group-hover:-translate-y-1 border-border/60">
                          <div className="h-40 overflow-hidden bg-muted relative">
                            {trip.cover_image ? (
                              <img src={trip.cover_image} alt={trip.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
                            )}
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                              {new Date(trip.start_date).getFullYear()}
                            </div>
                            {trip.status === 'upcoming' && (
                               <div className="absolute bottom-2 left-2 bg-blue-500/90 text-white text-xs px-2 py-0.5 rounded backdrop-blur-sm">
                                 In Arrivo
                               </div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold truncate text-lg mb-1">{trip.title}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" /> {trip.destination}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Badges */}
            <div className="space-y-8">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Badge ({badges.filter(b => b.unlocked).length}/{badges.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {badges.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                        <Trophy className="w-6 h-6 text-muted-foreground/40" />
                      </div>
                      <p className="text-sm text-muted-foreground">Nessun badge disponibile.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {badges.map((badge: any) => {
                        const Icon = getBadgeIcon(badge.icon);
                        return (
                          <div 
                            key={badge.id} 
                            className={cn(
                              "flex flex-col items-center text-center p-3 rounded-xl border transition-all relative overflow-hidden",
                              badge.unlocked 
                                ? cn("bg-card/50 hover:bg-muted/50 hover:scale-[1.02]", badge.bgGradient && `bg-gradient-to-br ${badge.bgGradient}`)
                                : "bg-muted/30 grayscale opacity-60 border-dashed"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-sm",
                              badge.unlocked ? cn("bg-white/80", badge.color) : "bg-muted text-muted-foreground"
                            )}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold leading-tight line-clamp-1">{badge.name}</span>
                            <span className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-tight opacity-80">{badge.description}</span>
                            
                            {!badge.unlocked && (
                              <div className="mt-2 w-full bg-muted-foreground/20 h-1 rounded-full overflow-hidden">
                                <div 
                                  className="bg-primary/50 h-full" 
                                  style={{ width: `${Math.min(100, ((badge.progress || 0) / (badge.maxProgress || 1)) * 100)}%` }} 
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}