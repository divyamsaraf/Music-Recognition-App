import { create } from 'zustand'
import { getHistory, saveHistory, clearHistoryStorage, HistoryItem, getAnonymousId } from '@/lib/storage'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

export interface Music {
    title?: string
    artists?: Array<{ name: string }>
    album?: {
        name: string
        cover?: string
        release_date?: string
        covers?: {
            small?: string
            medium?: string
            large?: string
        }
    }
    external_metadata?: {
        spotify?: {
            track: { id: string }
            album: { images: Array<{ url: string }> }
        }
        youtube?: {
            vid: string
        }
        deezer?: {
            track: {
                id: string
            }
            album?: {
                id: string
            }
        }
        applemusic?: {
            track: { id: string }
        }
    }
    score?: number
    release_date?: string
    genres?: Array<{ name: string }> | string[]
    label?: string
    contributors?: Array<{
        name: string
        roles: string[]
    }>
    works?: Array<{
        contributors: Array<{
            name: string
            roles: string[]
        }>
    }>
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
    isLoadingHistory: boolean
    history: HistoryItem[]
    hasMore: boolean
    page: number
    setResult: (result: RecognitionResult) => void
    setMusic: (music: Music) => void
    setError: (error: string) => void
    reset: () => void
    addToHistory: (music: Music) => void
    loadHistory: (reset?: boolean) => Promise<void>
    clearHistory: () => void
}

export const useRecognitionStore = create<RecognitionStore>((set, get) => ({
    result: null,
    error: null,
    isLoading: false,
    isLoadingHistory: false,
    history: [],
    hasMore: true,
    page: 0,
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
    addToHistory: async (music) => {
        const newItem: HistoryItem = {
            ...music,
            id: crypto.randomUUID(),
            timestamp: Date.now()
        }

        set((state) => {
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

            // Local Update
            const newHistory = [newItem, ...currentHistory].slice(0, 100)
            saveHistory(newHistory)

            // Supabase Update (Fire and forget, but with SAME ID)
            const syncToSupabase = async () => {
                const supabase = createBrowserSupabaseClient()
                if (!supabase) return

                const { data: { user } } = await supabase.auth.getUser()
                const anonymousId = !user ? getAnonymousId() : null

                // Image Logic (Shared with ResultCard roughly)
                const imageUrl =
                    music.album?.cover ||
                    music.album?.covers?.large ||
                    music.album?.covers?.medium ||
                    music.album?.covers?.small ||
                    music.external_metadata?.spotify?.album?.images?.[0]?.url

                try {
                    const { error } = await supabase.from('history').insert({
                        id: newItem.id, // Enforce Client ID
                        user_id: user?.id || null,
                        anonymous_id: anonymousId,
                        title: music.title || 'Unknown Title',
                        artist: music.artists?.[0]?.name || 'Unknown Artist',
                        album: music.album?.name,
                        album_art_url: imageUrl,
                        spotify_id: music.external_metadata?.spotify?.track?.id,
                        youtube_id: music.external_metadata?.youtube?.vid,
                        confidence: music.score,
                        created_at: new Date(newItem.timestamp).toISOString() // Match timestamp
                    })
                    // ... error handling
                } catch (err) {
                    console.error('[Debug] Failed to sync history to Supabase (Exception):', err)
                }
            }
            syncToSupabase()

            return { history: newHistory }
        })
    },
    loadHistory: async (reset = false) => {
        const { history, page, hasMore, isLoadingHistory } = get()

        // 1. Initial Local Load (if reset/first load)
        if (reset && page === 0) {
            const localHistory = getHistory()
            // Set local history immediately for responsiveness
            set({ history: localHistory })
        }

        if (isLoadingHistory || (!hasMore && !reset)) return

        set({ isLoadingHistory: true })

        try {
            const supabase = createBrowserSupabaseClient()
            if (!supabase) {
                set({ isLoadingHistory: false, hasMore: false })
                return
            }

            const currentPage = reset ? 0 : page
            const pageSize = 20
            const from = currentPage * pageSize
            const to = from + pageSize - 1

            // ... query setup ...
            const { data: { user } } = await supabase.auth.getUser()
            // ...

            let query = supabase
                .from('history')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to)

            const { data, error, count } = await query

            if (error) throw error

            // Map Supabase items
            const remoteItems: HistoryItem[] = (data || []).map(row => ({
                id: row.id,
                timestamp: new Date(row.created_at).getTime(),
                title: row.title,
                score: row.confidence,
                artists: [{ name: row.artist }],
                album: {
                    name: row.album,
                    cover: row.album_art_url,
                    covers: {
                        large: row.album_art_url,
                        medium: row.album_art_url,
                        small: row.album_art_url
                    }
                },
                external_metadata: {
                    spotify: row.spotify_id ? {
                        track: { id: row.spotify_id },
                        album: { images: [{ url: row.album_art_url }] }
                    } : undefined,
                    youtube: row.youtube_id ? {
                        vid: row.youtube_id
                    } : undefined
                }
            }))

            set(state => {
                // Merge Strategy:
                // 1. Combine existing (local+remote) with new remote batch.
                // 2. Deduplicate by ID.
                // 3. Sort by Timestamp.

                const current = reset ? [] : state.history // On reset, we already loaded local, but we might prefer to rebuild
                // Actually, if reset is true, we loaded 'localHistory' at top.
                // But Supabase is "authority".
                // Let's create a map of everything we have.

                const combined = reset ? [...getHistory(), ...remoteItems] : [...state.history, ...remoteItems]

                const uniqueMap = new Map<string, HistoryItem>()
                combined.forEach(item => uniqueMap.set(item.id, item))

                // Sort Descending
                const merged = Array.from(uniqueMap.values()).sort((a, b) => b.timestamp - a.timestamp)

                return {
                    history: merged,
                    page: currentPage + 1,
                    hasMore: (count || 0) > merged.length, // Rough check
                    isLoadingHistory: false
                }
            })

        } catch (error) {
            console.error('Failed to load history:', error)
            set({ isLoadingHistory: false })
        }
    },
    clearHistory: async () => {
        // Clear local state
        set({ history: [] })
        clearHistoryStorage()

        // Clear Supabase
        const supabase = createBrowserSupabaseClient()
        if (supabase) {
            const { error } = await supabase.from('history').delete().neq('id', '00000000-0000-0000-0000-000000000000') // Delete all rows visible to user
            if (error) console.error("Failed to clear Supabase history", error)
        }
    }
}))
