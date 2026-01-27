import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';

// ============= TYPE DEFINITIONS =============

interface TripData {
  id: string;
  title: string;
  destination: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
}

interface Activity {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  activity_date: string;
  start_time: string | null;
  end_time: string | null;
  category: string;
}

interface Accommodation {
  id: string;
  name: string;
  address: string | null;
  check_in: string;
  check_out: string;
  check_in_time: string | null;
  check_out_time: string | null;
  price: number | null;
  currency: string;
  booking_reference: string | null;
}

interface Transport {
  id: string;
  transport_type: string;
  departure_location: string;
  arrival_location: string;
  departure_datetime: string;
  arrival_datetime: string | null;
  carrier: string | null;
  booking_reference: string | null;
  price: number | null;
  currency: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  expense_date: string;
  paid_by_name: string;
}

interface ExportData {
  trip: TripData;
  activities: Activity[];
  accommodations: Accommodation[];
  transports: Transport[];
  expenses: Expense[];
  members: { name: string; role: string }[];
}

export interface PDFSections {
  itinerary: boolean;
  accommodations: boolean;
  transports: boolean;
  expenses: boolean;
}

// ============= DESIGN SYSTEM =============

const COLORS = {
  // Primary palette
  primary: [14, 116, 144] as [number, number, number],      // Deep teal
  primaryLight: [45, 212, 191] as [number, number, number], // Light teal
  secondary: [234, 88, 12] as [number, number, number],     // Coral orange
  accent: [20, 184, 166] as [number, number, number],       // Accent teal
  
  // Semantic colors
  success: [22, 163, 74] as [number, number, number],       // Green
  warning: [234, 179, 8] as [number, number, number],       // Yellow
  
  // Neutrals
  dark: [15, 23, 42] as [number, number, number],           // Slate 900
  text: [51, 65, 85] as [number, number, number],           // Slate 600
  muted: [100, 116, 139] as [number, number, number],       // Slate 500
  light: [241, 245, 249] as [number, number, number],       // Slate 100
  lighter: [248, 250, 252] as [number, number, number],     // Slate 50
  white: [255, 255, 255] as [number, number, number],
  
  // Section specific
  itinerary: [20, 184, 166] as [number, number, number],    // Teal
  accommodations: [234, 88, 12] as [number, number, number], // Orange
  transports: [14, 116, 144] as [number, number, number],   // Primary
  expenses: [22, 163, 74] as [number, number, number],      // Green
};

const LABELS = {
  category: {
    food: 'Cibo & Ristoranti',
    transport: 'Trasporti',
    accommodation: 'Alloggio',
    activities: 'Attivita',
    shopping: 'Shopping',
    other: 'Altro',
  } as Record<string, string>,
  transport: {
    flight: 'Volo',
    train: 'Treno',
    bus: 'Autobus',
    car: 'Auto',
    ferry: 'Traghetto',
    other: 'Altro',
  } as Record<string, string>,
};

// ============= SVG ICONS (embedded as base64) =============

const createSvgDataUri = (svgContent: string): string => {
  const encoded = btoa(unescape(encodeURIComponent(svgContent)));
  return `data:image/svg+xml;base64,${encoded}`;
};

const ICONS = {
  mapPin: createSvgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`),
  calendar: createSvgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`),
  bed: createSvgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>`),
  plane: createSvgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`),
  wallet: createSvgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>`),
  users: createSvgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`),
  clock: createSvgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`),
  location: createSvgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`),
  check: createSvgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`),
  arrowRight: createSvgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0e7490" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`),
};

// ============= MAIN EXPORT FUNCTION =============

