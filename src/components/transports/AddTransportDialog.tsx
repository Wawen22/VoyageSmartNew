import { useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarIcon, Plus, Plane, Train, Bus, Car, Ship, MoreHorizontal } from "lucide-react";
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
import type { TransportType } from "@/hooks/useTransports";

interface AddTransportDialogProps {
  tripId: string;
  onAdd: (data: {
    trip_id: string;
    transport_type: TransportType;
    departure_location: string;
    arrival_location: string;
    departure_datetime: string;
    arrival_datetime?: string;
    booking_reference?: string;
    carrier?: string;
    price?: number;
    notes?: string;
    document_url?: string;
  }) => Promise<boolean>;
}

const TRANSPORT_TYPES = [
  { value: 'flight', label: 'Aereo', icon: Plane },
  { value: 'train', label: 'Treno', icon: Train },
  { value: 'bus', label: 'Bus', icon: Bus },
  { value: 'car', label: 'Auto', icon: Car },
  { value: 'ferry', label: 'Traghetto', icon: Ship },
  { value: 'other', label: 'Altro', icon: MoreHorizontal },
] as const;

export function AddTransportDialog({ tripId, onAdd }: AddTransportDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transportType, setTransportType] = useState<TransportType>('flight');
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

  const resetForm = () => {
    setTransportType('flight');
    setDepartureLocation("");
    setArrivalLocation("");
    setDepartureDate(undefined);
    setDepartureTime("");
    setArrivalDate(undefined);
    setArrivalTime("");
    setCarrier("");
    setBookingReference("");
    setPrice("");
    setNotes("");
    setDocumentUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departureLocation || !arrivalLocation || !departureDate || !departureTime) return;

    const departureDatetime = new Date(departureDate);
    const [depHours, depMinutes] = departureTime.split(':');
    departureDatetime.setHours(parseInt(depHours), parseInt(depMinutes));

    let arrivalDatetime: string | undefined;
    if (arrivalDate && arrivalTime) {
      const arrDate = new Date(arrivalDate);
      const [arrHours, arrMinutes] = arrivalTime.split(':');
      arrDate.setHours(parseInt(arrHours), parseInt(arrMinutes));
      arrivalDatetime = arrDate.toISOString();
    }

    setLoading(true);
    const success = await onAdd({
      trip_id: tripId,
      transport_type: transportType,
      departure_location: departureLocation,
      arrival_location: arrivalLocation,
      departure_datetime: departureDatetime.toISOString(),
      arrival_datetime: arrivalDatetime,
      carrier: carrier || undefined,
      booking_reference: bookingReference || undefined,
      price: price ? parseFloat(price) : undefined,
      notes: notes || undefined,
      document_url: documentUrl || undefined,
    });

    setLoading(false);
    if (success) {
      resetForm();
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Trasporto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Nuovo Trasporto
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
              <Label htmlFor="departure">Partenza *</Label>
              <Input
                id="departure"
                value={departureLocation}
                onChange={(e) => setDepartureLocation(e.target.value)}
                placeholder="es. Roma Fiumicino"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arrival">Arrivo *</Label>
              <Input
                id="arrival"
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
              <Label htmlFor="depTime">Orario partenza *</Label>
              <Input
                id="depTime"
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
                    disabled={(date) => departureDate ? date < departureDate : false}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="arrTime">Orario arrivo</Label>
              <Input
                id="arrTime"
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carrier">Compagnia</Label>
              <Input
                id="carrier"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="es. Ryanair"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bookingRef">Codice prenotazione</Label>
              <Input
                id="bookingRef"
                value={bookingReference}
                onChange={(e) => setBookingReference(e.target.value)}
                placeholder="es. ABC123"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Prezzo (€)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Note</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informazioni aggiuntive..."
              rows={2}
            />
          </div>

          <DocumentUpload
            value={documentUrl}
            onChange={setDocumentUrl}
            tripId={tripId}
            folder="transports"
            label="Documento (biglietto, conferma)"
          />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !departureLocation || !arrivalLocation || !departureDate || !departureTime}
          >
            {loading ? "Aggiunta in corso..." : "Aggiungi Trasporto"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
