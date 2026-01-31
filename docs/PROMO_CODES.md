# VoyageSmart Promo Codes System

## Panoramica

Il sistema di codici promozionali di VoyageSmart permette di distribuire codici speciali ad amici, parenti, affiliati e partner. Ogni codice può essere utilizzato una sola volta per utente e offre diversi tipi di benefici.

## ⚠️ Setup Iniziale (IMPORTANTE)

Prima di poter utilizzare il sistema di codici promozionali, **devi applicare le migrazioni al database**. Senza questo passaggio, le funzioni RPC non esisteranno e riceverai errori `400 Bad Request`.

### Applicare le Migrazioni

1. **Via Supabase CLI** (consigliato per sviluppo locale):
   ```bash
   # Assicurati di essere loggato
   supabase login
   
   # Collega il progetto
   supabase link --project-ref YOUR_PROJECT_REF
   
   # Applica le migrazioni
   supabase db push
   ```

2. **Via Supabase Dashboard** (per produzione):
   - Vai su https://supabase.com/dashboard
   - Seleziona il tuo progetto → SQL Editor
   - Copia il contenuto di `supabase/migrations/20260131180000_promo_codes.sql`
   - Esegui lo script
   - Poi copia il contenuto di `supabase/migrations/20260131190000_user_roles.sql`
   - Esegui lo script

3. **Verifica che le migrazioni siano state applicate**:
   ```sql
   -- Verifica che le tabelle esistano
   SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'promo_codes');
   SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'promo_code_redemptions');
   
   -- Verifica che le funzioni esistano
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name IN ('redeem_promo_code', 'create_promo_code', 'is_admin');
   ```

### Promuovere un Utente ad Admin

Dopo aver applicato le migrazioni, devi promuovere almeno un utente ad admin:

```sql
-- Trova il tuo user_id
SELECT id, email FROM auth.users WHERE email = 'tua@email.com';

-- Promuovi ad admin
UPDATE profiles SET role = 'admin' WHERE user_id = 'UUID_TROVATO_SOPRA';
```

## Tipi di Codici

### 1. Trial (Prova)
- Concede un periodo di prova Pro gratuito
- Durata personalizzabile (es. 7, 14, 30 giorni)
- Ideale per: nuovi utenti, eventi promozionali

### 2. Subscription (Abbonamento)
- Concede 1 anno di VoyageSmart Pro
- Ideale per: partner strategici, influencer

### 3. Lifetime (A Vita)
- Accesso Pro illimitato senza scadenza
- Ideale per: fondatori, team interno, partnership VIP

### 4. Discount (Sconto)
- Percentuale di sconto sull'abbonamento
- Ideale per: affiliati, sconti stagionali

## Ruoli Utente

Il sistema di codici promozionali utilizza un sistema di ruoli per controllare l'accesso:

| Ruolo | Descrizione | Permessi |
|-------|-------------|----------|
| `user` | Utente normale (default) | Può riscattare codici, vedere i propri riscatti |
| `admin` | Amministratore | Tutti i permessi + gestione codici nel pannello admin |

### Promuovere un Utente ad Admin

```sql
-- Per email
UPDATE profiles p
SET role = 'admin'
FROM auth.users u
WHERE p.user_id = u.id
  AND u.email = 'admin@example.com';

-- Per user_id diretto
UPDATE profiles
SET role = 'admin'
WHERE user_id = 'uuid-dell-utente';
```

### Verificare gli Admin

```sql
SELECT p.full_name, u.email, p.role
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE p.role = 'admin';
```

## Sicurezza

Il sistema è progettato con molteplici livelli di sicurezza:

### Server-Side
- ✅ Tutte le validazioni avvengono lato server
- ✅ I codici sono hashati con SHA256 per prevenire enumerazione
- ✅ Row Level Security (RLS) impedisce accesso diretto alle tabelle
- ✅ Le funzioni database sono `SECURITY DEFINER`

### Rate Limiting
- ✅ Max 5 tentativi per minuto per utente
- ✅ Tracking IP e User-Agent per fraud detection
- ✅ Protezione contro brute-force

