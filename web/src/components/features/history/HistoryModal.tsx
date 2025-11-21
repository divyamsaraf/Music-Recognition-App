'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Music2, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface HistoryItem {
    id: string
    title: string
    artist: string
    album_art_url: string | null
    created_at: string
    spotify_id: string | null
    youtube_id: string | null
}

interface HistoryModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function HistoryModal({ open, onOpenChange }: HistoryModalProps) {
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createBrowserSupabaseClient()

    useEffect(() => {
        const fetchHistory = async () => {
            if (!open || !supabase) return

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setLoading(false)
                return
            }

            const { data } = await supabase
                .from('history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (data) setHistory(data)
            setLoading(false)
        }

        fetchHistory()
    }, [open, supabase])

    const handleDelete = async (id: string) => {
        if (!supabase) return
        try {
            await supabase.from('history').delete().eq('id', id)
            setHistory(prev => prev.filter(item => item.id !== id))
            toast.success('Item deleted')
        } catch {
            toast.error('Failed to delete')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-slate-950 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle>Recognition History</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center text-slate-500 py-8">Loading...</div>
                        ) : history.length === 0 ? (
                            <div className="text-center text-slate-500 py-8">No history yet</div>
                        ) : (
                            history.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
                                    <div className="w-12 h-12 rounded bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {item.album_art_url ? (
                                            <img src={item.album_art_url} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <Music2 className="w-6 h-6 text-slate-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium truncate">{item.title}</h4>
                                        <p className="text-sm text-slate-400 truncate">{item.artist}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {item.spotify_id && (
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10" asChild>
                                                <a href={`https://open.spotify.com/track/${item.spotify_id}`} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </Button>
                                        )}
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