export async function generateTripPDF(
  data: ExportData,
  sections: PDFSections = { itinerary: true, accommodations: true, transports: true, expenses: true }
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  // ============= HELPER FUNCTIONS =============

  const checkNewPage = (requiredSpace: number): void => {
    if (currentY + requiredSpace > pageHeight - margin - 10) {
      doc.addPage();
      currentY = margin;
      addPageHeader();
    }
  };

  const addPageHeader = (): void => {
    // Subtle top border
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pageWidth, 2, 'F');
    currentY = 10;
  };

  const drawSectionTitle = (
    title: string,
    subtitle: string,
    icon: string,
    color: [number, number, number]
  ): void => {
    checkNewPage(25);
    
    // Section header with gradient effect
    doc.setFillColor(...color);
    doc.roundedRect(margin, currentY, contentWidth, 16, 3, 3, 'F');
    
    // Icon
    try {
      doc.addImage(icon, 'SVG', margin + 5, currentY + 3, 10, 10);
    } catch (e) {}
    
    // Title
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin + 20, currentY + 10);
    
    // Subtitle on right
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, margin + contentWidth - 5, currentY + 10, { align: 'right' });
    
    currentY += 22;
    doc.setTextColor(...COLORS.dark);
  };

  const drawDivider = (): void => {
    currentY += 3;
    doc.setDrawColor(...COLORS.light);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, margin + contentWidth, currentY);
    currentY += 6;
  };

  // ============= COVER PAGE =============

  // Hero gradient header
  const gradientHeight = 85;
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, gradientHeight, 'F');
  
  // Accent stripe
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, gradientHeight - 4, pageWidth, 4, 'F');
  
  // VoyageSmart branding
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('VOYAGESMART', margin, 15);
  
  // Trip title
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(data.trip.title, contentWidth - 20);
  doc.text(titleLines, pageWidth / 2, 40, { align: 'center' });

  // Destination with icon
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const destWidth = doc.getTextWidth(data.trip.destination);
  try {
    doc.addImage(ICONS.mapPin, 'SVG', pageWidth / 2 - destWidth / 2 - 10, 53, 7, 7);
  } catch (e) {}
  doc.text(data.trip.destination, pageWidth / 2, 60, { align: 'center' });

  // Dates
  const tripStart = parseISO(data.trip.start_date);
  const tripEnd = parseISO(data.trip.end_date);
  const duration = differenceInDays(tripEnd, tripStart) + 1;
  const dateRange = `${format(tripStart, 'd MMMM', { locale: it })} - ${format(tripEnd, 'd MMMM yyyy', { locale: it })}`;
  
  doc.setFontSize(11);
  doc.text(dateRange, pageWidth / 2, 72, { align: 'center' });

  // Content area
  currentY = gradientHeight + 15;

  // Trip info card
  doc.setFillColor(...COLORS.lighter);
  doc.roundedRect(margin, currentY, contentWidth, 28, 3, 3, 'F');
  
  // Duration
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Durata viaggio', margin + 10, currentY + 10);
  
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${duration} giorni`, margin + 10, currentY + 22);
  
  // Date range on right side
  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Date del viaggio', margin + contentWidth - 10, currentY + 10, { align: 'right' });
  
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(10);
  doc.text(dateRange, margin + contentWidth - 10, currentY + 20, { align: 'right' });
  
  currentY += 38;

  // Stats cards
  const stats = [
    { label: 'Attivita', value: data.activities.length, color: COLORS.itinerary, show: sections.itinerary },
    { label: 'Alloggi', value: data.accommodations.length, color: COLORS.accommodations, show: sections.accommodations },
    { label: 'Trasporti', value: data.transports.length, color: COLORS.transports, show: sections.transports },
    { label: 'Spese', value: data.expenses.length, color: COLORS.expenses, show: sections.expenses },
  ].filter(s => s.show);

  if (stats.length > 0) {
    const statWidth = (contentWidth - (stats.length - 1) * 4) / stats.length;
    
    stats.forEach((stat, index) => {
      const x = margin + index * (statWidth + 4);
      
      // Card background
      doc.setFillColor(...stat.color);
      doc.roundedRect(x, currentY, statWidth, 35, 3, 3, 'F');
      
      // Value
      doc.setTextColor(...COLORS.white);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(String(stat.value), x + statWidth / 2, currentY + 18, { align: 'center' });
      
      // Label
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(stat.label, x + statWidth / 2, currentY + 28, { align: 'center' });
    });
    
    currentY += 45;
  }

  // Description
  if (data.trip.description) {
    doc.setFillColor(...COLORS.white);
    doc.setDrawColor(...COLORS.light);
    doc.roundedRect(margin, currentY, contentWidth, 30, 2, 2, 'FD');
    
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(data.trip.description, contentWidth - 14);
    doc.text(descLines.slice(0, 4), margin + 7, currentY + 10);
    
    currentY += 35;
  }

  // Participants
  if (data.members.length > 0) {
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    try {
      doc.addImage(ICONS.users, 'SVG', margin, currentY - 2, 5, 5);
    } catch (e) {}
    doc.text('Partecipanti', margin + 8, currentY + 2);
    
    currentY += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.muted);
    const memberNames = data.members.map(m => m.name).join('  |  ');
    const memberLines = doc.splitTextToSize(memberNames, contentWidth);
    doc.text(memberLines.slice(0, 2), margin, currentY);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text(
    `Documento generato da VoyageSmart  |  ${format(new Date(), "d MMMM yyyy, HH:mm", { locale: it })}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  // ============= ITINERARY SECTION =============

  if (sections.itinerary && data.activities.length > 0) {
    doc.addPage();
    currentY = margin;
    addPageHeader();
    
    drawSectionTitle(
      'Itinerario',
      `${data.activities.length} attivita programmate`,
      ICONS.calendar,
      COLORS.itinerary
    );

    // Group by date
    const byDate = data.activities.reduce((acc, act) => {
      if (!acc[act.activity_date]) acc[act.activity_date] = [];
      acc[act.activity_date].push(act);
      return acc;
    }, {} as Record<string, Activity[]>);

    Object.entries(byDate).forEach(([date, activities]) => {
      checkNewPage(25);
      
      // Date header
      doc.setFillColor(...COLORS.lighter);
      doc.roundedRect(margin, currentY, contentWidth, 10, 2, 2, 'F');
      
      doc.setTextColor(...COLORS.primary);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(format(parseISO(date), 'EEEE d MMMM', { locale: it }).toUpperCase(), margin + 5, currentY + 7);
      
      // Day number badge
      const dayNum = differenceInDays(parseISO(date), tripStart) + 1;
      doc.setFillColor(...COLORS.primary);
      doc.roundedRect(margin + contentWidth - 22, currentY + 1.5, 18, 7, 2, 2, 'F');
      doc.setTextColor(...COLORS.white);
      doc.setFontSize(8);
      doc.text(`Giorno ${dayNum}`, margin + contentWidth - 13, currentY + 6, { align: 'center' });
      
      currentY += 14;

      activities.forEach((activity) => {
        checkNewPage(22);
        
        // Time column
        const hasTime = activity.start_time;
        if (hasTime) {
          doc.setTextColor(...COLORS.muted);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          const timeStr = activity.start_time!.slice(0, 5);
          doc.text(timeStr, margin + 5, currentY + 4);
        }
        
        // Activity content
        const contentX = hasTime ? margin + 25 : margin + 5;
        const contentW = hasTime ? contentWidth - 30 : contentWidth - 10;
        
        // Title
        doc.setTextColor(...COLORS.dark);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(activity.title, contentX, currentY + 4);
        
        let lineY = currentY + 10;
        
        // Location
        if (activity.location) {
          try {
            doc.addImage(ICONS.location, 'SVG', contentX, lineY - 3, 3.5, 3.5);
          } catch (e) {}
          doc.setTextColor(...COLORS.muted);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(activity.location, contentX + 5, lineY);
          lineY += 5;
        }
        
        // Description
        if (activity.description) {
          doc.setTextColor(...COLORS.text);
          doc.setFontSize(9);
          const descLines = doc.splitTextToSize(activity.description, contentW);
          doc.text(descLines.slice(0, 2), contentX, lineY);
          lineY += Math.min(descLines.length, 2) * 4;
        }
        
        currentY = lineY + 6;
        
        // Divider
        doc.setDrawColor(...COLORS.light);
        doc.setLineWidth(0.3);
        doc.line(margin + 5, currentY, margin + contentWidth - 5, currentY);
        currentY += 4;
      });
      
      currentY += 5;
    });
  }

  // ============= ACCOMMODATIONS SECTION =============

  if (sections.accommodations && data.accommodations.length > 0) {
    doc.addPage();
    currentY = margin;
    addPageHeader();
    
    const totalPrice = data.accommodations.reduce((sum, a) => sum + (a.price || 0), 0);
    
    drawSectionTitle(
      'Alloggi',
      totalPrice > 0 ? `Totale: ${totalPrice.toFixed(2)} EUR` : `${data.accommodations.length} prenotazioni`,
      ICONS.bed,
      COLORS.accommodations
    );

    data.accommodations.forEach((acc, index) => {
      checkNewPage(38);
      
      // Card
      doc.setFillColor(...COLORS.lighter);
      doc.roundedRect(margin, currentY, contentWidth, 32, 3, 3, 'F');
      
      // Left accent bar
      doc.setFillColor(...COLORS.accommodations);
      doc.roundedRect(margin, currentY, 3, 32, 1.5, 1.5, 'F');
      
      // Name
      doc.setTextColor(...COLORS.dark);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(acc.name, margin + 10, currentY + 10);
      
      // Address
      if (acc.address) {
        doc.setTextColor(...COLORS.muted);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const addrLines = doc.splitTextToSize(acc.address, contentWidth - 70);
        doc.text(addrLines[0], margin + 10, currentY + 17);
      }
      
      // Dates row
      const checkInDate = format(parseISO(acc.check_in), 'd MMM', { locale: it });
      const checkOutDate = format(parseISO(acc.check_out), 'd MMM', { locale: it });
      
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Check-in: ${checkInDate}`, margin + 10, currentY + 26);
      doc.text(`Check-out: ${checkOutDate}`, margin + 60, currentY + 26);
      
      // Price badge
      if (acc.price) {
        doc.setFillColor(...COLORS.success);
        doc.roundedRect(margin + contentWidth - 45, currentY + 5, 40, 10, 2, 2, 'F');
        doc.setTextColor(...COLORS.white);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${acc.price.toFixed(2)} ${acc.currency}`, margin + contentWidth - 25, currentY + 12, { align: 'center' });
      }
      
      // Booking reference
      if (acc.booking_reference) {
        doc.setTextColor(...COLORS.muted);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Rif: ${acc.booking_reference}`, margin + contentWidth - 45, currentY + 26);
      }
      
      currentY += 38;
    });
  }

  // ============= TRANSPORTS SECTION =============

  if (sections.transports && data.transports.length > 0) {
    doc.addPage();
    currentY = margin;
    addPageHeader();
    
    const totalPrice = data.transports.reduce((sum, t) => sum + (t.price || 0), 0);
    
    drawSectionTitle(
      'Trasporti',
      totalPrice > 0 ? `Totale: ${totalPrice.toFixed(2)} EUR` : `${data.transports.length} spostamenti`,
      ICONS.plane,
      COLORS.transports
    );

    data.transports.forEach((transport) => {
      checkNewPage(40);
      
      // Card background
      doc.setFillColor(...COLORS.white);
      doc.setDrawColor(...COLORS.light);
      doc.roundedRect(margin, currentY, contentWidth, 35, 3, 3, 'FD');
      
      // Type badge
      const typeLabel = LABELS.transport[transport.transport_type] || transport.transport_type;
      doc.setFillColor(...COLORS.primary);
      doc.roundedRect(margin + 5, currentY + 5, 35, 8, 2, 2, 'F');
      doc.setTextColor(...COLORS.white);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(typeLabel.toUpperCase(), margin + 22.5, currentY + 11, { align: 'center' });
      
      // Route
      doc.setTextColor(...COLORS.dark);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      
      const routeY = currentY + 20;
      doc.text(transport.departure_location, margin + 5, routeY);
      
      // Arrow
      try {
        const depWidth = doc.getTextWidth(transport.departure_location);
        doc.addImage(ICONS.arrowRight, 'SVG', margin + 8 + depWidth, routeY - 4, 6, 6);
      } catch (e) {
        doc.text('  -->  ', margin + 5 + doc.getTextWidth(transport.departure_location), routeY);
      }
      
      doc.text(transport.arrival_location, margin + 20 + doc.getTextWidth(transport.departure_location), routeY);
      
      // Date and time
      const depDate = format(parseISO(transport.departure_datetime), "d MMM 'alle' HH:mm", { locale: it });
      doc.setTextColor(...COLORS.muted);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(depDate, margin + 5, currentY + 29);
      
      // Carrier
      if (transport.carrier) {
        doc.text(`| ${transport.carrier}`, margin + 55, currentY + 29);
      }
      
      // Price
      if (transport.price) {
        doc.setTextColor(...COLORS.success);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${transport.price.toFixed(2)} ${transport.currency}`, margin + contentWidth - 5, currentY + 20, { align: 'right' });
      }
      
      currentY += 42;
    });
  }

  // ============= EXPENSES SECTION =============

  if (sections.expenses && data.expenses.length > 0) {
    doc.addPage();
    currentY = margin;
    addPageHeader();
    
    const grandTotal = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    
    drawSectionTitle(
      'Spese',
      `Totale: ${grandTotal.toFixed(2)} EUR`,
      ICONS.wallet,
      COLORS.expenses
    );

    // Category summary chart
    const byCategory = data.expenses.reduce((acc, e) => {
      const cat = e.category || 'other';
      if (!acc[cat]) acc[cat] = 0;
      acc[cat] += e.amount;
      return acc;
    }, {} as Record<string, number>);

    const categories = Object.entries(byCategory)
      .map(([cat, total]) => ({
        label: LABELS.category[cat] || cat,
        total,
        percent: (total / grandTotal) * 100,
      }))
      .sort((a, b) => b.total - a.total);

    // Horizontal bar chart
    const barMaxWidth = contentWidth - 80;
    
    categories.slice(0, 5).forEach((cat, i) => {
      const y = currentY + i * 12;
      
      // Label
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(cat.label, margin + 5, y + 7);
      
      // Bar background
      doc.setFillColor(...COLORS.light);
      doc.roundedRect(margin + 45, y + 2, barMaxWidth, 6, 1, 1, 'F');
      
      // Bar fill
      const barWidth = (cat.percent / 100) * barMaxWidth;
      doc.setFillColor(...COLORS.expenses);
      doc.roundedRect(margin + 45, y + 2, barWidth, 6, 1, 1, 'F');
      
      // Amount
      doc.setTextColor(...COLORS.dark);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${cat.total.toFixed(2)} EUR`, margin + contentWidth - 5, y + 7, { align: 'right' });
    });
    
    currentY += categories.slice(0, 5).length * 12 + 10;
    drawDivider();

    // Expense table
    const tableData = data.expenses.map((e) => [
      format(parseISO(e.expense_date), 'd MMM', { locale: it }),
      e.description.length > 35 ? e.description.slice(0, 35) + '...' : e.description,
      LABELS.category[e.category] || e.category,
      e.paid_by_name,
      `${e.amount.toFixed(2)} EUR`,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Data', 'Descrizione', 'Categoria', 'Pagato da', 'Importo']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.expenses,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 4,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: COLORS.text,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: COLORS.lighter,
      },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 55 },
        2: { cellWidth: 28 },
        3: { cellWidth: 32 },
        4: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
      },
    });

    // Grand total footer
    currentY = (doc as any).lastAutoTable.finalY + 8;
    
    doc.setFillColor(...COLORS.expenses);
    doc.roundedRect(margin, currentY, contentWidth, 14, 3, 3, 'F');
    
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTALE COMPLESSIVO', margin + 10, currentY + 9);
    doc.setFontSize(13);
    doc.text(`${grandTotal.toFixed(2)} EUR`, margin + contentWidth - 10, currentY + 9, { align: 'right' });
  }

  // ============= SAVE PDF =============

  const fileName = `${data.trip.title.replace(/[^a-z0-9]/gi, '_')}_VoyageSmart.pdf`;
  doc.save(fileName);
}
