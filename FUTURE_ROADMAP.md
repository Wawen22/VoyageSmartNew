# 🚀 VoyageSmart - Roadmap & Future Implementations

Questo documento raccoglie le idee e le funzionalità pianificate per il futuro sviluppo di VoyageSmart. L'obiettivo è rendere l'app sempre più intelligente, social e indispensabile per ogni viaggiatore.

## 🔥 Priorità Alta

### 1. Gestione Spese Multi-Valuta (Smart Finance) 💱 (✅ Completato)
*   **Stato:** Implementato.
*   **Dettagli:**
    *   Le spese ora possono essere inserite in qualsiasi valuta supportata (USD, GBP, JPY, ecc.).
    *   Conversione automatica in EUR (valuta base) utilizzando i tassi di cambio storici (Frankfurter API).
    *   Visualizzazione duale nelle card delle spese (es. €10.00 (≈ $11.00)).

### 2. Idea Board & Scrapbook Collaborativo 💡 (✅ Completato)
*   **Stato:** Implementato.
*   **Dettagli:**
    *   Bacheca condivisa per ogni viaggio.
    *   Supporto per Note testuali, Link (con anteprima URL) e Foto.
    *   Visualizzazione a griglia responsive.
    *   Ideale per brainstorming e raccolta spunti prima della definizione dell'itinerario.

### 3. Chat di Gruppo Real-time 💬
Centralizzare la comunicazione per eliminare la necessità di gruppi WhatsApp/Telegram separati e dispersivi.
*   **Funzionalità:**
    *   Tab "Chat" dedicata per ogni viaggio.
    *   Supporto messaggi di testo, emoji e reazioni.
    *   **Sondaggi Rapidi:** Feature integrata nella chat per decisioni veloci (es. "Dove ceniamo stasera? [Opzione A] [Opzione B]").
    *   Notifiche push per nuovi messaggi.
*   **Perché:** Tiene tutta l'organizzazione (e le discussioni correlate) in un unico contesto.

### 3. Profilo Pubblico (Social Sharing) 🔗
Espandere il lato social permettendo agli utenti di mostrare il proprio "Passaporto Digitale" al mondo.
*   **Funzionalità:**
    *   Generazione URL univoco (es. `voyagesmart.app/u/mario_rossi`).
    *   Pagina profilo "Read-Only" accessibile pubblicamente.
    *   Visualizzazione statistiche (Paesi, KM), Badge sbloccati e lista viaggi impostati come "Pubblici".
    *   Opzione privacy granulare (Profilo Privato / Solo Amici / Pubblico).
*   **Perché:** Gamification virale e condivisione delle proprie esperienze.

### 4. AI Planner & Generazione Itinerari ✨
Sfruttare l'Intelligenza Artificiale per rimuovere lo stress della pianificazione iniziale.
*   **Funzionalità:**
    *   Wizard iniziale: "Dove vuoi andare? Quanti giorni? Che tipo di viaggio (Relax, Avventura, Cultura)?"
    *   Generazione bozza itinerario completa con attività suggerite divise per giorni.
    *   Suggerimenti intelligenti basati sul meteo o sulla posizione attuale durante il viaggio.
*   **Perché:** "Wow factor" e risparmio di tempo enorme per l'utente.

---

## 📅 Funzionalità Future (Backlog)

### 5. Offline Mode & PWA (Progressive Web App) 📶
I viaggiatori spesso non hanno connessione dati roaming.
*   **Funzionalità:**
    *   Caching locale dei dati del viaggio (itinerario, biglietti, mappe).
    *   Accesso in lettura a tutta l'app senza internet.
    *   Sincronizzazione differita delle modifiche appena si torna online.
    *   Installabile su smartphone come app nativa.

### 6. Galleria Foto Condivisa 📸
Un posto unico per i ricordi, senza perdere qualità su WhatsApp.
*   **Funzionalità:**
    *   Upload foto/video collegati al viaggio.
    *   Visualizzazione su mappa (Geotagging delle foto).
    *   Generazione automatica "Video Ricordo" a fine viaggio.

### 7. Integrazione Calendari Esterni 📅
*   **Funzionalità:**
    *   Sync automatico dell'itinerario su Google Calendar / Apple Calendar / Outlook.
    *   Importazione automatica prenotazioni tramite forward email (più complesso, ma utile).

### 8. Meteo Avanzato & Avvisi ☀️
*   **Funzionalità:**
    *   Previsioni meteo specifiche per ogni tappa dell'itinerario.
    *   Avvisi automatici in caso di pioggia prevista per attività all'aperto, con suggerimento alternative indoor.

### 9. Dark Mode System 🌙
*   **Funzionalità:**
    *   Supporto completo e automatico al tema scuro basato sulle preferenze di sistema (già parzialmente supportato da shadcn, ma da perfezionare su tutte le pagine custom).

### 10. Traduttore & Convertitore Rapido 🧰
*   **Funzionalità:**
    *   Widget flottante in viaggio con:
        *   Convertitore valuta istantaneo.
        *   Traduttore frasi comuni nella lingua locale.
        *   Numeri di emergenza locali (Polizia, Ambulanza) basati sulla posizione.