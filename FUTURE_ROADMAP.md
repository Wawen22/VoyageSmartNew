# 🚀 VoyageSmart - Roadmap & Future Implementations

Questo documento raccoglie le idee e le funzionalità pianificate per il futuro sviluppo di VoyageSmart. L'obiettivo è rendere l'app sempre più intelligente, social e indispensabile per ogni viaggiatore.

## 🔥 Priorità Alta

---

## ✅ Completati

### 1. Chat di Gruppo Real-time 💬 (✅ Completato)
*   **Stato:** Implementato.
*   **Dettagli:**
    *   Chat dedicata per ogni viaggio.
    *   Supporto Realtime con Supabase.
    *   Badge notifiche messaggi non letti nella Navbar.
    *   Visualizzazione Avatar e Nome mittente con tooltip.

### 2. Gestione Spese Multi-Valuta (Smart Finance) 💱 (✅ Completato)
*   **Stato:** Implementato.
*   **Dettagli:**
    *   Input spese in qualsiasi valuta.
    *   Conversione automatica in valuta base.
    *   Grafici di bilancio e gestione debiti/crediti.

### 3. Profilo Pubblico & Gamification (✅ Completato)
*   **Stato:** Implementato.
*   **Dettagli:**
    *   Gestione Avatar utente personalizzato.
    *   Visualizzazione coerente in Navbar e Menu Mobile.
    *   Passaporto Digitale e Mappa dei viaggi.
    *   Sistema di Badge dinamici (Primi Passi, Globetrotter, ecc.) con progress bar.
    *   Statistiche (Km percorsi, Paesi visitati).

### 4. Trip Ideas & Scrapbook Collaborativo 💡 (✅ Completato)
*   **Stato:** Implementato.
*   **Dettagli:**
    *   Bacheca condivisa per note, link e foto.
    *   Sistema di votazione (Like).
    *   Promozione diretta in attività dell'itinerario.

### 5. Commenti sulle Idee 💬 (✅ Completato)
*   **Stato:** Implementato.
*   **Dettagli:**
    *   Discussioni threaded su ogni idea.
    *   Sistema di notifiche per nuovi commenti.
    *   Supporto per risposte annidate.

### 6. Mappa Itinerario Interattiva 🗺️ (✅ Completato)
*   **Stato:** Implementato.
*   **Dettagli:**
    *   Visualizzazione su mappa dei pin giornalieri collegati da linee di percorso.
    *   Calcolo e visualizzazione tempi di percorrenza stimati tra le tappe.
    *   Integrazione con Mapbox GL JS.
    *   Zoom e navigazione interattiva.

---

## 📅 Funzionalità Future (Backlog)

### 1. AI ChatBot Assistente di Viaggio 🤖 (🔄 In Sviluppo)
*   **Stato:** Implementazione base completata.
*   **Prossimi Step:**
    *   **Formattazione Markdown** (✅ Completato): Supporto per liste, grassetto e link.
    *   **Memoria Persistente** (✅ Completato): Salvataggio cronologia chat su database (Supabase) per sessioni multiple.
    *   **Function Calling**: Capacità dell'AI di eseguire azioni (es. "Aggiungi questa spesa") direttamente.
    *   **Rich UI Components**: Visualizzazione di card interattive (Alloggi, Trasporti) direttamente nei messaggi.
*   **Dettagli:**
    *   Chatbot AI integrato che prende in contesto i dettagli del viaggio.
    *   Risposte personalizzate basate sul contesto del viaggio specifico.
    *   Supporto multi-provider per flessibilità e costi:
      *   **Gemini API** (Google) - Modelli gratuiti e a pagamento
      *   **OpenAI API**
      *   **Azure OpenAI** - Per enterprise e compliance
    *   Sistema di switch dinamico tra modelli (gratuito/pagato) tramite configurazione.
    *   Funzionalità suggerite:
      *   Raccomandazioni di attività basate su interessi
      *   Suggerimenti ristoranti locali
      *   Consigli su logistica e trasporti
      *   Informazioni culturali e storiche sulla destinazione
      *   Traduzione in tempo reale
    *   Memoria conversazionale per mantenere il contesto durante la chat.
    *   Integrazione con itinerario esistente per suggerimenti contestuali.

### 2. Offline Mode & PWA 📶
*   **Stato:** Pianificato.
*   **Dettagli:**
    *   Supporto PWA per installazione su dispositivi mobili.
    *   Cache intelligente per accesso offline ai dati essenziali.
    *   Sincronizzazione automatica quando torna online.

### 3. Galleria Foto Condivisa 📸
*   **Stato:** Pianificato.
*   **Dettagli:**
    *   Upload e organizzazione foto di gruppo.
    *   Album automatici per ogni giorno/attività.
    *   Tagging persone e luoghi.

### 4. Integrazione Calendari Esterni 📅
*   **Stato:** Pianificato.
*   **Dettagli:**
    *   Export/import con Google Calendar, Apple Calendar, Outlook.
    *   Sincronizzazione bidirezionale.

### 5. Meteo Avanzato & Avvisi ☀️
*   **Stato:** Pianificato.
*   **Dettagli:**
    *   Previsioni orarie dettagliate.
    *   Avvisi meteo in tempo reale.
    *   Suggerimenti automatici basati sul meteo.

### 6. Dark Mode System 🌙
*   **Stato:** Pianificato.
*   **Dettagli:**
    *   Tema scuro completo per tutto l'applicativo.
    *   Switch automatico basato su preferenze di sistema.

### 7. Traduttore & Convertitore Rapido 🧰
*   **Stato:** Pianificato.
*   **Dettagli:**
    *   Traduzione istantanea di testi e frasi.
    *   Convertitore valuta, unità di misura, orari.

### 8. Notifiche Push 🔔
*   **Stato:** Pianificato.
*   **Dettagli:**
    *   Notifiche per attività imminenti.
    *   Avvisi per nuovi messaggi, commenti e inviti.
    *   Promemoria per scadenze importanti.

### 9. Analytics & Insights 📊
*   **Stato:** Pianificato.
*   **Dettagli:**
    *   Statistiche dettagliate sui viaggi passati.
    *   Analisi spese per categoria e destinazione.
    *   Grafici e report personalizzabili.

### 10. Integrazione Social Media 📱
*   **Stato:** Pianificato.
*   **Dettagli:**
    *   Condivisione diretta su Instagram, Facebook, Twitter.
    *   Generazione automatica di post per viaggi.
    *   Importazione foto da social media.