import { useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarIcon, Plus, Building2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { DocumentUpload } from "@/components/documents/DocumentUpload";

interface AddAccommodationDialogProps {
  tripId: string;
  onAdd: (data: {
    trip_id: string;
    name: string;
    address?: string;
    check_in: string;
    check_out: string;
    check_in_time?: string;
    check_out_time?: string;
    price?: number;
    booking_reference?: string;
    booking_url?: string;
    notes?: string;
    document_url?: string;
  }) => Promise<boolean>;
}

export function AddAccommodationDialog({ tripId, onAdd }: AddAccommodationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [price, setPrice] = useState("");
  const [bookingReference, setBookingReference] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setAddress("");
    setCheckIn(undefined);
    setCheckOut(undefined);
    setCheckInTime("");
    setCheckOutTime("");
    setPrice("");
    setBookingReference("");
    setBookingUrl("");
    setNotes("");
    setDocumentUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !checkIn || !checkOut) return;

    setLoading(true);
    const success = await onAdd({
      trip_id: tripId,
      name,
      address: address || undefined,
      check_in: format(checkIn, "yyyy-MM-dd"),
      check_out: format(checkOut, "yyyy-MM-dd"),
      check_in_time: checkInTime || undefined,
      check_out_time: checkOutTime || undefined,
      price: price ? parseFloat(price) : undefined,
      booking_reference: bookingReference || undefined,
      booking_url: bookingUrl || undefined,
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
          Aggiungi Alloggio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Nuovo Alloggio
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome struttura *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Hotel Roma Centro"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Indirizzo</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="es. Via Roma 123, Roma"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check-in *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkIn && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkIn ? format(checkIn, "dd MMM", { locale: it }) : "Seleziona"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={setCheckIn}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Check-out *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkOut && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOut ? format(checkOut, "dd MMM", { locale: it }) : "Seleziona"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    disabled={(date) => checkIn ? date < checkIn : false}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkInTime">Orario check-in</Label>
              <Input
                id="checkInTime"
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOutTime">Orario check-out</Label>
              <Input
                id="checkOutTime"
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prezzo totale (€)</Label>
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
            <Label htmlFor="bookingUrl">Link prenotazione</Label>
            <Input
              id="bookingUrl"
              type="url"
              value={bookingUrl}
              onChange={(e) => setBookingUrl(e.target.value)}
              placeholder="https://..."
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
            folder="accommodations"
            label="Documento (conferma prenotazione)"
          />

          <Button type="submit" className="w-full" disabled={loading || !name || !checkIn || !checkOut}>
            {loading ? "Aggiunta in corso..." : "Aggiungi Alloggio"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
