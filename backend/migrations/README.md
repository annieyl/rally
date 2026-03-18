# Rally Migrations

Run these SQL files in order from Supabase SQL Editor:

1. `001_initial_schema.sql`
2. `002_team_members.sql`

## Notes

- These files are idempotent (`IF NOT EXISTS`) and safe to re-run.
- This folder is the canonical migration path for new environments.