### Anti-Abuse
- ✅ Ogni codice può essere usato una volta per utente
- ✅ Limite totale di utilizzi configurabile
- ✅ Data di scadenza opzionale
- ✅ Log completo di tutte le redemption

## Come Generare Codici

### Metodo 1: Admin Panel (Consigliato) 🆕

VoyageSmart include un pannello di amministrazione completo per la gestione dei codici promozionali. Per accedervi:

1. **Configura un utente admin**: Esegui questa query nel Supabase SQL Editor per promuovere un utente ad admin:
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE user_id = 'UUID_DELL_UTENTE';
   ```

2. **Accedi al pannello**: Una volta loggato come admin, vedrai un pulsante "Admin" nella navbar che ti porterà a `/admin/promo-codes`

3. **Funzionalità disponibili**:
   - 📊 **Dashboard**: Statistiche in tempo reale (codici totali, attivi, riscatti)
   - ➕ **Crea Codice**: Form completo per creare nuovi codici con tutti i parametri
   - ✏️ **Modifica Codice**: Aggiorna nome, descrizione, limiti e scadenza
   - 🗑️ **Elimina Codice**: Rimuovi codici non più necessari
   - 👁️ **Visualizza Riscatti**: Vedi chi ha usato ogni codice
   - 🔄 **Aggiorna Dati**: Refresh in tempo reale

#### Caratteristiche del Pannello Admin:

- **Filtri avanzati**: Cerca per codice/nome, filtra per stato (attivo/inattivo/scaduto) e tipo
- **Generatore codici**: Genera automaticamente codici casuali di 8 caratteri
- **Progress bar utilizzo**: Visualizza graficamente la percentuale di utilizzo
- **Storico riscatti**: Tab dedicata con tutti i riscatti e dettagli utente

### Metodo 2: SQL Diretto (Supabase SQL Editor)

Accedi al Supabase Dashboard → SQL Editor e esegui:

```sql
-- Codice Trial 30 giorni per amici
SELECT create_promo_code(
  'AMICO2024',                    -- Codice (verrà normalizzato in UPPERCASE)
  'Codice Amici 2024',            -- Nome descrittivo
  'trial',                        -- Tipo: trial/subscription/lifetime/discount
  30,                             -- trial_days (per tipo 'trial')
  NULL,                           -- discount_percent (per tipo 'discount')
  false,                          -- lifetime_pro (per tipo 'lifetime')
  100,                            -- max_total_uses (NULL = illimitato)
  1,                              -- max_uses_per_user
  NULL,                           -- expires_at (NULL = mai)
  'Codice per amici e familiari', -- description
  'Creato per la campagna amici'  -- notes (interno)
);

-- Codice Lifetime per VIP
SELECT create_promo_code(
  'VIP-LIFETIME-001',
  'Accesso VIP Lifetime',
  'lifetime',
  NULL,                           -- non serve per lifetime
  NULL,                           -- non serve per lifetime
  true,                           -- lifetime_pro = true
  5,                              -- solo 5 utilizzi totali
  1,
  NULL,
  'Accesso Pro illimitato a vita',
  'Per partner VIP'
);

-- Codice Sconto 50%
SELECT create_promo_code(
  'ESTATE50',
  'Sconto Estate 50%',
  'discount',
  NULL,
  50,                             -- 50% di sconto
  false,
  200,
  1,
  '2024-09-30 23:59:59+00',       -- Scade il 30 settembre
  'Sconto del 50% per la promozione estiva',
  'Campagna estiva 2024'
);

-- Codice Abbonamento Annuale
SELECT create_promo_code(
  'PARTNER-ANNUAL-2024',
  'Partnership Annuale 2024',
  'subscription',
  NULL,
  NULL,
  false,
  10,
  1,
  '2024-12-31 23:59:59+00',
  'Un anno di accesso Pro gratuito',
  'Per i partner della rete commerciale'
);
```

### Metodo 2: Via API (per automazione)

Se hai un sistema admin custom, puoi chiamare la funzione RPC:

```typescript
import { supabase } from "@/integrations/supabase/client";

const result = await supabase.rpc('create_promo_code', {
  p_code: 'MYCODE2024',
  p_name: 'Nome Codice',
  p_type: 'trial',
  p_trial_days: 14,
  p_max_total_uses: 50,
  p_max_uses_per_user: 1,
  p_description: 'Descrizione del codice'
});

