import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { useEffect, useState, useMemo, useRef } from "react"
import { formatDistanceToNow } from "date-fns"
import { Music2, Trash2, ExternalLink, Search, Filter, ArrowUpDown, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useRecognitionStore } from "@/store/useRecognitionStore"
import { Badge } from "@/components/ui/badge"

interface HistoryModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

type SortOption = 'newest' | 'oldest' | 'title'
type FilterOption = 'all' | 'spotify' | 'youtube'

export function HistoryModal({ open, onOpenChange }: HistoryModalProps) {
    const { history, loadHistory, clearHistory, isLoadingHistory, hasMore } = useRecognitionStore()
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState<SortOption>('newest')
    const [filterBy, setFilterBy] = useState<FilterOption>('all')

    // Observer ref
    const observerTarget = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (open) {
            loadHistory(true) // Reset and load first page
        }
    }, [open, loadHistory])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingHistory) {
                    loadHistory()
                }
            },
            { threshold: 0.1 }
        )

        if (observerTarget.current) {
            observer.observe(observerTarget.current)
        }

        return () => observer.disconnect()
    }, [hasMore, isLoadingHistory, loadHistory])

    const filteredAndSortedHistory = useMemo(() => {
        let result = [...history]

        // Filter
        if (filterBy !== 'all') {
            result = result.filter(item => {
                if (filterBy === 'spotify') return !!item.external_metadata?.spotify
                if (filterBy === 'youtube') return !!item.external_metadata?.youtube
                return true
            })
        }

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(item =>
                (item.title || '').toLowerCase().includes(query) ||
                (item.artists?.[0]?.name || '').toLowerCase().includes(query)
            )
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'newest') return b.timestamp - a.timestamp
            if (sortBy === 'oldest') return a.timestamp - b.timestamp
            if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '')
            return 0
        })

        return result
    }, [history, filterBy, searchQuery, sortBy])

    const handleClearHistory = () => {
        if (confirm("Are you sure you want to clear your history?")) {
            clearHistory()
            toast.success("History cleared")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[90vw] max-w-[650px] max-h-[85vh] bg-slate-950/90 backdrop-blur-xl border-white/10 text-white shadow-2xl p-0 gap-0 overflow-hidden rounded-2xl flex flex-col">

                {/* Header */}
                <div className="p-4 md:p-6 border-b border-white/5 space-y-4 bg-black/20 flex-shrink-0 z-10">
                    <div className="flex items-center justify-between gap-4">
                        <DialogTitle className="text-lg md:text-xl font-semibold flex items-center gap-2 min-w-0">
                            <Clock className="w-5 h-5 text-blue-400 flex-shrink-0" />
                            <span className="truncate">Recognition History</span>
                        </DialogTitle>
                        {history.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearHistory}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-3 text-xs uppercase tracking-wider font-medium flex-shrink-0"
                            >
                                Clear All
                            </Button>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search songs..."
                                className="pl-9 bg-black/20 border-white/10 focus:border-blue-500/50 h-9 text-sm w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={sortBy} onValueChange={(v: string) => setSortBy(v as SortOption)}>
                                <SelectTrigger className="flex-1 sm:w-[110px] h-9 bg-black/20 border-white/10 text-xs">
                                    <ArrowUpDown className="w-3 h-3 mr-2" />
                                    <SelectValue placeholder="Sort" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest</SelectItem>
                                    <SelectItem value="oldest">Oldest</SelectItem>
                                    <SelectItem value="title">Title</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterBy} onValueChange={(v: string) => setFilterBy(v as FilterOption)}>
                                <SelectTrigger className="flex-1 sm:w-[110px] h-9 bg-black/20 border-white/10 text-xs">
                                    <Filter className="w-3 h-3 mr-2" />
                                    <SelectValue placeholder="Filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sources</SelectItem>
                                    <SelectItem value="spotify">Spotify</SelectItem>
                                    <SelectItem value="youtube">YouTube</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1 min-h-0 bg-[#0A0A0A] w-full [&>[data-radix-scroll-area-viewport]]:!block">
                    <div className="p-4 space-y-3 w-full">
                        {filteredAndSortedHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                                    <Music2 className="w-10 h-10 text-slate-600" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-medium text-white">No history found</h3>
                                    <p className="text-sm text-slate-500 max-w-[250px]">
                                        {history.length === 0
                                            ? "You haven't recognized any songs yet. Start listening!"
                                            : "No matches for your search filters."}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            filteredAndSortedHistory.map((item) => (
                                <div
                                    key={item.id}
                                    className="group relative flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all w-full max-w-full box-border sm:h-[100px]"
                                >
                                    <div className="flex items-start gap-3 sm:gap-4 w-full h-full min-w-0">
                                        {/* Album Art */}
                                        <div className="relative w-10 h-10 sm:w-[74px] sm:h-[74px] rounded-lg bg-slate-800 overflow-hidden shadow-lg flex-shrink-0">
                                            {(() => {
                                                const youtubeId = item.external_metadata?.youtube?.vid
                                                const imageUrl =
                                                    item.album?.cover ||
                                                    item.album?.covers?.large ||
                                                    item.album?.covers?.medium ||
                                                    item.album?.covers?.small ||
                                                    item.external_metadata?.spotify?.album?.images?.[0]?.url ||
                                                    item.external_metadata?.spotify?.album?.images?.[1]?.url ||
                                                    (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : null) ||
                                                    (item.external_metadata?.deezer?.album?.id ? `https://api.deezer.com/album/${item.external_metadata.deezer.album.id}/image` : null)

                                                return imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none'
                                                            e.currentTarget.parentElement?.classList.add('fallback-active')
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full w-full">
                                                        <Music2 className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600" />
                                                    </div>
                                                )
                                            })()}

                                            {/* Fallback Element */}
                                            <div className="hidden fallback-active:flex absolute inset-0 items-center justify-center bg-slate-800">
                                                <Music2 className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600" />
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                                            <div className="space-y-0.5">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="font-semibold text-white truncate text-sm sm:text-base leading-tight min-w-0 flex-1" title={item.title}>
                                                        {item.title}
                                                    </h4>
                                                    <span className="text-[10px] text-slate-500 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-xs sm:text-sm text-blue-400 font-medium truncate leading-tight" title={item.artists?.[0]?.name}>
                                                    {item.artists?.[0]?.name}
                                                </p>
                                                <p className="text-[10px] sm:text-xs text-slate-500 truncate leading-tight" title={item.album?.name}>
                                                    {item.album?.name}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 mt-auto pt-1">
                                                {item.external_metadata?.spotify && (
                                                    <Badge variant="secondary" className="bg-[#1DB954]/10 text-[#1DB954] hover:bg-[#1DB954]/20 border-0 gap-1 text-[10px] cursor-pointer h-5 sm:h-5 px-2" onClick={(e) => { e.stopPropagation(); window.open(`https://open.spotify.com/track/${item.external_metadata?.spotify?.track.id}`, '_blank'); }}>
                                                        Spotify
                                                    </Badge>
                                                )}
                                                {item.external_metadata?.youtube && (
                                                    <Badge variant="secondary" className="bg-[#FF0000]/10 text-[#FF0000] hover:bg-[#FF0000]/20 border-0 gap-1 text-[10px] cursor-pointer h-5 sm:h-5 px-2" onClick={(e) => { e.stopPropagation(); window.open(`https://www.youtube.com/watch?v=${item.external_metadata?.youtube?.vid}`, '_blank'); }}>
                                                        YouTube
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        {/* Loading Indicator */}
                        {isLoadingHistory && (
                            <div className="py-4 flex justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            </div>
                        )}

                        {/* Sentinel for infinite scroll */}
                        {hasMore && (
                            <div ref={observerTarget} className="h-4 w-full" />
                        )}

                        {!hasMore && history.length > 0 && (
                            <div className="py-4 text-center text-xs text-slate-600">
                                End of history
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
