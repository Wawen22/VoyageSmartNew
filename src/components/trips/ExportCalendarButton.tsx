
import { useState } from "react";
import { Calendar, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { generateICS, downloadICS } from "@/utils/calendarExport";
import { useToast } from "@/hooks/use-toast";
import { parseISO, setHours, setMinutes } from "date-fns";

interface ExportCalendarButtonProps {
  tripId: string;
  tripTitle: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ExportCalendarButton({
  tripId,
  tripTitle,
  variant = "outline",
  size = "default",
  className
}: ExportCalendarButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // 1. Fetch Data
      const [activitiesRes, accommodationsRes, transportsRes] = await Promise.all([
        supabase.from("itinerary_activities").select("*").eq("trip_id", tripId),
        supabase.from("accommodations").select("*").eq("trip_id", tripId),
        supabase.from("transports").select("*").eq("trip_id", tripId),
      ]);

      if (activitiesRes.error) throw activitiesRes.error;
      if (accommodationsRes.error) throw accommodationsRes.error;
      if (transportsRes.error) throw transportsRes.error;

      const events: any[] = [];

      // 2. Map Activities
      activitiesRes.data.forEach((activity) => {
        let start = parseISO(activity.activity_date);
        let end = undefined;
        let allDay = true;

        if (activity.start_time) {
          const [hours, minutes] = activity.start_time.split(":").map(Number);
          start = setMinutes(setHours(start, hours), minutes);
          allDay = false;

          if (activity.end_time) {
            const [endHours, endMinutes] = activity.end_time.split(":").map(Number);
            end = setMinutes(setHours(parseISO(activity.activity_date), endHours), endMinutes);
          }
        }

        events.push({
          title: activity.title,
          description: activity.description || activity.notes || "",
          location: activity.location || "",
          start,
          end,
          allDay,
        });
      });

      // 3. Map Transports
      transportsRes.data.forEach((transport) => {
        events.push({
          title: `Trasporto: ${transport.departure_location} -> ${transport.arrival_location}`,
          description: `Tipo: ${transport.transport_type}\nCarrier: ${transport.carrier || 'N/A'}\nRef: ${transport.booking_reference || 'N/A'}`,
          location: transport.departure_location,
          start: parseISO(transport.departure_datetime),
          end: transport.arrival_datetime ? parseISO(transport.arrival_datetime) : undefined,
          allDay: false,
        });
      });

      // 4. Map Accommodations
      accommodationsRes.data.forEach((acc) => {
        // Check-in event
        let checkInDate = parseISO(acc.check_in);
        if (acc.check_in_time) {
          const [h, m] = acc.check_in_time.split(":").map(Number);
          checkInDate = setMinutes(setHours(checkInDate, h), m);
        } else {
          // Default checkin 15:00
          checkInDate = setMinutes(setHours(checkInDate, 15), 0);
        }

        events.push({
          title: `Check-in: ${acc.name}`,
          description: `Indirizzo: ${acc.address || 'N/A'}\nRef: ${acc.booking_reference || 'N/A'}`,
          location: acc.address || "",
          start: checkInDate,
          allDay: false, // Specific time helps for travel planning
        });

        // Check-out event
        let checkOutDate = parseISO(acc.check_out);
        if (acc.check_out_time) {
          const [h, m] = acc.check_out_time.split(":").map(Number);
          checkOutDate = setMinutes(setHours(checkOutDate, h), m);
        } else {
          // Default checkout 11:00
          checkOutDate = setMinutes(setHours(checkOutDate, 11), 0);
        }

        events.push({
          title: `Check-out: ${acc.name}`,
          location: acc.address || "",
          start: checkOutDate,
          allDay: false,
        });
      });

      // 5. Generate & Download
      const icsContent = generateICS(tripTitle, events);
      downloadICS(tripTitle.replace(/\s+/g, "_"), icsContent);

      toast({
        title: "Calendario esportato",
        description: "Il file .ics è stato scaricato.",
      });

    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Errore",
        description: "Impossibile esportare il calendario.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant={variant} size={size} className={className} onClick={handleExport} disabled={isExporting}>
      {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
      {size !== "icon" && "Esporta Calendario"}
    </Button>
  );
}
