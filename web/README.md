# Music Recognition App

## Project layout

```
web/
├── api/                 # Python Flask handlers (e.g. recognize) + api/test_recognize.py
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router (pages, layouts, API routes under app/)
│   ├── components/      # UI: layout/, features/, ui/ (shared primitives)
│   ├── hooks/           # React hooks
│   ├── lib/             # Clients, helpers, shared UI copy (e.g. lib/ui/)
│   ├── store/           # Zustand stores (+ colocated *.test.ts)
│   └── db/              # SQL schema (reference)
├── requirements.txt     # Python dependencies for api/
└── package.json
```

## Getting Started

### Prerequisites
1.  **Node.js**: Install Node.js.
2.  **Python 3.9+**: Install Python.
3.  **Vercel CLI**: `npm i -g vercel` (Optional, but recommended).

### Installation
1.  Navigate to the `web` directory:
    ```bash
    cd web
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Install Python dependencies:
    ```bash
    pip3 install -r requirements.txt
    ```

### Running Locally (Frontend + Python Backend)
To run both the Next.js frontend and the Python API locally, use the Vercel CLI:

```bash
npx vercel dev
```

*   This starts the server at `http://localhost:3000`.
*   It automatically handles the Python serverless functions in `api/`.

### Running Frontend Only
If you only want to run the frontend (Python API will **NOT** work):

```bash
npm run dev
```

## Environment Variables
Create a `.env.local` file in the `web` directory with your ACRCloud credentials:

```env
ACRCLOUD_HOST=...
ACRCLOUD_ACCESS_KEY=...
ACRCLOUD_ACCESS_SECRET=...
```

For Supabase auth and synced history, also set (see `src/lib/supabase/`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Never commit real secrets; use Vercel/hosting env vars for production.

## Production checklist (before deploy)

Run from the `web` directory:

```bash
npm run lint
npm test
npm run build
```

Confirm `.env.local` is not committed (see `.gitignore`). Set the same variables in your host (e.g. Vercel project settings). Use `npm audit` periodically for dependency vulnerabilities.
