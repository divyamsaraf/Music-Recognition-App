import { create } from 'zustand'

interface Music {
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
    setResult: (result: RecognitionResult) => void
    setMusic: (music: Music) => void
    setError: (error: string) => void
    reset: () => void
}

export const useRecognitionStore = create<RecognitionStore>((set) => ({
    result: null,
    error: null,
    isLoading: false,
    setResult: (result) => set({ result, error: null }),
    setMusic: (music) => set({
        result: {
            status: { code: 0, msg: 'Success' },
            metadata: { music: [music] },
        },
        error: null
    }),
    setError: (error) => set({ error, result: null }),
    reset: () => set({ result: null, error: null, isLoading: false }),
}))
