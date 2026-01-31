import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Plane, 
  Menu, 
  X, 
  MapPin, 
  Wallet,
  Building2,
  Car,
  Calendar,
  ClipboardList,
  LogOut,
  User,
  Lightbulb,
  MessageCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ChecklistButton } from "@/components/checklist/ChecklistButton";
import { useUnreadChat } from "@/hooks/useUnreadChat";

const navLinks = [
  { href: "/trips", label: "Viaggi", icon: MapPin, tripScoped: false },
  { href: "/itinerary", label: "Itinerario", icon: Calendar, tripScoped: true },
  { href: "/ideas", label: "Idee", icon: Lightbulb, tripScoped: true },
  { href: "/expenses", label: "Spese", icon: Wallet, tripScoped: true },
  { href: "/accommodations", label: "Alloggi", icon: Building2, tripScoped: true },
  { href: "/transports", label: "Trasporti", icon: Car, tripScoped: true },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isLanding = location.pathname === "/";
  const isTripsIndex = location.pathname === "/trips";
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

  const navLinksWithTrip = navLinks.map((link) => {
    if (!tripDetailLinks.has(link.href)) return link;
    if (!activeTripId) {
      return { ...link, href: "/trips" };
    }
    return { ...link, href: `${link.href}?trip=${activeTripId}` };
  });
  const visibleNavLinks = isTripsIndex
    ? navLinksWithTrip.filter((link) => !link.tripScoped)
    : navLinksWithTrip;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isLanding
        ? "bg-transparent"
        : "bg-background/75 backdrop-blur-xl border-b border-border/60 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)]"
    }`}>
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group"
          >
            <div className={`p-2 rounded-xl transition-all duration-300 ${
              isLanding 
                ? "bg-white/10 backdrop-blur-sm group-hover:bg-white/20" 
                : "bg-primary/10 group-hover:bg-primary/15"
            }`}>
              <Plane className={`w-5 h-5 transition-transform group-hover:rotate-12 ${
                isLanding ? "text-white" : "text-primary"
              }`} />
            </div>
            <span className={`text-xl font-bold ${
              isLanding ? "text-white" : "text-foreground"
            }`}>
              VoyageSmart
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {visibleNavLinks.map((link) => {
              const linkPath = link.href.split("?")[0];
              const isActive = location.pathname === linkPath;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-200 flex items-center gap-2 ${
                    isLanding
                      ? "text-white/80 hover:text-white hover:bg-white/10"
                      : isActive
                      ? "text-primary bg-primary/10 shadow-[0_8px_20px_-16px_rgba(59,130,246,0.45)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <ChecklistButton isLanding={isLanding} />
                <NotificationBell isLanding={isLanding} />
                {activeTripId && (
                  <Link to={`/chat?trip=${activeTripId}`}>
                    <div className={`p-2 rounded-full transition-colors relative group ${
                      isLanding ? "text-white hover:bg-white/10" : "text-foreground hover:bg-muted/70"
                    }`}>
                      <MessageCircle className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-in zoom-in">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                      <span className="sr-only">Chat Viaggio</span>
                    </div>
                  </Link>
                )}
                <Link to="/profile">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
                    isLanding ? "bg-white/10 hover:bg-white/20" : "bg-muted/70 hover:bg-muted"
                  }`}>
                    <User className={`w-4 h-4 ${isLanding ? "text-white" : "text-foreground"}`} />
                    <span className={`text-sm font-medium ${isLanding ? "text-white" : "text-foreground"}`}>
                      {user.email?.split("@")[0]}
                    </span>
                  </div>
                </Link>
                <Button 
                  variant={isLanding ? "heroOutline" : "outline"} 
                  size="sm"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant={isLanding ? "heroOutline" : "ghost"} size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth?signup=true">
                  <Button variant={isLanding ? "hero" : "default"} size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-1">
            {user && activeTripId && (
              <Link to={`/chat?trip=${activeTripId}`}>
                <div className={`p-2 rounded-xl transition-colors relative ${
                  isLanding ? "text-white hover:bg-white/10" : "text-foreground hover:bg-muted/70"
                }`}>
                  <MessageCircle className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-in zoom-in">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
              </Link>
            )}
            {user && <ChecklistButton isLanding={isLanding} />}
            {user && <NotificationBell isLanding={isLanding} />}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-xl transition-colors ${
                isLanding 
                  ? "text-white hover:bg-white/10" 
                  : "text-foreground hover:bg-muted/70"
              }`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </div>

          {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border/60"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {visibleNavLinks.map((link) => {
                const linkPath = link.href.split("?")[0];
                const isActive = location.pathname === linkPath;
                return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
                );
              })}
              <div className="pt-4 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setIsOpen(false)}>
                      <div className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors">
                        <User className="w-5 h-5" />
                        <span>{user.email}</span>
                      </div>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth?signup=true" onClick={() => setIsOpen(false)}>
                      <Button variant="default" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
