# Codex CLI Instructions & Memory

This file serves as a memory and instruction set for the Gemini CLI agent working on this project.

## Project Protocols

### Database Management
- **ALWAYS** create a new SQL migration file in `supabase/migrations/` when database schema changes are required.
- Do NOT assume direct access to execute SQL on the database; provide the migration file for the user or for version control.
- Naming convention for migrations: `YYYYMMDDHHMMSS_description.sql` (e.g., `20260130090000_add_users.sql`).

## Gamification System (Badges)

The badge system is dynamically calculated in `src/utils/gamification.ts`.
Database tables `badges` and `user_badges` exist but are currently secondary to dynamic calculation to ensure real-time updates based on trip stats.

### Current Badges & Rules
| ID | Nome | Icona (Lucide) | Regola Sblocco |
| :--- | :--- | :--- | :--- |
| `first_steps` | **Primi Passi** | `MapPin` | Crea **1** viaggio. |
| `traveler` | **Viaggiatore** | `Zap` | Completa **3** viaggi. |
| `globetrotter` | **Globetrotter** | `Globe` | Visita **3** paesi diversi. |
| `explorer` | **Esploratore** | `Compass` | Completa **5** viaggi. |
| `citizen` | **Cittadino del Mondo** | `Crown` | Visita **10** paesi diversi. |

### Adding New Badges
1. Update `src/utils/gamification.ts` adding the new badge object to the `badges` array.
2. Implement the logic to calculate `unlocked` boolean and `progress`.
3. If using a new Icon, update `getBadgeIcon` mapping in `src/pages/PublicProfile.tsx`.

### Design Guidelines
Fai riferimento a docs/DESIGN_SYSTEM.md per la gestione degli stili e degli elementi UI.