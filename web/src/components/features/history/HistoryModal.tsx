import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState, useMemo, useRef } from "react"
import { formatDistanceToNow } from "date-fns"
import { Music2, Search, Filter, ArrowUpDown, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useRecognitionStore } from "@/store/useRecognitionStore"
import { Badge } from "@/components/ui/badge"
import { RemoteAlbumImage } from "@/components/ui/remote-album-image"

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
            result = result.filter((item) => {
                const artistBlob = (item.artists || []).map((a) => a.name).join(' ').toLowerCase()
                const albumName = (item.album?.name || '').toLowerCase()
                return (
                    (item.title || '').toLowerCase().includes(query) ||
                    artistBlob.includes(query) ||
                    albumName.includes(query)
                )
            })
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
            <DialogContent className="w-[94vw] max-w-[820px] max-h-[85vh] bg-slate-950/90 backdrop-blur-xl border-white/10 text-white shadow-2xl p-0 gap-0 overflow-hidden rounded-2xl flex flex-col">

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
                                <SelectTrigger className="flex-1 sm:w-[130px] h-9 bg-black/20 border-white/10 text-xs">
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
                                <SelectTrigger className="flex-1 sm:w-[150px] h-9 bg-black/20 border-white/10 text-xs">
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
                <ScrollArea className="flex-1 min-h-0 bg-[#0A0A0A] w-full overflow-x-hidden [&>[data-radix-scroll-area-viewport]]:!block">
                    <div className="p-4 pr-5 sm:pr-4 space-y-3 w-full max-w-full overflow-x-hidden box-border">
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
                            filteredAndSortedHistory.map((item) => {
                                const artistLine = (item.artists || []).map((a) => a.name).filter(Boolean).join(', ') || 'Unknown artist'
                                const releaseStr = item.release_date || item.album?.release_date
                                const genreStr =
                                    Array.isArray(item.genres) && item.genres.length > 0
                                        ? item.genres
                                              .map((g) => (typeof g === 'string' ? g : g.name))
                                              .filter(Boolean)
                                              .join(', ')
                                        : ''
                                return (
                                <div
                                    key={item.id}
                                    className="group relative flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all w-full max-w-full min-w-0 box-border overflow-x-clip"
                                >
                                    <div className="flex items-start gap-3 sm:gap-4 w-full min-w-0 max-w-full">
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
                                                    <RemoteAlbumImage
                                                        src={imageUrl}
                                                        alt={item.title ?? 'Album art'}
                                                        sizes="(max-width: 640px) 40px, 74px"
                                                        className="object-cover"
                                                        fallback={
                                                            <div className="flex h-full w-full items-center justify-center bg-slate-800">
                                                                <Music2 className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600" />
                                                            </div>
                                                        }
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full w-full">
                                                        <Music2 className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600" />
                                                    </div>
                                                )
                                            })()}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 max-w-full flex flex-col gap-2">
                                            <div className="space-y-1 min-w-0 max-w-full">
                                                <h4 className="font-semibold text-white text-sm sm:text-base leading-snug min-w-0 break-words [overflow-wrap:anywhere] hyphens-auto">
                                                    {item.title}
                                                </h4>
                                                <p className="text-xs sm:text-sm text-blue-400 font-medium leading-snug min-w-0 break-words [overflow-wrap:anywhere] hyphens-auto">
                                                    {artistLine}
                                                </p>
                                                {item.album?.name ? (
                                                    <p className="text-[10px] sm:text-xs text-slate-400 leading-snug min-w-0 break-words [overflow-wrap:anywhere]">
                                                        <span className="text-slate-500">Album · </span>
                                                        {item.album.name}
                                                    </p>
                                                ) : null}
                                                {releaseStr ? (
                                                    <p className="text-[10px] sm:text-xs text-slate-500 leading-snug break-words [overflow-wrap:anywhere]">
                                                        Released · {releaseStr}
                                                    </p>
                                                ) : null}
                                                {genreStr ? (
                                                    <p className="text-[10px] sm:text-xs text-slate-500 leading-snug break-words [overflow-wrap:anywhere]">
                                                        Genre · {genreStr}
                                                    </p>
                                                ) : null}
                                                {item.label ? (
                                                    <p className="text-[10px] sm:text-xs text-slate-500 leading-snug break-words [overflow-wrap:anywhere]">
                                                        Label · {item.label}
                                                    </p>
                                                ) : null}
                                            </div>

                                            {/* Links + time: stable layout — no horizontal overflow */}
                                            <div className="flex w-full min-w-0 max-w-full flex-col gap-2 pt-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                                                <div className="flex min-w-0 max-w-full flex-1 flex-wrap items-center gap-1.5 content-start">
                                                    {item.external_metadata?.spotify?.track?.id && (
                                                        <Badge variant="secondary" className="bg-[#1DB954]/10 text-[#1DB954] hover:bg-[#1DB954]/20 border-0 gap-1 text-[10px] cursor-pointer h-5 px-2" onClick={(e) => { e.stopPropagation(); const id = item.external_metadata?.spotify?.track?.id; if (id) window.open(`https://open.spotify.com/track/${id}`, '_blank'); }}>
                                                            Spotify
                                                        </Badge>
                                                    )}
                                                    {item.external_metadata?.youtube?.vid && (
                                                        <Badge variant="secondary" className="bg-[#FF0000]/10 text-[#FF0000] hover:bg-[#FF0000]/20 border-0 gap-1 text-[10px] cursor-pointer h-5 px-2" onClick={(e) => { e.stopPropagation(); const vid = item.external_metadata?.youtube?.vid; if (vid) window.open(`https://www.youtube.com/watch?v=${vid}`, '_blank'); }}>
                                                            YouTube
                                                        </Badge>
                                                    )}
                                                    {item.external_metadata?.applemusic?.track?.id && (
                                                        <Badge variant="secondary" className="bg-[#FA243C]/10 text-[#FA243C] hover:bg-[#FA243C]/20 border-0 gap-1 text-[10px] cursor-pointer h-5 px-2" onClick={(e) => { e.stopPropagation(); const id = item.external_metadata?.applemusic?.track?.id; if (id) window.open(`https://music.apple.com/us/album/${id}`, '_blank'); }}>
                                                            Apple Music
                                                        </Badge>
                                                    )}
                                                    {item.external_metadata?.deezer?.track?.id && (
                                                        <Badge variant="secondary" className="bg-[#00C7F2]/10 text-[#00C7F2] hover:bg-[#00C7F2]/20 border-0 gap-1 text-[10px] cursor-pointer h-5 px-2" onClick={(e) => { e.stopPropagation(); const id = item.external_metadata?.deezer?.track?.id; if (id) window.open(`https://www.deezer.com/track/${id}`, '_blank'); }}>
                                                            Deezer
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex w-full min-w-0 shrink-0 items-start gap-1.5 border-t border-white/10 pt-2 text-[10px] text-slate-500 sm:w-auto sm:max-w-[min(100%,14rem)] sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
                                                    <Calendar className="mt-0.5 h-3 w-3 shrink-0 opacity-80" aria-hidden />
                                                    <span className="min-w-0 flex-1 leading-snug break-words [overflow-wrap:anywhere]">
                                                        Recognized {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                )
                            })
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
