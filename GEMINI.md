# Gemini CLI Instructions & Memory

This file serves as a memory and instruction set for the Gemini CLI agent working on this project.

## Project Protocols

### Database Management
- **ALWAYS** create a new SQL migration file in `supabase/migrations/` when database schema changes are required.
- Do NOT assume direct access to execute SQL on the database; provide the migration file for the user or for version control.
- Naming convention for migrations: `YYYYMMDDHHMMSS_description.sql` (e.g., `20260130090000_add_users.sql`).
