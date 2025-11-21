import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Music, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'

interface ResultCardProps {
    result: any
    onReset: () => void
    onBack?: () => void
}

export function ResultCard({ result, onReset, onBack }: ResultCardProps) {
    const music = result?.metadata?.music?.[0]

    if (!music) return null

    const title = music.title
    const artist = music.artists?.map((a: any) => a.name).join(', ')
    const album = music.album?.name
    const spotifyId = music.external_metadata?.spotify?.track?.id
    const youtubeId = music.external_metadata?.youtube?.vid
    const releaseDate = music.release_date
    const label = music.label
    const genres = music.genres?.map((g: any) => g.name).join(', ')
    const imageUrl = music.external_metadata?.spotify?.album?.images?.[0]?.url

    return (
        <div className="relative w-full max-w-5xl mx-auto">
            {/* Blurred Background Layer - Local to the card area */}
            {imageUrl && (
                <div
                    className="absolute inset-0 z-0 opacity-40 blur-[80px] scale-105 rounded-3xl overflow-hidden"
                    style={{
                        backgroundImage: `url(${imageUrl})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover'
                    }}
                />
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
            >
                <Card className="overflow-hidden border-none shadow-2xl bg-[#0f172a]/80 backdrop-blur-xl text-white">
                    <div className="flex flex-col md:flex-row">
                        {/* Left Side - Album Art */}
                        <div className="w-full md:w-[380px] p-6 md:p-8 flex-shrink-0 flex flex-col items-center justify-center bg-black/20 border-b md:border-b-0 md:border-r border-white/5">
                            <div className="relative w-full max-w-[320px] aspect-square rounded-xl overflow-hidden shadow-2xl group">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                        <Music className="h-1/3 w-1/3 text-slate-600 opacity-50" />
                                    </div>
                                )}

                                {/* Waveform Overlay Animation */}
                                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-6">
                                    <div className="flex items-end gap-1 h-8">
                                        {[...Array(5)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="w-1 bg-white/80 rounded-full"
                                                animate={{
                                                    height: [10, 24, 10],
                                                    opacity: [0.5, 1, 0.5]
                                                }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    delay: i * 0.1,
                                                    ease: "easeInOut"
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Details */}
                        <div className="flex-1 p-6 md:p-12 flex flex-col justify-center">
                            <div className="space-y-6 md:space-y-8">
                                <div className="space-y-2 md:space-y-3">
                                    <h1 className="text-2xl md:text-4xl font-bold leading-tight line-clamp-2" title={title}>
                                        {title}
                                    </h1>
                                    {album && title !== album && (
                                        <p className="text-lg text-slate-400 line-clamp-1">
                                            From <span className="text-slate-300">"{album}"</span>
                                        </p>
                                    )}
                                    <p className="text-xl md:text-2xl text-blue-400 font-medium">
                                        {artist}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400 border-t border-white/10 pt-6">
                                    {releaseDate && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                            <span>{releaseDate.split('-')[0]}</span>
                                        </div>
                                    )}
                                    {genres && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                            <span>{genres}</span>
                                        </div>
                                    )}
                                    {label && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                            <span className="truncate max-w-[200px]" title={label}>{label}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6 pt-2">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {spotifyId && (
                                            <Button
                                                className="flex-1 bg-[#1DB954] hover:bg-[#1ed760] text-white h-12 text-base font-semibold shadow-lg shadow-green-900/20 transition-all hover:scale-[1.02]"
                                                onClick={() => window.open(`https://open.spotify.com/track/${spotifyId}`, '_blank')}
                                            >
                                                <ExternalLink className="mr-2 h-5 w-5" /> Spotify
                                            </Button>
                                        )}
                                        {youtubeId && (
                                            <Button
                                                className="flex-1 bg-[#FF0000] hover:bg-[#ff3333] text-white h-12 text-base font-semibold shadow-lg shadow-red-900/20 transition-all hover:scale-[1.02]"
                                                onClick={() => window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank')}
                                            >
                                                <ExternalLink className="mr-2 h-5 w-5" /> YouTube
                                            </Button>
                                        )}
                                    </div>

                                    <div className="flex justify-center pt-2">
                                        <Button
                                            variant="ghost"
                                            className="text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                            onClick={onReset}
                                        >
                                            Scan Another Song
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
