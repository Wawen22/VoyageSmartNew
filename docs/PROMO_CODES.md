# VoyageSmart Promo Codes System

## Panoramica

Il sistema di codici promozionali di VoyageSmart permette di distribuire codici speciali ad amici, parenti, affiliati e partner. Ogni codice può essere utilizzato una sola volta per utente e offre diversi tipi di benefici.

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

### Metodo 1: SQL Diretto (Supabase SQL Editor)

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

---

**Nota Importante**: I codici promozionali sono un potente strumento di marketing. Usali con saggezza e monitora regolarmente le statistiche di utilizzo per ottimizzare le tue campagne.
