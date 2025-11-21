import { Music } from '@/store/useRecognitionStore'

const STORAGE_KEY = 'soundlens_history'

export interface HistoryItem extends Music {
    id: string
    timestamp: number
}

export function getHistory(): HistoryItem[] {
    if (typeof window === 'undefined') return []
    try {
        const item = window.localStorage.getItem(STORAGE_KEY)
        return item ? JSON.parse(item) : []
    } catch (error) {
        console.error('Failed to load history:', error)
        return []
    }
}

export function saveHistory(history: HistoryItem[]) {
    if (typeof window === 'undefined') return
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    } catch (error) {
        console.error('Failed to save history:', error)
    }
}

export function clearHistoryStorage() {
    if (typeof window === 'undefined') return
    try {
        window.localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
        console.error('Failed to clear history:', error)
    }
}
