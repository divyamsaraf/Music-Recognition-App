import { renderHook, act } from '@testing-library/react'
import { useRecognitionStore } from './useRecognitionStore'
import * as storage from '@/lib/storage'

// Mock the storage module
jest.mock('@/lib/storage', () => ({
    getHistory: jest.fn(),
    saveHistory: jest.fn(),
    clearHistoryStorage: jest.fn(),
}))

describe('useRecognitionStore', () => {
    const mockMusic = {
        title: 'Test Song',
        artists: [{ name: 'Test Artist' }],
        album: { name: 'Test Album' },
        external_metadata: {
            spotify: {
                track: { id: 'spotify-id' },
                album: { images: [{ url: 'image-url' }] }
            },
            youtube: { vid: 'youtube-id' }
        }
    }

    beforeEach(() => {
        jest.clearAllMocks()
        useRecognitionStore.getState().reset()
        useRecognitionStore.getState().clearHistory()
            // Default mock return value
            ; (storage.getHistory as jest.Mock).mockReturnValue([])
    })

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useRecognitionStore())
        expect(result.current.history).toEqual([])
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeNull()
        expect(result.current.result).toBeNull()
    })

    it('should add item to history and save to storage', () => {
        const { result } = renderHook(() => useRecognitionStore())

        act(() => {
            result.current.addToHistory(mockMusic)
        })

        expect(result.current.history).toHaveLength(1)
        expect(result.current.history[0]).toMatchObject({
            title: mockMusic.title,
            artists: mockMusic.artists
        })
        expect(storage.saveHistory).toHaveBeenCalledWith(expect.any(Array))
    })

    it('should not add duplicate items within debounce period', () => {
        const { result } = renderHook(() => useRecognitionStore())

            // Mock getHistory to return the item we just added (simulating storage update)
            ; (storage.getHistory as jest.Mock).mockImplementation(() => result.current.history)

        act(() => {
            result.current.addToHistory(mockMusic)
        })

        expect(result.current.history).toHaveLength(1)

        act(() => {
            result.current.addToHistory(mockMusic)
        })

        expect(result.current.history).toHaveLength(1)
        expect(storage.saveHistory).toHaveBeenCalledTimes(1)
    })

    it('should load history from storage', () => {
        const mockHistory = [{ ...mockMusic, id: '1', timestamp: 123 }]
            ; (storage.getHistory as jest.Mock).mockReturnValue(mockHistory)

        const { result } = renderHook(() => useRecognitionStore())

        act(() => {
            result.current.loadHistory()
        })

        expect(result.current.history).toEqual(mockHistory)
    })

    it('should clear history', () => {
        const { result } = renderHook(() => useRecognitionStore())

        act(() => {
            result.current.addToHistory(mockMusic)
            result.current.clearHistory()
        })

        expect(result.current.history).toEqual([])
        expect(storage.clearHistoryStorage).toHaveBeenCalled()
    })
})
