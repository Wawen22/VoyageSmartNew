
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
  }
];