console.log(result.data);
// { success: true, code: 'MYCODE2024', id: 'uuid...' }
```

## Gestione Codici

### Visualizzare Tutti i Codici

```sql
SELECT 
  code,
  name,
  type,
  trial_days,
  discount_percent,
  lifetime_pro,
  current_uses,
  max_total_uses,
  is_active,
  starts_at,
  expires_at,
  created_at
FROM promo_codes
ORDER BY created_at DESC;
```

### Disattivare un Codice

```sql
UPDATE promo_codes
SET is_active = false, updated_at = now()
WHERE code = 'CODICE_DA_DISATTIVARE';
```

### Vedere le Redemption

```sql
SELECT 
  r.redeemed_at,
  p.email,
  pc.code,
  pc.name as code_name,
  pc.type,
  r.ip_address,
  r.metadata
FROM promo_code_redemptions r
JOIN auth.users p ON r.user_id = p.id
JOIN promo_codes pc ON r.promo_code_id = pc.id
ORDER BY r.redeemed_at DESC
LIMIT 100;
```

### Statistiche Utilizzo

```sql
SELECT 
  pc.code,
  pc.name,
  pc.type,
  pc.current_uses,
  pc.max_total_uses,
  ROUND(100.0 * pc.current_uses / NULLIF(pc.max_total_uses, 0), 2) as usage_percentage,
  pc.is_active,
  pc.expires_at
FROM promo_codes pc
ORDER BY pc.current_uses DESC;
```

## Best Practices

### Naming Convention per i Codici

| Pattern | Uso | Esempio |
|---------|-----|---------|
| `AMICO[ANNO]` | Amici e famiglia | `AMICO2024` |
| `PARTNER-[NOME]-[ANNO]` | Partnership | `PARTNER-ACME-2024` |
| `EVENT-[NOME]` | Eventi specifici | `EVENT-WEBINAR-JAN` |
| `VIP-[TIPO]-[N]` | Codici VIP limitati | `VIP-LIFETIME-001` |
| `INFLUENCER-[NOME]` | Affiliati/Influencer | `INFLUENCER-MARCO` |
| `[STAGIONE][SCONTO]` | Promozioni stagionali | `ESTATE50`, `BLACKFRIDAY30` |

### Limiti Consigliati

| Tipo Codice | max_total_uses | Note |
|-------------|----------------|------|
| Amici/Famiglia | 10-50 | Limitato per mantenere esclusività |
| Partnership | 100-500 | In base all'accordo |
| Influencer | 50-200 | Tracciabile per analytics |
| Campagna Generale | 500-5000 | Per lanci o eventi |
| Lifetime VIP | 5-20 | Estremamente limitato |

### Scadenze

- **Trial brevi (7-14 giorni)**: Scadenza codice 1-2 mesi
- **Trial lunghi (30 giorni)**: Scadenza codice 3-6 mesi
- **Promozioni stagionali**: Fine stagione
- **Partnership**: Fine anno solare
- **VIP Lifetime**: Mai (ma usa max_total_uses bassi)

## Troubleshooting

### "Codice non valido o scaduto"
- Verifica che il codice sia scritto correttamente (case insensitive)
- Controlla che `is_active = true`
- Verifica che la data attuale sia tra `starts_at` e `expires_at`
- Controlla che `current_uses < max_total_uses`

### "Hai già utilizzato questo codice"
- L'utente ha già riscattato questo codice
- Ogni codice è utilizzabile una sola volta per utente

### "Limite raggiunto"
- `max_total_uses` è stato raggiunto
- Aumenta il limite o crea un nuovo codice

## Schema Database

### Tabella `promo_codes`

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `code` | TEXT | Codice visibile (UPPERCASE) |
| `code_hash` | TEXT | SHA256 hash per lookup sicuro |
| `name` | TEXT | Nome descrittivo |
| `description` | TEXT | Descrizione pubblica |
| `type` | ENUM | trial/subscription/lifetime/discount |
| `trial_days` | INT | Giorni di prova (per trial) |
| `discount_percent` | INT | Percentuale sconto (per discount) |
| `lifetime_pro` | BOOL | Accesso lifetime (per lifetime) |
| `max_total_uses` | INT | Limite totale (NULL = illimitato) |
| `current_uses` | INT | Utilizzi correnti |
| `max_uses_per_user` | INT | Limite per utente (default 1) |
| `starts_at` | TIMESTAMPTZ | Inizio validità |
| `expires_at` | TIMESTAMPTZ | Fine validità (NULL = mai) |
| `is_active` | BOOL | Codice attivo |
| `created_by` | UUID | Chi ha creato il codice |
| `created_at` | TIMESTAMPTZ | Data creazione |
| `notes` | TEXT | Note interne (admin) |

### Tabella `promo_code_redemptions`

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Utente che ha riscattato |
| `promo_code_id` | UUID | Codice riscattato |
| `redeemed_at` | TIMESTAMPTZ | Data riscatto |
| `ip_address` | INET | IP per fraud detection |
| `user_agent` | TEXT | Browser/client info |
| `trial_ends_at` | TIMESTAMPTZ | Scadenza trial (se applicabile) |
| `discount_applied` | INT | Sconto applicato (se applicabile) |
| `metadata` | JSONB | Dati aggiuntivi |

## Esempi di Codici Pronti

```sql
-- 🎁 Amici e Famiglia - 30 giorni trial
SELECT create_promo_code('FRIENDS30', 'Amici & Famiglia', 'trial', 30, NULL, false, 100, 1, NULL, '30 giorni di VoyageSmart Pro', 'Campagna amici');

