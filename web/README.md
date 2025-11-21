# SoundLens Web App

## Auth & History Implementation Details

### Cookie Format
We use a cookie named `soundlens_history` to persist recognition history for anonymous users.
- **Name**: `soundlens_history`
- **Value**: URL-encoded JSON string of `CookieHistoryItem[]`
- **Max Age**: 1 year (31536000 seconds)
- **Path**: `/`
- **Secure**: Yes (in production)
- **SameSite**: Strict

**CookieHistoryItem Structure:**
```typescript
interface CookieHistoryItem {
    id: string          // UUID
    title: string
    artists: { name: string }[]
    timestamp: number   // Unix timestamp
    external_metadata?: { ... } // Spotify/YouTube IDs and images
}
```

### Zustand Store API
The `useRecognitionStore` manages the application state.
- `loadHistory()`: Reads from the `soundlens_history` cookie and populates the store.
- `addToHistory(music)`: Adds a new item to the store and updates the cookie. Includes logic to prevent duplicates (10s debounce).
- `clearHistory()`: Clears both the store state and the cookie.

### Manual Test Steps

#### 1. Anonymous History Persistence
1. Open the app in a new incognito window.
2. Record a song and wait for recognition.
3. Verify the song appears in the "Recent Recognitions" horizontal scroll on the home page.
4. Refresh the page.
5. Verify the song is still present in the "Recent Recognitions" list.
6. Open the "History" modal (via "See all" or Navbar).
7. Verify the song is listed with correct metadata and album art.

#### 2. Auth Flow
1. Click "Login / Sign Up" in the Navbar.
2. Select "Sign Up" tab.
3. Enter a valid email and password (min 8 chars).
4. Click "Create Account".
5. Verify success toast appears.
6. Switch to "Login" tab and log in.
7. Verify the "Login / Sign Up" button changes to a User Avatar.

#### 3. Clear History
1. Open History Modal.
2. Click "Clear All".
3. Confirm the dialog.
4. Verify the list is empty and the "Recent Recognitions" section on the home page disappears.
5. Refresh the page and verify history remains empty.
