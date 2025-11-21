'use client'

import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trash2, ExternalLink, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface HistoryItem {
    id: string
    title: string
    artist: string
    album: string
    created_at: string
    spotify_id?: string
    youtube_id?: string
}

export default function HistoryPage() {
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createBrowserSupabaseClient()
    const router = useRouter()

    const fetchHistory = useCallback(async () => {
        if (!supabase) return
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setHistory(data || [])
        } catch (error) {
            console.error('Error fetching history:', error)
            toast.error('Failed to load history')
        } finally {
            setLoading(false)
        }
    }, [supabase, router])

    useEffect(() => {
        if (!supabase) return
        fetchHistory()
    }, [fetchHistory, supabase])

    const handleDelete = async (id: string) => {
        if (!supabase) return
        try {
            const { error } = await supabase
                .from('history')
                .delete()
                .eq('id', id)

            if (error) throw error
            setHistory(history.filter(item => item.id !== id))
            toast.success('Item deleted')
        } catch {
            toast.error('Failed to delete item')
        }
    }

    const clearHistory = async () => {
        if (!confirm('Are you sure you want to clear all history?')) return

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('history')
                .delete()
                .eq('user_id', user.id)

            if (error) throw error
            setHistory([])
            toast.success('History cleared')
        } catch {
            toast.error('Failed to clear history')
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    return (
        <main className="min-h-screen p-4 md:p-8 bg-background">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => router.push('/')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <h1 className="text-3xl font-bold">Recognition History</h1>
                    </div>
                    {history.length > 0 && (
                        <Button variant="destructive" size="sm" onClick={clearHistory}>
                            <Trash2 className="mr-2 h-4 w-4" /> Clear All
                        </Button>
                    )}
                </div>

                <div className="grid gap-4">
                    {history.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No history yet. Start recognizing songs!
                        </div>
                    ) : (
                        history.map((item) => (
                            <Card key={item.id} className="overflow-hidden">
                                <CardContent className="p-6 flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-lg">{item.title}</h3>
                                        <p className="text-muted-foreground">{item.artist}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                                            <Calendar className="h-3 w-3" />
                                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {item.spotify_id && (
                                            <Button size="icon" variant="outline" onClick={() => window.open(`https://open.spotify.com/track/${item.spotify_id}`, '_blank')}>
                                                <ExternalLink className="h-4 w-4 text-[#1DB954]" />
                                            </Button>
                                        )}
                                        <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </main>
    )
}
