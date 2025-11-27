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
    const releaseDate = music.release_date || music.album?.release_date
    const label = music.label || music.album?.label
    const genres = music.genres?.map((g: any) => typeof g === 'string' ? g : g.name).join(', ')

    // Image Logic: Try Spotify high-res first, then Album covers (large -> medium), then generic cover
    const spotifyImg = music.external_metadata?.spotify?.album?.images?.[0]?.url
    const largeCover = music.album?.covers?.large
    const mediumCover = music.album?.covers?.medium
    const genericCover = music.album?.cover

    console.log('Cover Debug:', { spotifyImg, largeCover, mediumCover, genericCover })

    const imageUrl = spotifyImg || largeCover || mediumCover || genericCover

    // Links
    const spotifyId = music.external_metadata?.spotify?.track?.id
    const youtubeId = music.external_metadata?.youtube?.vid
    const appleMusicId = music.external_metadata?.applemusic?.track?.id
    const deezerId = music.external_metadata?.deezer?.track?.id

    // Contributors (Composers, Lyricists)
    const contributors = music.contributors || music.works?.[0]?.contributors

    return (
        <div className="relative w-full max-w-5xl mx-auto">
            {/* Blurred Background Layer */}
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
                <Card className="relative overflow-hidden border-none shadow-2xl bg-[#0f172a]/80 backdrop-blur-xl text-white">
                    {/* Close/Scan New Button - Top Right */}
                    <div className="absolute top-4 right-4 z-20">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white/50 hover:text-white hover:bg-white/10 rounded-full"
                            onClick={onReset}
                            title="Scan another song"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </div>

                    <div className="flex flex-col md:flex-row">
                        {/* Left Side - Album Art */}
                        <div className="w-full md:w-[400px] p-6 md:p-8 flex-shrink-0 flex flex-col items-center bg-black/20 border-b md:border-b-0 md:border-r border-white/5">
                            <div className="relative w-full max-w-[340px] aspect-square rounded-xl overflow-hidden shadow-2xl group mb-6">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        onError={(e) => {
                                            // Fallback if image fails to load
                                            e.currentTarget.style.display = 'none'
                                            e.currentTarget.parentElement?.classList.add('fallback-active')
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900/50 to-slate-900/50 backdrop-blur-sm border border-white/10">
                                        <Music className="h-20 w-20 text-white/20 mb-4" />
                                        <span className="text-xs text-white/30 font-medium uppercase tracking-widest">No Cover</span>
                                    </div>
                                )}

                                {/* Fallback Element (Hidden by default, shown via JS if img fails) */}
                                <div className="hidden fallback-active:flex absolute inset-0 flex-col items-center justify-center bg-gradient-to-br from-indigo-900/50 to-slate-900/50 backdrop-blur-sm">
                                    <Music className="h-20 w-20 text-white/20 mb-4" />
                                </div>
                            </div>

                            {/* Listen Links */}
                            <div className="w-full grid grid-cols-2 gap-3">
                                {spotifyId && (
                                    <Button
                                        className="bg-[#1DB954] hover:bg-[#1ed760] text-white h-10 text-sm font-semibold shadow-lg shadow-green-900/20"
                                        onClick={() => window.open(`https://open.spotify.com/track/${spotifyId}`, '_blank')}
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" /> Spotify
                                    </Button>
                                )}
                                {youtubeId && (
                                    <Button
                                        className="bg-[#FF0000] hover:bg-[#ff3333] text-white h-10 text-sm font-semibold shadow-lg shadow-red-900/20"
                                        onClick={() => window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank')}
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" /> YouTube
                                    </Button>
                                )}
                                {appleMusicId && (
                                    <Button
                                        className="bg-[#FA243C] hover:bg-[#fb4559] text-white h-10 text-sm font-semibold shadow-lg shadow-red-900/20"
                                        onClick={() => window.open(`https://music.apple.com/us/album/${appleMusicId}`, '_blank')}
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" /> Apple Music
                                    </Button>
                                )}
                                {deezerId && (
                                    <Button
                                        className="bg-[#00C7F2] hover:bg-[#33d2f4] text-white h-10 text-sm font-semibold shadow-lg shadow-blue-900/20"
                                        onClick={() => window.open(`https://www.deezer.com/track/${deezerId}`, '_blank')}
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" /> Deezer
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Right Side - Details */}
                        <div className="flex-1 p-6 md:p-10 flex flex-col">
                            <div className="space-y-6">
                                {/* Header Info */}
                                <div className="space-y-2 pr-12"> {/* Padding for close button */}
                                    <h1 className="text-3xl md:text-5xl font-bold leading-tight" title={title}>
                                        {title}
                                    </h1>
                                    <p className="text-xl md:text-3xl text-blue-400 font-medium">
                                        {artist}
                                    </p>
                                    {album && title !== album && (
                                        <p className="text-lg text-slate-400">
                                            Album: <span className="text-slate-200">{album}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Metadata Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-t border-white/10">
                                    {releaseDate && (
                                        <div>
                                            <h3 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Released</h3>
                                            <p className="text-slate-200">{releaseDate}</p>
                                        </div>
                                    )}
                                    {genres && (
                                        <div>
                                            <h3 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Genre</h3>
                                            <p className="text-slate-200">{genres}</p>
                                        </div>
                                    )}
                                    {label && (
                                        <div className="sm:col-span-2">
                                            <h3 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Label</h3>
                                            <p className="text-slate-200">{label}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Contributors Section */}
                                {contributors && contributors.length > 0 && (
                                    <div className="py-6 border-t border-white/10">
                                        <h3 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-4">Credits</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {contributors.slice(0, 6).map((c: any, i: number) => (
                                                <div key={i} className="flex flex-col">
                                                    <span className="text-slate-200 font-medium">{c.name}</span>
                                                    <span className="text-xs text-slate-500">{c.roles?.join(', ') || 'Contributor'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Mobile Scan Button (if needed, but top-right is better) */}
                                <div className="md:hidden pt-4 flex justify-center">
                                    <Button
                                        variant="outline"
                                        className="w-full border-white/10 hover:bg-white/5 text-white"
                                        onClick={onReset}
                                    >
                                        Scan Another Song
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
