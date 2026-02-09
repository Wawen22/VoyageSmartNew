
export const TRIP_TOOLS = [
  {
    name: "add_expense",
    description: "Aggiungi una nuova spesa al budget del viaggio. Usalo quando l'utente vuole registrare un costo.",
    parameters: {
      type: "OBJECT",
      properties: {
        description: { 
          type: "STRING", 
          description: "Descrizione di cosa è stato acquistato (es. 'Cena', 'Taxi')" 
        },
        amount: { 
          type: "NUMBER", 
          description: "L'importo della spesa" 
        },
        currency: { 
          type: "STRING", 
          description: "Codice valuta (es. EUR, USD). Se non specificato, assumi EUR.",
        }
      },
      required: ["description", "amount"]
    }
  },
  {
    name: "add_activity",
    description: "Aggiungi una nuova attività o tappa all'itinerario del viaggio.",
    parameters: {
      type: "OBJECT",
      properties: {
        title: { 
          type: "STRING", 
          description: "Titolo dell'attività (es. 'Visita al Colosseo')" 
        },
        date: { 
          type: "STRING", 
          description: "Data dell'attività nel formato YYYY-MM-DD. Se l'utente dice 'domani', calcola la data basandoti sulla data odierna." 
        },
        time: { 
          type: "STRING", 
          description: "Orario opzionale nel formato HH:MM" 
        },
        category: {
          type: "STRING",
          description: "Categoria: activity, food, sightseeing, entertainment",
          enum: ["activity", "food", "sightseeing", "entertainment"]
        }
      },
      required: ["title"]
    }
  },
  {
    name: "add_transport",
    description: "Aggiungi un nuovo trasporto (volo, treno, bus, ecc.) all'itinerario.",
    parameters: {
      type: "OBJECT",
      properties: {
        type: { 
          type: "STRING", 
          description: "Tipo di trasporto (flight, train, bus, car, ship, public, taxi, other)",
          enum: ["flight", "train", "bus", "car", "ship", "public", "taxi", "other"]
        },
        departure_location: { type: "STRING", description: "Luogo di partenza" },
        arrival_location: { type: "STRING", description: "Luogo di arrivo" },
        departure_date: { type: "STRING", description: "Data/Ora partenza (ISO 8601 o YYYY-MM-DD HH:mm)" },
        arrival_date: { type: "STRING", description: "Data/Ora arrivo (ISO 8601 o YYYY-MM-DD HH:mm)" },
        price: { type: "NUMBER", description: "Costo del biglietto (opzionale)" },
        stops: { type: "STRING", description: "Elenco scali o dettagli intermedi (es. 'Scalo a Dubai 2h', 'Via Londra')" }
      },
      required: ["type", "departure_location", "arrival_location", "departure_date"]
    }
  },
  {
    name: "add_accommodation",
    description: "Aggiungi un alloggio (hotel, airbnb, ecc.) al viaggio.",
    parameters: {
      type: "OBJECT",
      properties: {
        name: { type: "STRING", description: "Nome dell'hotel o alloggio" },
        address: { type: "STRING", description: "Indirizzo (opzionale)" },
        check_in: { type: "STRING", description: "Data Check-in (YYYY-MM-DD)" },
        check_out: { type: "STRING", description: "Data Check-out (YYYY-MM-DD)" },
        price: { type: "NUMBER", description: "Costo totale (opzionale)" }
      },
      required: ["name", "check_in", "check_out"]
    }
  },
  {
    name: "add_idea",
    description: "Salva un'idea, appunto o suggerimento generale per il viaggio.",
    parameters: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING", description: "Titolo dell'idea" },
        content: { type: "STRING", description: "Dettagli o descrizione dell'idea" },
        category: { 
          type: "STRING", 
          description: "Categoria (food, activity, accommodation, transport, other)",
          enum: ["food", "activity", "accommodation", "transport", "other"]
        }
      },
      required: ["title", "content"]
    }
  },
  {
    name: "create_checklist_items",
    description: "Crea una lista di oggetti da portare (packing list) nella checklist.",
    parameters: {
      type: "OBJECT",
      properties: {
        items: {
          type: "ARRAY",
          description: "Lista degli oggetti da aggiungere",
          items: { type: "STRING" }
        },
        is_personal: {
          type: "BOOLEAN",
          description: "Se true, aggiunge alla checklist personale. Se false, a quella di gruppo. Default: true"
        }
      },
      required: ["items"]
    }
  },
  {
    name: "extract_trip_data",
    description: "Estrae dati strutturati da un documento di viaggio (PDF, immagine, email).",
    parameters: {
      type: "OBJECT",
      properties: {
        entity_type: {
          type: "STRING",
          description: "Tipo di entità trovata",
          enum: ["transport", "accommodation", "activity", "expense"]
        },
        data: {
          type: "OBJECT",
          description: "Dati estratti specifici per il tipo",
          properties: {
            title: { type: "STRING", description: "Titolo o nome (es. Volo Ryanair FR123, Hotel Roma)" },
            date: { type: "STRING", description: "Data principale (YYYY-MM-DD)" },
            time: { type: "STRING", description: "Orario principale (HH:MM)" },
            end_date: { type: "STRING", description: "Data fine per hotel (YYYY-MM-DD)" },
            location: { type: "STRING", description: "Luogo (partenza/arrivo o indirizzo)" },
            price: { type: "NUMBER", description: "Costo totale" },
            currency: { type: "STRING", description: "Valuta (EUR, USD...)" },
            details: { type: "STRING", description: "Altri dettagli utili (PNR, posti, note)" }
          }
        }
      },
      required: ["entity_type", "data"]
    }
  }
];
