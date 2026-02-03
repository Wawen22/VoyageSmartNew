import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { format, parseISO, differenceInDays, isAfter, isBefore, isToday } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TripHeroWeather } from "@/components/trips/TripHeroWeather";
import { ExportPDFButton } from "@/components/trips/ExportPDFButton";
import { ExportCalendarButton } from "@/components/trips/ExportCalendarButton";
import { ShareTripDialog } from "@/components/trips/ShareTripDialog";
import {
  MapPin,
  Calendar,
  ArrowLeft,
  Clock,
  Plane,
  CheckCircle2,
  MoreHorizontal,
  Sparkles,
  Sun,
  Timer,
  Compass,
  Star,
  Navigation,
} from "lucide-react";
import { useRef } from "react";

interface TripHeroProps {
  trip: {
    id: string;
    title: string;
    destination: string;
    description: string | null;
    start_date: string;
    end_date: string;
    cover_image: string | null;
    status: string;
    is_public_shared: boolean;
    public_share_token: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
  onShareUpdate: () => void;
}

const statusConfig = {
  planning: {
    label: "In Pianificazione",
    icon: Compass,
    color: "text-amber-300",
    bgFill: "rgba(251, 191, 36, 0.2)",
    borderColor: "border-amber-500/30",
  },
  upcoming: {
    label: "Pronto a Partire",
    icon: Plane,
    color: "text-sky-300",
    bgFill: "rgba(56, 189, 248, 0.2)",
    borderColor: "border-sky-500/30",
  },
  completed: {
    label: "Completato",
    icon: CheckCircle2,
    color: "text-emerald-300",
    bgFill: "rgba(52, 211, 153, 0.2)",
    borderColor: "border-emerald-500/30",
  },
};

export function TripHero({ trip, onShareUpdate }: TripHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  // Parallax effects
  const imageY = useTransform(scrollY, [0, 500], [0, 150]);
  const overlayOpacity = useTransform(scrollY, [0, 300], [0.4, 0.75]);
  const contentY = useTransform(scrollY, [0, 300], [0, 50]);
  const contentOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const tripDuration = differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1;
  const status = statusConfig[trip.status as keyof typeof statusConfig] || statusConfig.planning;
  const StatusIcon = status.icon;
  
  // Calculate trip status
  const now = new Date();
  const startDate = parseISO(trip.start_date);
  const endDate = parseISO(trip.end_date);
  const isOngoing = isAfter(now, startDate) && isBefore(now, endDate);
  const isStartingToday = isToday(startDate);
  const daysUntilStart = differenceInDays(startDate, now);

  const getCountdownText = () => {
    if (trip.status === "completed") return "Viaggio completato";
    if (isOngoing) return "In corso ora!";
    if (isStartingToday) return "Si parte oggi!";
    if (daysUntilStart === 1) return "Parte domani";
    if (daysUntilStart > 0) return `Tra ${daysUntilStart} giorni`;
    return "Viaggio passato";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 20,
      },
    },
  };

  return (
    <div ref={heroRef} className="relative w-full overflow-hidden">
      {/* Background Layer with Parallax */}
      <motion.div 
        className="absolute inset-0 h-[440px] md:h-[540px]"
        style={{ y: imageY }}
      >
        {trip.cover_image ? (
          <>
            <img
              src={trip.cover_image}
              alt={trip.title}
              className="w-full h-[120%] object-cover scale-105"
            />
            {/* Enhanced Gradient Overlays */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/90"
              style={{ opacity: overlayOpacity }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent h-[120%]" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-primary/30 to-slate-900 relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/30 rounded-full blur-[100px]" 
              />
              <motion.div 
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/30 rounded-full blur-[100px]" 
              />
            </div>
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNNDAgMEgwdjQwaDQwVjB6TTEgMWgzOHYzOEgxVjF6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4wMyIvPjwvZz48L3N2Zz4=')] opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
        )}
      </motion.div>

      {/* Content Container */}
      <div className="relative h-[440px] md:h-[540px] flex flex-col pt-16 md:pt-20">
        {/* Top Navigation Bar */}
        <motion.div
          className="flex items-center justify-between px-4 md:px-8 py-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-md gap-2 border border-white/15 rounded-full px-4 h-10 shadow-lg shadow-black/10"
          >
            <Link to="/trips">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Torna ai viaggi</span>
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            {/* Weather Widget */}
            {trip.latitude && trip.longitude && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <TripHeroWeather lat={trip.latitude} lon={trip.longitude} />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Main Hero Content */}
        <motion.div 
          className="flex-1 flex flex-col justify-end pb-24 md:pb-32 px-4 md:px-8"
          style={{ y: contentY, opacity: contentOpacity }}
        >
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4 md:space-y-6"
            >
              {/* Status Badges Row */}
              <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 md:gap-3">
                {/* Status Badge */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full",
                    "backdrop-blur-xl border shadow-lg shadow-black/20",
                    status.borderColor
                  )}
                  style={{ background: status.bgFill }}
                >
                  <StatusIcon className={cn("w-4 h-4", status.color)} />
                  <span className={cn("text-xs md:text-sm font-semibold", status.color)}>
                    {status.label}
                  </span>
                </motion.div>

                {/* Duration Badge */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg shadow-black/20"
                >
                  <Timer className="w-4 h-4 text-white/80" />
                  <span className="text-xs md:text-sm font-semibold text-white/95">
                    {tripDuration} {tripDuration === 1 ? "giorno" : "giorni"}
                  </span>
                </motion.div>

                {/* Countdown Badge */}
                {trip.status !== "completed" && (
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className={cn(
                      "inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full",
                      "backdrop-blur-xl border shadow-lg",
                      isOngoing || isStartingToday 
                        ? "bg-emerald-500/20 border-emerald-500/40 shadow-emerald-500/20" 
                        : "bg-primary/20 border-primary/40 shadow-primary/20"
                    )}
                  >
                    <Clock className={cn("w-4 h-4", isOngoing || isStartingToday ? "text-emerald-300" : "text-primary-foreground/80")} />
                    <span className={cn("text-xs md:text-sm font-semibold", isOngoing || isStartingToday ? "text-emerald-200" : "text-primary-foreground/90")}>
                      {getCountdownText()}
                    </span>
                  </motion.div>
                )}

                {/* Public Badge */}
                {trip.is_public_shared && (
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full backdrop-blur-xl bg-violet-500/20 border border-violet-500/40 shadow-lg shadow-violet-500/20"
                  >
                    <Sparkles className="w-4 h-4 text-violet-300" />
                    <span className="text-xs md:text-sm font-semibold text-violet-200">Condiviso</span>
                  </motion.div>
                )}
              </motion.div>

              {/* Title */}
              <motion.div variants={itemVariants}>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tight leading-[1.1] drop-shadow-2xl">
                  {trip.title}
                </h1>
              </motion.div>

              {/* Location & Date Info */}
              <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 md:gap-4">
                {/* Destination Chip */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white/90" />
                  </div>
                  <span className="text-base md:text-lg font-semibold text-white/95">
                    {trip.destination}
                  </span>
                </motion.div>

                {/* Date Chip */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white/90" />
                  </div>
                  <span className="text-base md:text-lg font-semibold text-white/95">
                    {format(parseISO(trip.start_date), "d MMM", { locale: it })} – {format(parseISO(trip.end_date), "d MMM yyyy", { locale: it })}
                  </span>
                </motion.div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 pt-2">
                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-2">
                  <ExportPDFButton
                    tripId={trip.id}
                    tripTitle={trip.title}
                    size="sm"
                    className="h-11 px-5 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-xl rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-white/10 hover:-translate-y-0.5"
                  />
                  <ExportCalendarButton
                    tripId={trip.id}
                    tripTitle={trip.title}
                    size="sm"
                    className="h-11 px-5 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-xl rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-white/10 hover:-translate-y-0.5"
                  />
                </div>

                {/* Share Button - Primary CTA */}
                <ShareTripDialog
                  tripId={trip.id}
                  tripTitle={trip.title}
                  isPublicShared={trip.is_public_shared}
                  publicShareToken={trip.public_share_token}
                  onUpdate={onShareUpdate}
                  className="h-11 px-6 bg-white text-slate-900 hover:bg-white/90 rounded-xl font-bold shadow-xl shadow-white/20 transition-all hover:-translate-y-0.5"
                />

                {/* Mobile Menu */}
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 bg-white/10 text-white hover:bg-white/20 backdrop-blur-xl border border-white/15 rounded-xl"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
                      <ExportPDFButton
                        tripId={trip.id}
                        tripTitle={trip.title}
                        className="w-full justify-start rounded-lg"
                        forceShowLabel
                      />
                      <ExportCalendarButton
                        tripId={trip.id}
                        tripTitle={trip.title}
                        className="w-full justify-start mt-1 rounded-lg"
                        forceShowLabel
                        variant="ghost"
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
