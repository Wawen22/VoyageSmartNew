import {
  format
} from "date-fns";

interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
}

const formatDateICS = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};

const formatAllDayICS = (date: Date): string => {
  return format(date, "yyyyMMdd");
};

export const generateICS = (tripTitle: string, events: CalendarEvent[]): string => {
  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VoyageSmart//VoyageSmart Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${tripTitle} - VoyageSmart`,
  ];

  events.forEach((event) => {
    const uid = crypto.randomUUID();
    const dtStamp = formatDateICS(new Date());
    
    icsContent.push("BEGIN:VEVENT");
    icsContent.push(`UID:${uid}`);
    icsContent.push(`DTSTAMP:${dtStamp}`);
    icsContent.push(`SUMMARY:${event.title}`);
    
    if (event.description) {
      // Escape newlines and special chars
      const desc = event.description.replace(/\n/g, "\\n").replace(/,/g, "\\,");
      icsContent.push(`DESCRIPTION:${desc}`);
    }
    
    if (event.location) {
      const loc = event.location.replace(/,/g, "\\,");
      icsContent.push(`LOCATION:${loc}`);
    }

    if (event.allDay) {
      icsContent.push(`DTSTART;VALUE=DATE:${formatAllDayICS(event.start)}`);
      // All day events end date is exclusive (next day)
      if (event.end) {
        const nextDay = new Date(event.end);
        nextDay.setDate(nextDay.getDate() + 1);
        icsContent.push(`DTEND;VALUE=DATE:${formatAllDayICS(nextDay)}`);
      } else {
         // Default to 1 day duration
         const nextDay = new Date(event.start);
         nextDay.setDate(nextDay.getDate() + 1);
         icsContent.push(`DTEND;VALUE=DATE:${formatAllDayICS(nextDay)}`);
      }
    } else {
      icsContent.push(`DTSTART:${formatDateICS(event.start)}`);
      if (event.end) {
        icsContent.push(`DTEND:${formatDateICS(event.end)}`);
      } else {
        // Default to 1 hour duration if no end time
        const endDate = new Date(event.start.getTime() + 60 * 60 * 1000);
        icsContent.push(`DTEND:${formatDateICS(endDate)}`);
      }
    }

    icsContent.push("END:VEVENT");
  });

  icsContent.push("END:VCALENDAR");
  return icsContent.join("\r\n");
};

export const downloadICS = (filename: string, content: string) => {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
