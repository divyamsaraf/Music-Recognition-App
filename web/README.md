# Music Recognition App

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
    pip3 install -r api/requirements.txt
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
