import { create } from 'zustand'
import { getHistory, saveHistory, clearHistoryStorage, HistoryItem } from '@/lib/storage'

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
    history: HistoryItem[]
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
        const newItem: HistoryItem = {
            ...music,
            id: crypto.randomUUID(),
            timestamp: Date.now()
        }

        set((state) => {
            // Load current history from storage to ensure we have the latest
            // This handles cases where multiple tabs might update history
            const currentHistory = getHistory()

            // Prevent duplicates (simple check by title + artist)
            const isDuplicate = currentHistory.some(item =>
                item.title === music.title &&
                item.artists?.[0]?.name === music.artists?.[0]?.name &&
                Date.now() - item.timestamp < 10000 // 10s debounce
            )

            if (isDuplicate) {
                return { history: currentHistory }
            }

            const newHistory = [newItem, ...currentHistory].slice(0, 100) // Keep last 100 items (localStorage can handle more)
            saveHistory(newHistory)
            return { history: newHistory }
        })
    },
    loadHistory: () => {
        const history = getHistory()
        set({ history })
    },
    clearHistory: () => {
        set({ history: [] })
        clearHistoryStorage()
    }
}))
