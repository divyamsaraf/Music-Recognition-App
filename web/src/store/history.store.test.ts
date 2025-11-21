import { useRecognitionStore } from '@/store/useRecognitionStore'
import { getHistoryCookie, setHistoryCookie, clearHistoryCookie } from '@/lib/cookies'

// Mock the cookie part since jsdom handles cookies but we want to ensure our wrapper works
// Actually jsdom's document.cookie works fine, so we can test integration directly.

describe('Recognition Store & Cookies', () => {
    beforeEach(() => {
        // Clear cookies and store before each test
        document.cookie = 'soundlens_history=; path=/; max-age=0'
        useRecognitionStore.getState().reset()
        useRecognitionStore.getState().clearHistory()
    })

    it('should initialize with empty history', () => {
        const { history } = useRecognitionStore.getState()
        expect(history).toEqual([])
    })

    it('should add recognition to history and persist to cookies', () => {
        const song = {
            title: 'Test Song',
            artists: [{ name: 'Test Artist' }],
            timestamp: Date.now()
        }

        useRecognitionStore.getState().addToHistory(song)

        const { history } = useRecognitionStore.getState()
        expect(history).toHaveLength(1)
        expect(history[0].title).toBe('Test Song')

        // Check cookie
        const cookieHistory = getHistoryCookie()
        expect(cookieHistory).toHaveLength(1)
        expect(cookieHistory[0].title).toBe('Test Song')
    })

    it('should not add duplicate songs within short timeframe', () => {
        const song = {
            title: 'Duplicate Song',
            artists: [{ name: 'Artist' }],
        }

        useRecognitionStore.getState().addToHistory(song)
        useRecognitionStore.getState().addToHistory(song) // Immediate duplicate

        const { history } = useRecognitionStore.getState()
        expect(history).toHaveLength(1)
    })

    it('should load history from cookies on initialization', () => {
        const preExistingHistory = [
            { id: '1', title: 'Old Song', artists: [{ name: 'Old Artist' }], timestamp: Date.now() }
        ]
        setHistoryCookie(preExistingHistory)

        useRecognitionStore.getState().loadHistory()

        const { history } = useRecognitionStore.getState()
        expect(history).toHaveLength(1)
        expect(history[0].title).toBe('Old Song')
    })

    it('should clear history from store and cookies', () => {
        const song = { title: 'To Delete', artists: [{ name: 'Artist' }] }
        useRecognitionStore.getState().addToHistory(song)

        useRecognitionStore.getState().clearHistory()

        const { history } = useRecognitionStore.getState()
        expect(history).toEqual([])

        const cookieHistory = getHistoryCookie()
        expect(cookieHistory).toEqual([])
    })
})
