import { useEffect, useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarIcon, Pencil, Plane, Train, Bus, Car, Ship, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import type { Transport, TransportType, UpdateTransportData } from "@/hooks/useTransports";

interface EditTransportDialogProps {
  transport: Transport;
  onUpdate: (data: UpdateTransportData) => Promise<boolean>;
}

const TRANSPORT_TYPES = [
  { value: "flight", label: "Aereo", icon: Plane },
  { value: "train", label: "Treno", icon: Train },
  { value: "bus", label: "Bus", icon: Bus },
  { value: "car", label: "Auto", icon: Car },
  { value: "ferry", label: "Traghetto", icon: Ship },
  { value: "other", label: "Altro", icon: MoreHorizontal },
] as const;

export function EditTransportDialog({ transport, onUpdate }: EditTransportDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transportType, setTransportType] = useState<TransportType>("flight");
  const [departureLocation, setDepartureLocation] = useState("");
  const [arrivalLocation, setArrivalLocation] = useState("");
  const [departureDate, setDepartureDate] = useState<Date>();
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalDate, setArrivalDate] = useState<Date>();
  const [arrivalTime, setArrivalTime] = useState("");
  const [carrier, setCarrier] = useState("");
  const [bookingReference, setBookingReference] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const depDate = new Date(transport.departure_datetime);
    const arrDate = transport.arrival_datetime ? new Date(transport.arrival_datetime) : null;

    setTransportType(transport.transport_type);
    setDepartureLocation(transport.departure_location || "");
    setArrivalLocation(transport.arrival_location || "");
    setDepartureDate(depDate);
    setDepartureTime(format(depDate, "HH:mm"));
    setArrivalDate(arrDate || undefined);
    setArrivalTime(arrDate ? format(arrDate, "HH:mm") : "");
    setCarrier(transport.carrier || "");
    setBookingReference(transport.booking_reference || "");
    setPrice(transport.price !== null ? transport.price.toString() : "");
    setNotes(transport.notes || "");
    setDocumentUrl(transport.document_url || null);
  }, [open, transport]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departureLocation || !arrivalLocation || !departureDate || !departureTime) return;

    const departureDatetime = new Date(departureDate);
    const [depHours, depMinutes] = departureTime.split(":");
    departureDatetime.setHours(parseInt(depHours), parseInt(depMinutes));

    let arrivalDatetime: string | null = null;
    if (arrivalDate && arrivalTime) {
      const arrDate = new Date(arrivalDate);
      const [arrHours, arrMinutes] = arrivalTime.split(":");
      arrDate.setHours(parseInt(arrHours), parseInt(arrMinutes));
      arrivalDatetime = arrDate.toISOString();
    }

    setLoading(true);
    try {
      const success = await onUpdate({
        id: transport.id,
        transport_type: transportType,
        departure_location: departureLocation,
        arrival_location: arrivalLocation,
        departure_datetime: departureDatetime.toISOString(),
        arrival_datetime: arrivalDatetime,
        carrier: carrier || null,
        booking_reference: bookingReference || null,
        price: price ? parseFloat(price) : null,
        notes: notes || null,
        document_url: documentUrl || null,
      });

      if (success) {
        setOpen(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Modifica trasporto">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Modifica Trasporto
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo di trasporto *</Label>
            <Select value={transportType} onValueChange={(v) => setTransportType(v as TransportType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSPORT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-departure">Partenza *</Label>
              <Input
                id="edit-departure"
                value={departureLocation}
                onChange={(e) => setDepartureLocation(e.target.value)}
                placeholder="es. Roma Fiumicino"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-arrival">Arrivo *</Label>
              <Input
                id="edit-arrival"
                value={arrivalLocation}
                onChange={(e) => setArrivalLocation(e.target.value)}
                placeholder="es. Milano Malpensa"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data partenza *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !departureDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {departureDate ? format(departureDate, "dd MMM", { locale: it }) : "Seleziona"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={departureDate}
                    onSelect={setDepartureDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-depTime">Orario partenza *</Label>
              <Input
                id="edit-depTime"
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data arrivo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !arrivalDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {arrivalDate ? format(arrivalDate, "dd MMM", { locale: it }) : "Seleziona"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={arrivalDate}
                    onSelect={setArrivalDate}
                    disabled={(date) => (departureDate ? date < departureDate : false)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-arrTime">Orario arrivo</Label>
              <Input
                id="edit-arrTime"
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-carrier">Compagnia</Label>
              <Input
                id="edit-carrier"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="es. Ryanair"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-bookingRef">Codice prenotazione</Label>
              <Input
                id="edit-bookingRef"
                value={bookingReference}
                onChange={(e) => setBookingReference(e.target.value)}
                placeholder="es. ABC123"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-price">Prezzo (€)</Label>
            <Input
              id="edit-price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Note</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informazioni aggiuntive..."
              rows={2}
            />
          </div>

          <DocumentUpload
            value={documentUrl}
            onChange={setDocumentUrl}
            tripId={transport.trip_id}
            folder="transports"
            label="Documento (biglietto, conferma)"
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !departureLocation || !arrivalLocation || !departureDate || !departureTime}
          >
            {loading ? "Salvataggio in corso..." : "Salva modifiche"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
