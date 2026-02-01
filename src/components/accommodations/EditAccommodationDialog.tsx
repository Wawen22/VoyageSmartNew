import { useEffect, useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarIcon, Building2, Pencil } from "lucide-react";
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
import type { Accommodation, UpdateAccommodationData } from "@/hooks/useAccommodations";

interface EditAccommodationDialogProps {
  accommodation: Accommodation;
  onUpdate: (data: UpdateAccommodationData) => Promise<boolean>;
}

export function EditAccommodationDialog({
  accommodation,
  onUpdate,
}: EditAccommodationDialogProps) {
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

  useEffect(() => {
    if (!open) return;

    setName(accommodation.name || "");
    setAddress(accommodation.address || "");
    setCheckIn(accommodation.check_in ? new Date(accommodation.check_in) : undefined);
    setCheckOut(accommodation.check_out ? new Date(accommodation.check_out) : undefined);
    setCheckInTime(accommodation.check_in_time || "");
    setCheckOutTime(accommodation.check_out_time || "");
    setPrice(accommodation.price !== null ? accommodation.price.toString() : "");
    setBookingReference(accommodation.booking_reference || "");
    setBookingUrl(accommodation.booking_url || "");
    setNotes(accommodation.notes || "");
    setDocumentUrl(accommodation.document_url || null);
  }, [open, accommodation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !checkIn || !checkOut) return;

    setLoading(true);
    try {
      const success = await onUpdate({
        id: accommodation.id,
        name,
        address: address || null,
        check_in: format(checkIn, "yyyy-MM-dd"),
        check_out: format(checkOut, "yyyy-MM-dd"),
        check_in_time: checkInTime || null,
        check_out_time: checkOutTime || null,
        price: price ? parseFloat(price) : null,
        booking_reference: bookingReference || null,
        booking_url: bookingUrl || null,
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
        <Button variant="ghost" size="icon" aria-label="Modifica alloggio">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Modifica Alloggio
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome struttura *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Hotel Roma Centro"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-address">Indirizzo</Label>
            <Input
              id="edit-address"
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
                    disabled={(date) => (checkIn ? date < checkIn : false)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-checkInTime">Orario check-in</Label>
              <Input
                id="edit-checkInTime"
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-checkOutTime">Orario check-out</Label>
              <Input
                id="edit-checkOutTime"
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Prezzo totale (€)</Label>
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
            <Label htmlFor="edit-bookingUrl">Link prenotazione</Label>
            <Input
              id="edit-bookingUrl"
              type="url"
              value={bookingUrl}
              onChange={(e) => setBookingUrl(e.target.value)}
              placeholder="https://..."
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
            tripId={accommodation.trip_id}
            folder="accommodations"
            label="Documento (conferma prenotazione)"
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !name || !checkIn || !checkOut}
          >
            {loading ? "Salvataggio in corso..." : "Salva modifiche"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
