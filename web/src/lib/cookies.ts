import { Music } from '@/store/useRecognitionStore'

const COOKIE_NAME = 'soundlens_history'
const MAX_AGE = 31536000 // 1 year

export interface CookieHistoryItem extends Music {
    id: string
    timestamp: number
}

export function getHistoryCookie(): CookieHistoryItem[] {
    if (typeof document === 'undefined') return []

    const match = document.cookie.match(new RegExp('(^| )' + COOKIE_NAME + '=([^;]+)'))
    if (match) {
        try {
            return JSON.parse(decodeURIComponent(match[2]))
        } catch (e) {
            console.error('Failed to parse history cookie', e)
            return []
        }
    }
    return []
}

export function setHistoryCookie(history: CookieHistoryItem[]) {
    if (typeof document === 'undefined') return

    const value = encodeURIComponent(JSON.stringify(history))
    const isSecure = typeof location !== 'undefined' && location.protocol === 'https:'
    document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${MAX_AGE}; ${isSecure ? 'secure;' : ''} samesite=strict`
}

export function clearHistoryCookie() {
    if (typeof document === 'undefined') return
    const isSecure = typeof location !== 'undefined' && location.protocol === 'https:'
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; ${isSecure ? 'secure;' : ''} samesite=strict`
}
