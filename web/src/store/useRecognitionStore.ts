import { create } from 'zustand'

interface RecognitionResult {
    metadata?: {
        music?: Array<{
            title?: string
            artists?: Array<{ name: string }>
            album?: { name: string }
            external_metadata?: {
                spotify?: { track: { id: string } }
                youtube?: { vid: string }
            }
            score?: number
        }>
    }
    status: {
        code: number
        msg: string
    }
}

interface RecognitionStore {
    result: RecognitionResult | null
    setResult: (result: RecognitionResult) => void
    reset: () => void
}

export const useRecognitionStore = create<RecognitionStore>((set) => ({
    result: null,
    setResult: (result) => set({ result }),
    reset: () => set({ result: null }),
}))
