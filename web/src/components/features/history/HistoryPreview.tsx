'use client'

import { Music2, Clock, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { CookieHistoryItem } from '@/lib/cookies'
import { motion } from 'framer-motion'

interface HistoryPreviewProps {
    history: CookieHistoryItem[]
    onOpenHistory: () => void
}

export function HistoryPreview({ history, onOpenHistory }: HistoryPreviewProps) {
    // Show placeholder if no history
    if (history.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl mt-20"
            >
                <div className="flex items-center justify-between mb-6 px-4 md:px-0">
                    <h2 className="text-[24px] font-semibold text-white">
                        Recent Recognitions
                    </h2>
                </div>
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 border border-white/5 rounded-xl bg-[#111]/50 backdrop-blur-sm">
                    <Music2 className="w-12 h-12 text-slate-700 mb-2" />
                    <p className="text-[16px] text-gray-300">No songs recognized yet. Try recording!</p>
                </div>
            </motion.div>
        )
    }

    const recentItems = history.slice(0, 5)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[100vw] md:max-w-5xl mt-20 pl-4 md:pl-0"
        >
            <div className="flex items-center justify-between mb-6 pr-4 md:pr-0">
                <h2 className="text-[24px] font-semibold text-white">
                    Recent Recognitions
                </h2>
                <Button
                    variant="link"
                    className="text-blue-400 hover:text-blue-300 text-sm p-0 h-auto gap-1"
                    onClick={onOpenHistory}
                >
                    See all <ArrowRight className="w-4 h-4" />
                </Button>
            </div>

            <ScrollArea className="w-full whitespace-nowrap pb-4">
                <div className="flex w-max space-x-5">
                    {recentItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={onOpenHistory}
                            className="flex-shrink-0 w-[200px] p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group cursor-pointer"
                        >
                            <div className="relative aspect-square rounded-lg bg-slate-800 mb-4 overflow-hidden">
                                {item.external_metadata?.spotify?.album?.images?.[0]?.url ? (
                                    <img
                                        src={item.external_metadata.spotify.album.images[0].url}
                                        alt={item.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-900">
                                        <Music2 className="h-10 w-10 text-slate-600" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1 mb-4">
                                <h3 className="font-semibold text-white text-[15px] truncate leading-tight" title={item.title}>{item.title}</h3>
                                <p className="text-[13px] text-gray-400 truncate" title={item.artists?.[0]?.name}>{item.artists?.[0]?.name}</p>
                                <p className="text-[11px] text-gray-500 pt-1">
                                    Recognized {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                {item.external_metadata?.spotify?.track?.id && (
                                    <Button
                                        size="sm"
                                        className="flex-1 h-8 bg-[#1DB954] hover:bg-[#1ed760] text-black text-[10px] font-bold px-0"
                                        onClick={() => window.open(`https://open.spotify.com/track/${item.external_metadata?.spotify?.track.id}`, '_blank')}
                                    >
                                        Spotify
                                    </Button>
                                )}
                                {item.external_metadata?.youtube?.vid && (
                                    <Button
                                        size="sm"
                                        className="flex-1 h-8 bg-[#FF0000] hover:bg-[#ff1a1a] text-white text-[10px] font-bold px-0"
                                        onClick={() => window.open(`https://www.youtube.com/watch?v=${item.external_metadata?.youtube?.vid}`, '_blank')}
                                    >
                                        YouTube
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" className="bg-white/10" />
            </ScrollArea>
        </motion.div>
    )
}
