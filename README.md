# VoyageSmart - Il Compagno di Viaggio Definitivo 🌍✈️

**VoyageSmart** è l'applicazione web moderna e all-in-one pensata per pianificare, gestire e condividere i tuoi viaggi con facilità e stile. Dimentica fogli di calcolo sparsi, note disordinate e chat di gruppo caotiche: VoyageSmart centralizza tutto in un'unica piattaforma intuitiva e collaborativa.

![VoyageSmart Hero](./src/assets/hero-travel.jpg)

## 🚀 Funzionalità Principali

### 🗺️ Pianificazione & Itinerario
*   **Gestione Viaggi:** Crea viaggi, imposta date, destinazioni e carica immagini di copertina personalizzate.
*   **Itinerario Intelligente:** Organizza le tue giornate con un'interfaccia drag-and-drop. Aggiungi attività, pause e note.
*   **Mappe Interattive:** Visualizza il tuo percorso su mappe dinamiche (basate su Mapbox) con tutti i tuoi stop.

### 💰 Finanze & Budget (Smart Finance)
*   **Tracciamento Spese:** Registra ogni spesa, categorizzala e assegnala a chi l'ha pagata.
*   **Gestione Debiti (Settle Up):** Calcolo automatico di "chi deve a chi" per semplificare i rimborsi a fine viaggio.
*   **Budgeting:** Imposta un budget totale e monitora l'andamento delle spese in tempo reale con grafici chiari.

### 🤝 Collaborazione & Social
*   **Viaggi di Gruppo:** Invita amici e compagni di viaggio tramite email.
*   **Collaborazione Real-time:** Le modifiche sono sincronizzate istantaneamente per tutti i partecipanti.
*   **Condivisione Pubblica:** Condividi il link del tuo viaggio con chi è rimasto a casa tramite una vista "solo lettura".

### 🎒 Organizzazione
*   **Alloggi & Trasporti:** Tieni traccia di hotel, voli, treni e noleggi in sezioni dedicate.
*   **Documenti:** Carica e archivia biglietti, prenotazioni e documenti importanti in cloud.
*   **Checklist:** Liste condivise per non dimenticare nulla a casa.

### 🏆 Gamification & Profilo (Novità!)
*   **Passaporto Digitale:** Un profilo utente arricchito che mostra statistiche di viaggio (km percorsi, paesi visitati).
*   **Collezione Badge:** Sblocca obiettivi come "Globetrotter" o "Weekend Warrior" viaggiando di più.
*   **Mappa dei Timbri:** Visualizza le bandiere di tutti i paesi che hai visitato.

## 🛠️ Tecnologie Utilizzate

Il progetto è costruito con uno stack moderno per garantire performance, scalabilità e un'ottima esperienza sviluppatore.

*   **Frontend:** [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
*   **UI/UX:** [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/ui](https://ui.shadcn.com/) + [Framer Motion](https://www.framer.com/motion/)
*   **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Realtime)
*   **Mappe:** [Mapbox GL JS](https://www.mapbox.com/)
*   **Grafici:** [Recharts](https://recharts.org/)
*   **Gestione Date:** [date-fns](https://date-fns.org/)
*   **Export:** Generazione PDF integrata per itinerari e spese.

## 📦 Installazione e Setup

### Prerequisiti
*   Node.js (v18+)
*   Account Supabase
*   Account Mapbox

### 1. Clona la repository
```bash
git clone https://github.com/tuo-username/VoyageSmart.git
cd VoyageSmart
```

### 2. Installa le dipendenze
```bash
npm install
# oppure
bun install
```

### 3. Configura le variabili d'ambiente
Crea un file `.env` nella root del progetto e aggiungi le tue chiavi:

```env
VITE_SUPABASE_URL=la-tua-url-supabase
VITE_SUPABASE_ANON_KEY=la-tua-chiave-anon-supabase
VITE_MAPBOX_TOKEN=il-tuo-token-mapbox
```

### 4. Avvia il server di sviluppo
```bash
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:8080`.

## 🗂️ Struttura del Progetto

```
src/
├── assets/         # Immagini e risorse statiche
├── components/     # Componenti React riutilizzabili (UI, Dashboard, Maps...)
├── hooks/          # Custom Hooks (useAuth, useItinerary, etc.)
├── integrations/   # Configurazione client Supabase
├── lib/            # Utility functions (mapbox, weather, utils)
├── pages/          # Pagine principali dell'applicazione (Router)
├── utils/          # Logica di business (gamification, pdfExport)
└── App.tsx         # Root component e configurazione Routing
```

## 🤝 Contribuire
Siamo aperti a contributi! Se hai idee per nuove funzionalità o hai trovato un bug, apri una issue o invia una pull request. Vedi `FUTURE_ROADMAP.md` per le funzionalità pianificate.

## 📄 Licenza
Questo progetto è distribuito sotto licenza MIT.
