'use client'

import { useRecognitionStore } from '@/store/useRecognitionStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Music, ExternalLink, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ResultPage() {
    const result = useRecognitionStore((state) => state.result)
    const router = useRouter()

    useEffect(() => {
        if (!result) {
            router.push('/')
        }
    }, [result, router])

    if (!result) return null

    const music = result.metadata?.music?.[0]

    if (!music) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-4">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">No match found</h1>
                    <p className="text-muted-foreground">We couldn&apos;t identify that song. Try again?</p>
                </div>
                <Button onClick={() => router.push('/')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Try Again
                </Button>
            </div>
        )
    }

    const title = music.title
    const artist = music.artists?.map(a => a.name).join(', ')
    const album = music.album?.name
    const spotifyId = music.external_metadata?.spotify?.track?.id
    const youtubeId = music.external_metadata?.youtube?.vid
    const releaseDate = music.release_date
    const label = music.label
    const genres = music.genres?.map(g => g.name).join(', ')
    const imageUrl = music.external_metadata?.spotify?.album?.images?.[0]?.url

    return (
        <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-background to-secondary/20 flex flex-col items-center justify-center">
            <div className="w-full max-w-5xl space-y-8">
                <Button variant="ghost" onClick={() => router.push('/')} className="mb-4 hover:bg-white/10">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Recorder
                </Button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="overflow-hidden border-none shadow-2xl bg-[#0f172a] text-white">
                        <div className="flex flex-col md:flex-row">
                            {/* Left Side - Album Art with Padding */}
                            <div className="w-full md:w-[400px] p-6 flex-shrink-0 bg-[#0f172a]">
                                <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-2xl bg-black/20">
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                            <Music className="h-24 w-24 text-slate-600" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Side - Details */}
                            <div className="flex-1 p-6 md:p-10 flex flex-col justify-center bg-[#0f172a]">
                                <div className="space-y-6">
                                    <div>
                                        <h1 className="text-3xl md:text-5xl font-bold mb-2 leading-tight">{title}</h1>
                                        {album && title !== album && (
                                            <p className="text-xl text-slate-400 mb-2">(From "{album}")</p>
                                        )}
                                        <p className="text-xl md:text-2xl text-blue-400 font-medium">{artist}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400">
                                        {releaseDate && (
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Released:</span> {releaseDate}
                                            </div>
                                        )}
                                        {label && (
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Label:</span> {label}
                                            </div>
                                        )}
                                        {genres && (
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Genre:</span> {genres}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-4 pt-4">
                                        {spotifyId && (
                                            <Button
                                                className="flex-1 bg-[#1DB954] hover:bg-[#1ed760] text-white h-12 text-base font-semibold"
                                                onClick={() => window.open(`https://open.spotify.com/track/${spotifyId}`, '_blank')}
                                            >
                                                <ExternalLink className="mr-2 h-5 w-5" /> Play on Spotify
                                            </Button>
                                        )}
                                        {youtubeId && (
                                            <Button
                                                className="flex-1 bg-[#FF0000] hover:bg-[#ff3333] text-white h-12 text-base font-semibold"
                                                onClick={() => window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank')}
                                            >
                                                <ExternalLink className="mr-2 h-5 w-5" /> Search YouTube
                                            </Button>
                                        )}
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full h-12 border-white/10 hover:bg-white/5 text-slate-300 hover:text-white"
                                        onClick={() => router.push('/')}
                                    >
                                        Scan Another Song
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </main>
    )
}