-- 🚀 Launch Week - 50% sconto
SELECT create_promo_code('LAUNCH50', 'Lancio 50%', 'discount', NULL, 50, false, 500, 1, '2024-02-28', '50% di sconto sul primo anno', 'Launch week febbraio');

-- ⭐ Partner Gold - 1 anno gratis
SELECT create_promo_code('GOLD2024', 'Partner Gold 2024', 'subscription', NULL, NULL, false, 25, 1, '2024-12-31', '1 anno di Pro gratuito', 'Partnership premium');

-- 👑 VIP Forever - Lifetime access
SELECT create_promo_code('VIPFOREVER', 'VIP Lifetime', 'lifetime', NULL, NULL, true, 10, 1, NULL, 'Accesso Pro a vita', 'Per fondatori e early supporters');

-- 📱 App Review - 7 giorni trial
SELECT create_promo_code('REVIEW7', 'App Review Trial', 'trial', 7, NULL, false, 1000, 1, NULL, '7 giorni per provare Pro', 'Per chi lascia recensioni');
```

## Esperienza Utente Post-Riscatto

Quando un utente riscatta con successo un codice promozionale, nella sezione **Profilo → Abbonamento** vedrà una card dedicata con:

### Card Abbonamento Promo Code

```
┌────────────────────────────────────────┐
│ VoyageSmart Pro               [ATTIVO] │
│ 🎁 Attivato tramite Codice Promozionale│
├────────────────────────────────────────┤
│ ┌──────────────────────────────────┐   │
│ │ Codice: Codice Amici 2024        │   │
│ │ 🎁 Beneficio: 30 giorni di Pro   │   │
│ │ 📅 Attivato il: 1 Febbraio 2026  │   │
│ │ ⏰ Valido fino al: 2 Marzo 2026  │   │
│ └──────────────────────────────────┘   │
│                                        │
│ ✅ AI Assistant Illimitato             │
│ ✅ Export PDF & Calendario             │
│ ✅ Supporto Prioritario                │
└────────────────────────────────────────┘
```

### Per Codici Lifetime

```
│ ♾️ Validità: Lifetime / A vita         │
```

### Differenze con Abbonamento Stripe

- **Nessun pulsante "Gestisci Abbonamento"** - i codici promo non usano Stripe
- **Card verde** invece di viola/indigo per distinguere visivamente
- **Dettagli del riscatto** visibili (data attivazione, scadenza, beneficio)

---

**Nota Importante**: I codici promozionali sono un potente strumento di marketing. Usali con saggezza e monitora regolarmente le statistiche di utilizzo per ottimizzare le tue campagne.
