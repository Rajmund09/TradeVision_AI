# Deployment Guide (Supabase)

This document walks through deploying **TradeVision‑AI** using Supabase instead of
MySQL/SQLite for persistent storage. Supabase provides a hosted PostgreSQL
database, authentication, and a lightweight API – making it an excellent fit for
a serverless/FaaS backend.

> 🗂️ *This guide assumes you have the repository checked out and are familiar
> with the existing FastAPI backend and React/Vite frontend.*

---

## 1. Create a Supabase Project

1. Sign up / log in at https://supabase.com
2. Create a new project; choose a name (e.g. `tradevision-ai`) and a strong
   password. Region can be your closest location.
3. After creation go to **Settings → API** and copy the `anon` public API key
   and the `service_role` key (used by the server).
4. Also note the **Database URL** (format
   `postgres://<user>:<password>@<host>:5432/<db>`). You'll use this as
   `DATABASE_URL`.

### 1.1 Set up Tables

Use the SQL Editor or run migrations via psql; the table definitions are:

```sql
-- users table for auth (if using Supabase Auth you may skip)
create table users (
  id serial primary key,
  username text unique not null,
  hashed_password text not null,
  created_at timestamp default now()
);

create table portfolios (
  id serial primary key,
  user_id integer references users(id),
  symbol text not null,
  quantity float not null,
  buy_price float not null,
  buy_date timestamp default now()
);

create table predictions (
  id serial primary key,
  symbol text not null,
  decision text not null,
  score float not null,
  technical_score float,
  lstm_score float,
  confidence float,
  timestamp timestamp default now()
);
```

You can also create these tables via the Supabase dashboard UI.

---

## 2. Backend Configuration

### 2.1 Install Dependencies

```bash
cd backend
pip install -r requirements.txt         # existing deps
pip install "supabase>=1.0"             # Python Supabase client
pip install psycopg2-binary               # Postgres driver used by SQLAlchemy
```

### 2.2 Update `database.py`

Replace the current SQLAlchemy engine creation with the `DATABASE_URL` from
Supabase. Example:

```python
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.environ.get("DATABASE_URL")

engine = create_engine(DATABASE_URL, connect_args={})  # no check_same_thread
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

Remove any `sqlite://` or `mysql://` connection strings.

### 2.3 Environment Variables

Create a `.env` file (or set in your deployment environment) containing:

```
DATABASE_URL=postgres://<user>:<password>@<host>:5432/<db>
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_KEY=<service_role_key>
JWT_SECRET=<random-secret>
CORS_ORIGINS=http://localhost:3000
```

The `SUPABASE_*` keys are only needed if you use Supabase features such as
Storage or Auth directly from the backend.

### 2.4 Migrate Existing Data (Optional)

If you have data in MySQL/SQLite, export it to CSV and import via the SQL editor
or use `pgloader` to copy records. For a small dataset you can write a script
that reads from the old database and inserts into Supabase:

```python
# simple script using SQLAlchemy sessions from both engines
``` 

### 2.5 Modify Authentication (optional)

You may leverage Supabase Auth instead of custom JWT logic. In that case:

- Remove `auth_service.py` and related routes.
- Use the Supabase Python client to verify JWTs on incoming requests:

```python
from supabase import create_client

supabase = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_KEY'])

def get_current_user(token):
    user = supabase.auth.get_user(token)
    return user
```

For now you can continue using the existing JWT code and just store users in the
`users` table.

---

## 3. Frontend Adjustments

The frontend remains largely unchanged. Ensure environment variables point to the
correct backend URL. If you're using Supabase's client in the frontend (for
storage, realtime, or auth), install the JS library:

```bash
cd frontend
npm install @supabase/supabase-js
```

and initialise it in a context/provider:

```js
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

Add the `VITE_` prefixed variables to `.env.local`.

---

## 4. Deployment

### 4.1 Backend

1. Choose a host (Heroku, Vercel [via serverless functions], Azure Web App, etc.)
2. Set up environment variables there as shown above.
3. Push the repo and ensure `pip install -r requirements.txt` runs.
4. On startup the FastAPI app will create tables (if they don't already exist).
5. (Optional) configure Supabase webhook or edge function if you need triggers
   like sending notifications on new predictions.

_Example with Heroku:_

```bash
heroku create tradevision-ai-backend
heroku config:set DATABASE_URL="${DATABASE_URL}" JWT_SECRET=...
git push heroku main
heroku ps:scale web=1
```

### 4.2 Frontend

Deploy the React/Vite app to any static host (Netlify, Vercel, GitHub Pages).

1. Build the project: `npm run build`
2. Upload the `dist/` folder to your host.
3. Set `VITE_API_BASE_URL` (or similar) env var to point at the deployed
   backend.

e.g., `VITE_API_BASE_URL=https://tradevision-ai-backend.herokuapp.com`


### 4.3 Using Supabase Hosting

Supabase also offers hosting for static sites and edge functions. You can:

- Push the frontend into the `public/` bucket or configure a project to serve
  the `dist/` folder directly.
- Write API routes as Supabase Edge Functions (TypeScript/Go) instead of
  maintaining a separate FastAPI server; the existing Python code would need
  translation in that case.

---

## 5. Verifying the Deployment

- Visit the frontend URL → register/login → make a prediction → check the
  portfolio page.
- Connect to your Supabase dashboard and view the `portfolios`, `users`,
  and `predictions` tables to confirm data is being saved.
- Use Supabase logs to troubleshoot database errors.

---

## 6. Additional Notes

- **Security:** do **not** expose your `service_role` key in the frontend. Only
  use the anon key on the client. Keep the service key secret.
- **Backups:** Supabase automatically backups Postgres, but you can also
  export CSV snapshots from the UI.
- **Scaling:** Supabase handles database scaling for you, no need to manage
  instances.
- **Supabase Auth:** if migrating, update the frontend to use `supabase.auth` to
  sign up and sign in; then call your FastAPI endpoints with the returned
  access token in the `Authorization` header.

---

With the above steps you can completely replace the MySQL storage layer with a
managed Supabase Postgres instance, simplifying deployment and eliminating the
need to run a database server yourself. Happy deploying!  🎉