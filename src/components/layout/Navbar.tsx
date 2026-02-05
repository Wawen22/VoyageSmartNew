import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ToolsDialog } from "@/components/tools/ToolsDialog";
import { 
  Menu, 
  Plane,
  MapPin, 
  Wallet,
  Building2,
  Car,
  Calendar,
  Lightbulb,
  MessageCircle,
  Shield,
  User,
  Sparkles,
  PocketKnife,
  LogOut
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ChecklistButton } from "@/components/checklist/ChecklistButton";
import { useUnreadChat } from "@/hooks/useUnreadChat";
import { useProfile } from "@/hooks/useProfile";
import { useAdmin } from "@/hooks/useAdmin";
import { useTripStats } from "@/hooks/useTripStats";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const navLinks = [
  { id: "trips", href: "/trips", label: "Miei Viaggi", icon: MapPin, tripScoped: false },
  { id: "itinerary", href: "/itinerary", label: "Itinerario", icon: Calendar, tripScoped: true },
  { id: "expenses", href: "/expenses", label: "Spese", icon: Wallet, tripScoped: true },
  { id: "accommodations", href: "/accommodations", label: "Alloggi", icon: Building2, tripScoped: true },
  { id: "transports", href: "/transports", label: "Trasporti", icon: Plane, tripScoped: true },
  { id: "ideas", href: "/ideas", label: "Idee", icon: Lightbulb, tripScoped: true },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { isAdmin } = useAdmin();
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tripDetailLinks = new Set([
    "/itinerary",
    "/expenses",
    "/accommodations",
    "/transports",
    "/ideas",
  ]);
  const searchParams = new URLSearchParams(location.search);
  const tripIdFromQuery = searchParams.get("trip");
  const tripIdFromPath = location.pathname.startsWith("/trips/")
    ? location.pathname.split("/")[2]
    : null;
  const activeTripId =
    tripIdFromQuery || (tripIdFromPath && tripIdFromPath !== "new" ? tripIdFromPath : null);

  const unreadCount = useUnreadChat(activeTripId);
  const stats = useTripStats(activeTripId || undefined);

  const getLinkCount = (id: string) => {
    if (!activeTripId || stats.isLoading) return null;
    switch (id) {
      case "itinerary": return stats.activitiesCount;
      case "expenses": return stats.expensesCount;
      case "accommodations": return stats.accommodationsCount;
      case "transports": return stats.transportsCount;
      case "ideas": return stats.ideasCount;
      default: return null;
    }
  };

  const navLinksWithTrip = navLinks.map((link) => {
    if (!tripDetailLinks.has(link.href)) return link;
    if (!activeTripId) {
      return { ...link, href: "/trips" };
    }
    return { ...link, href: `${link.href}?trip=${activeTripId}` };
  });
  
  const visibleNavLinks = !user 
    ? []
    : activeTripId
    ? navLinksWithTrip
    : navLinksWithTrip.filter((link) => !link.tripScoped);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setIsOpen(false);
  };

  const subscriptionLabel = "Il mio Abbonamento";

  const handleSubscriptionNav = (closeMobileMenu = false) => {
    if (closeMobileMenu) setIsOpen(false);
    const targetHash = "#subscription";
    const targetPath = "/profile";
    const targetUrl = `${targetPath}${targetHash}`;

    if (location.pathname === targetPath) {
      if (location.hash !== targetHash) {
        navigate(targetUrl);
      }
      window.setTimeout(() => {
        const target = document.getElementById("subscription-section");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 0);
      return;
    }

    navigate(targetUrl);
  };

  const chatHref = activeTripId ? `/chat?trip=${activeTripId}` : "/chat";

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/60 shadow-sm py-0"
          : "bg-transparent py-2"
      }`}>
        <div className="w-full px-4 lg:px-12 xl:px-16">
          <nav className="flex items-center h-16 lg:h-20 gap-4 lg:gap-0">
            
            {/* Mobile Hamburger (Left) */}
            {user && (
              <div className="lg:hidden flex items-center gap-2">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <button
                      className="p-2 rounded-xl transition-colors text-foreground hover:bg-muted/70"
                    >
                      <Menu className="w-6 h-6" />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[90%] sm:w-[350px] flex flex-col h-full p-0 border-r border-border/60">
                    <div className="flex flex-col h-full bg-background/95 backdrop-blur-xl">
                    
                    {/* Drawer Header / Top Links */}
                    <div className="flex-1 overflow-y-auto py-6 px-4">
                      {/* Logo in Drawer */}
                      <div className="flex items-center gap-3 mb-8 pl-2">
                        <img src="/logo-voyage_smart.png" alt="VoyageSmart" className="w-10 h-10 object-contain" />
                        <span className="text-xl font-bold italic tracking-tight text-[#735324]">VoyageSmart</span>
                      </div>

                      <div className="space-y-1">
                        {visibleNavLinks.map((link) => {
                          const linkPath = link.href.split("?")[0];
                          const isActive = location.pathname === linkPath;
                          const count = getLinkCount(link.id);
                          
                          return (
                            <Link
                              key={link.id}
                              to={link.href}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                                isActive
                                  ? "text-primary bg-primary/10"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              }`}
                            >
                              <div className="relative">
                                <link.icon className="w-5 h-5" />
                                {isActive && (
                                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                                )}
                              </div>
                              {link.label}
                              {count !== null && count > 0 && (
                                <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
                                  isActive 
                                    ? "bg-primary text-primary-foreground" 
                                    : "bg-muted text-muted-foreground"
                                }`}>
                                  {count}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>

                      {/* Strumenti & Utility - Modern Card Version */}
                      {user && (
                        <div className="mt-8 px-1">
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              setIsToolsOpen(true);
                            }}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 hover:border-indigo-500/30 hover:bg-indigo-500/10 transition-all text-left group relative overflow-hidden"
                          >
                            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                              <PocketKnife className="w-16 h-16 text-indigo-500" />
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 group-hover:rotate-12 transition-transform relative z-10">
                              <PocketKnife className="w-5 h-5" />
                            </div>
                            <div className="relative z-10">
                              <p className="text-sm font-bold text-foreground">Strumenti & Utility</p>
                              <p className="text-[11px] text-muted-foreground">Traduttore, Valuta e Toolkit</p>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Drawer Footer */}
                    {user && (
                      <div className="p-4 border-t border-border/40 space-y-2 bg-muted/20">
                        {isAdmin && (
                          <SheetClose asChild>
                            <Link to="/admin/promo-codes">
                              <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-muted-foreground hover:text-foreground">
                                <Shield className="w-5 h-5" />
                                Pannello Admin
                              </Button>
                            </Link>
                          </SheetClose>
                        )}
                        
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 h-12 text-primary hover:text-primary/80 hover:bg-primary/5"
                          onClick={() => handleSubscriptionNav(true)}
                        >
                          <Sparkles className="w-5 h-5" />
                          {subscriptionLabel}
                        </Button>

                        <div className="pt-2">
                           <Link to="/profile" onClick={() => setIsOpen(false)}>
                            <div className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
                              <div className="relative">
                                <Avatar className="w-12 h-12 border border-border/50">
                                  <AvatarImage src={profile?.avatar_url || ""} />
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {(profile?.full_name || user?.email)?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                {profile?.is_pro ? (
                                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[8px] font-bold px-1 rounded-full border border-background">PRO</div>
                                ) : (
                                  <div className="absolute -top-1 -right-1 bg-slate-200 text-slate-600 text-[8px] font-bold px-1 rounded-full border border-background">FREE</div>
                                )}
                              </div>
                              <div className="flex flex-col flex-1 overflow-hidden">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold truncate text-foreground">
                                    {profile?.full_name || "Il mio Profilo"}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground truncate">
                                  {user?.email}
                                </span>
                              </div>
                              <div className="text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    )}
                     {!user && (
                        <div className="p-4 border-t border-border/40 space-y-3 bg-muted/20">
                            <Link to="/auth" onClick={() => setIsOpen(false)}>
                              <Button variant="authLoginDark" className="w-full h-12 rounded-xl">Accedi</Button>
                            </Link>
                            <Link to="/auth?signup=true" onClick={() => setIsOpen(false)}>
                              <Button variant="authCta" className="w-full h-12 rounded-xl">Inizia Ora</Button>
                            </Link>
                        </div>
                     )}
                  </div>
                </SheetContent>
              </Sheet>

              {user && !profile?.is_pro && (
                <Button
                  onClick={() => handleSubscriptionNav()}
                  size="sm"
                  className="h-8 px-3 text-[10px] font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 shadow-sm hover:shadow-md hover:opacity-90 transition-all rounded-full gap-1.5"
                >
                  <Sparkles className="w-3 h-3 fill-white/20" />
                  UPGRADE
                </Button>
                              )}
                            </div>
                          )}
              
                          {/* Logo (Center on Mobile? Or Left after Hamburger? I'll keep it left-aligned but flexible) */}            <Link 
              to={user ? "/trips" : "/"} 
              className="flex items-center gap-3 group py-1 lg:py-0 mr-auto lg:mr-0"
            >
              <img 
                src="/logo-voyage_smart.png" 
                alt="VoyageSmart Logo" 
                className="w-10 h-10 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-contain transition-transform duration-300 group-hover:scale-105" 
              />
              <span className="hidden md:inline text-xl md:text-2xl font-sans font-bold italic tracking-tight text-3d-modern transition-colors text-[#735324]">
                VoyageSmart
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center justify-center flex-1 px-8 gap-1">
              {visibleNavLinks.filter(link => link.id !== "trips").map((link) => {
                const linkPath = link.href.split("?")[0];
                const isActive = location.pathname === linkPath;
                const count = getLinkCount(link.id);

                return (
                  <Link
                    key={link.id}
                    to={link.href}
                    className={`px-4 py-2 rounded-full font-medium transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                    }`}
                  >
                    <div className="relative">
                       <link.icon className="w-4 h-4" />
                       {isActive && (
                          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                       )}
                    </div>
                    {link.label}
                    {count !== null && count > 0 && (
                      <span className={`ml-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold leading-none shadow-sm transition-all ${
                        isActive 
                          ? "bg-primary text-primary-foreground border border-primary/20" 
                          : "bg-muted text-muted-foreground border border-border/50"
                      }`}>
                        {count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              {user ? (
                <>
                  <ChecklistButton />
                  
                  <button
                    onClick={() => setIsToolsOpen(true)}
                    className="p-2 rounded-full transition-colors relative group text-foreground hover:bg-muted/70"
                    title="Strumenti & Utility"
                  >
                    <PocketKnife className="w-5 h-5" />
                  </button>

                  <NotificationBell />
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors outline-none cursor-pointer bg-muted/70 hover:bg-muted">
                        <Avatar className="w-6 h-6 border-none">
                          <AvatarImage src={profile?.avatar_url || ""} />
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {(profile?.full_name || user?.email)?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-foreground">
                          {profile?.full_name || user?.email?.split("@")[0]}
                        </span>
                        {profile?.is_pro ? (
                          <Badge className="h-5 px-1.5 text-[9px] bg-gradient-to-r from-indigo-500 to-purple-500 border-0 shadow-sm text-white hover:opacity-90">PRO</Badge>
                        ) : (
                          <Badge variant="secondary" className="h-5 px-1.5 text-[9px] bg-slate-200 text-slate-600 hover:bg-slate-300 border-0">FREE</Badge>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Il mio account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/trips" className="cursor-pointer flex items-center w-full">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span>Miei Viaggi</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer flex items-center w-full">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profilo</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => handleSubscriptionNav()}
                        className="cursor-pointer flex items-center w-full text-primary focus:text-primary"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        <span>{subscriptionLabel}</span>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link to="/admin/promo-codes" className="cursor-pointer flex items-center w-full">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Admin</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600 flex items-center w-full">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Esci</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button
                      variant="authLoginDark"
                      size="sm"
                      className="rounded-full px-5"
                    >
                      Accedi
                    </Button>
                  </Link>
                  <Link to="/auth?signup=true">
                    <Button
                      variant="authCta"
                      size="sm"
                      className="rounded-full px-5"
                    >
                      Inizia Ora
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Actions (Right Side) */}
            <div className="flex lg:hidden items-center gap-1 ml-auto">
              {user && (
                <>
                   {/* Checklist */}
                   {activeTripId && <ChecklistButton />}
                   
                   {/* Chat */}
                   <Link to={chatHref} className="p-2 rounded-xl transition-colors relative text-foreground hover:bg-muted/70">
                      <MessageCircle className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background" />
                      )}
                   </Link>

                   {/* Notifications */}
                   <NotificationBell />
                </>
              )}
              
              {!user && (
                <div className="flex items-center gap-2">
                  <Link to="/auth">
                    <Button
                      variant="authLoginDark"
                      size="sm"
                      className="rounded-full px-4 h-9 text-xs"
                    >
                      Accedi
                    </Button>
                  </Link>
                  <Link to="/auth?signup=true">
                    <Button
                      variant="authCta"
                      size="sm"
                      className="rounded-full px-4 h-9 text-xs"
                    >
                      Inizia Ora
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
      <ToolsDialog open={isToolsOpen} onOpenChange={setIsToolsOpen} />
    </>
  );
}