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

    return (
        <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-background to-secondary/20 flex flex-col items-center">
            <div className="w-full max-w-2xl space-y-8">
                <Button variant="ghost" onClick={() => router.push('/')} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Recorder
                </Button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="overflow-hidden border-none shadow-2xl bg-card/50 backdrop-blur-xl">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                <Music className="h-16 w-16 text-primary" />
                            </div>
                            <CardTitle className="text-3xl md:text-4xl font-bold">{title}</CardTitle>
                            <p className="text-xl text-muted-foreground">{artist}</p>
                            {album && <p className="text-sm text-muted-foreground/80">{album}</p>}
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {spotifyId && (
                                    <Button
                                        className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white"
                                        onClick={() => window.open(`https://open.spotify.com/track/${spotifyId}`, '_blank')}
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" /> Play on Spotify
                                    </Button>
                                )}
                                {youtubeId && (
                                    <Button
                                        className="w-full bg-[#FF0000] hover:bg-[#ff3333] text-white"
                                        onClick={() => window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank')}
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" /> Watch on YouTube
                                    </Button>
                                )}
                            </div>

                            <div className="flex justify-center pt-4">
                                <Button variant="outline" size="sm" onClick={() => {
                                    navigator.share?.({
                                        title: `Found "${title}" by ${artist}`,
                                        text: `I found this song using Music Identifier!`,
                                        url: window.location.href
                                    }).catch(() => { })
                                }}>
                                    <Share2 className="mr-2 h-4 w-4" /> Share Result
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </main>
    )
}
