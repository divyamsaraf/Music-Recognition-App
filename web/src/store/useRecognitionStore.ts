import { create } from 'zustand'
import { getHistoryCookie, setHistoryCookie, CookieHistoryItem } from '@/lib/cookies'

export interface Music {
    title?: string
    artists?: Array<{ name: string }>
    album?: { name: string }
    external_metadata?: {
        spotify?: {
            track: { id: string }
            album: { images: Array<{ url: string }> }
        }
        youtube?: { vid: string }
    }
    score?: number
    release_date?: string
    genres?: Array<{ name: string }>
    label?: string
}

interface RecognitionResult {
    metadata?: {
        music?: Music[]
    }
    status: {
        code: number
        msg: string
    }
}

interface RecognitionStore {
    result: RecognitionResult | null
    error: string | null
    isLoading: boolean
    history: CookieHistoryItem[]
    setResult: (result: RecognitionResult) => void
    setMusic: (music: Music) => void
    setError: (error: string) => void
    reset: () => void
    addToHistory: (music: Music) => void
    loadHistory: () => void
    clearHistory: () => void
}

export const useRecognitionStore = create<RecognitionStore>((set, get) => ({
    result: null,
    error: null,
    isLoading: false,
    history: [],
    setResult: (result) => set({ result, error: null }),
    setMusic: (music) => {
        set({
            result: {
                status: { code: 0, msg: 'Success' },
                metadata: { music: [music] },
            },
            error: null
        })
        get().addToHistory(music)
    },
    setError: (error) => set({ error, result: null }),
    reset: () => set({ result: null, error: null, isLoading: false }),
    addToHistory: (music) => {
        // Sanitize music object to reduce cookie size
        const sanitizedMusic: Music = {
            title: music.title,
            artists: music.artists,
            album: {
                name: music.album?.name || '',
            },
            external_metadata: {
                spotify: music.external_metadata?.spotify ? {
                    track: { id: music.external_metadata.spotify.track.id },
                    album: {
                        images: music.external_metadata.spotify.album.images.slice(0, 1) // Keep only first image
                    }
                } : undefined,
                youtube: music.external_metadata?.youtube ? {
                    vid: music.external_metadata.youtube.vid
                } : undefined
            }
        }

        const newItem: CookieHistoryItem = {
            ...sanitizedMusic,
            id: crypto.randomUUID(),
            timestamp: Date.now()
        }

        set((state) => {
            // If state history is empty, try to load from cookie first to avoid overwriting
            let currentHistory = state.history
            if (currentHistory.length === 0) {
                currentHistory = getHistoryCookie()
            }

            // Prevent duplicates (simple check by title + artist)
            const isDuplicate = currentHistory.some(item =>
                item.title === music.title &&
                item.artists?.[0]?.name === music.artists?.[0]?.name &&
                Date.now() - item.timestamp < 10000 // 10s debounce
            )

            if (isDuplicate) {
                // If we loaded from cookie but didn't update state yet, we should update state now
                return { history: currentHistory }
            }

            const newHistory = [newItem, ...currentHistory].slice(0, 50) // Keep last 50
            setHistoryCookie(newHistory)
            return { history: newHistory }
        })
    },
    loadHistory: () => {
        const history = getHistoryCookie()
        set({ history })
    },
    clearHistory: () => {
        set({ history: [] })
        // Cookie clearing is handled by the caller usually, but we can do it here too if we import it
        // For now, we'll let the UI handle the cookie clear call to keep store pure-ish or update it here
        // Actually, let's update it here for consistency
        // We need to import clearHistoryCookie but I didn't export it in the interface above properly
        // Let's just set empty cookie
        if (typeof document !== 'undefined') {
            document.cookie = 'soundlens_history=; path=/; max-age=0; secure; samesite=strict'
        }
    }
}))
