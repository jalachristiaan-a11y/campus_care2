# CampusCare

## Run locally

1. Configure the PostgreSQL connection in `.env`.
2. Run `npm install` once to install project dependencies.
3. Run `npm run db:init` to create or update the database tables.
4. Run `npm run dev` in PowerShell and open the local URL printed by Vite.

Run `npm run db:init` again after pulling changes that update the database schema. The command preserves existing records.

## Login sessions

Successful logins use an opaque, server-managed session stored in PostgreSQL. The browser receives only an HttpOnly, SameSite=Lax session cookie; cookies are Secure automatically when `NODE_ENV=production`. Sessions expire after eight hours and are removed from the database when users log out. Unsafe API requests must include the application's CSRF-protection header, which the shared API client adds automatically.

## Complaint workflow

Student complaints, admin review and reassignment, student portal notices, intake status, and SLA settings use PostgreSQL. Students can edit or withdraw their complaints while they are Under Review; withdrawn complaints remain in the database with a Withdrawn status. Administrators can add responses to complaint histories and must provide a resolution note when resolving a case. Students can view responses, status changes, and resolution notes in ticket tracking. Admin complaint counts and analytics are based on saved complaint records. Website visits and outbound email delivery are not configured.

Complaints saved only in browser local storage are not imported automatically. Do not copy those records into an account unless the owner has confirmed they belong to that student.
