'use client'

import { RecorderButton } from '@/components/features/recorder'
import { useState, useEffect } from 'react'
import { useRecognitionStore } from '@/store/useRecognitionStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Music2, AlertCircle, Calendar, Disc, Globe, Share2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Navbar } from '@/components/layout/Navbar'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'

interface HistoryItem {
  id: string
  title: string
  artist: string
  album_art_url: string | null
  created_at: string
}

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { result, error, setMusic, setError, reset } = useRecognitionStore()
  const [recentHistory, setRecentHistory] = useState<HistoryItem[]>([])
  const supabase = createBrowserSupabaseClient()

  // Fetch recent history for preview
  useEffect(() => {
    const fetchRecent = async () => {
      if (!supabase) return
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
        if (data) setRecentHistory(data)
      }
    }
    fetchRecent()
  }, [])

  // Handle real-time chunks
  const handleDataAvailable = async (blob: Blob) => {
    if (isAnalyzing || result) return

    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('audio', blob)

      const response = await fetch('/api/recognize', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.metadata?.music?.length > 0) {
        const music = data.metadata.music[0]
        setMusic(music)
      }
    } catch (error) {
      console.error('Recognition error (chunk):', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleRecordingComplete = async (blob: Blob) => {
    if (result) return

    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('audio', blob)

      const response = await fetch('/api/recognize', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.metadata?.music?.length > 0) {
        const music = data.metadata.music[0]
        setMusic(music)
      } else {
        setError('No match found. Try getting closer to the source.')
      }
    } catch (error) {
      console.error('Recognition error:', error)
      setError('Failed to process audio. Please check your connection.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Reset state on mount
  useEffect(() => {
    reset()
  }, [reset])

  const music = result?.metadata?.music?.[0]

  return (
    <main className="flex min-h-screen flex-col relative overflow-hidden">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-24 pt-20">
        <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-12">

          {/* Hero Text - Fade out when result found */}
          <AnimatePresence>
            {!result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-4"
              >
                <h1 className="text-4xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-xy">
                  SoundLens
                </h1>
                <p className="text-white/60 text-lg md:text-xl max-w-[600px] mx-auto font-light">
                  Record a moment. Discover the music behind it.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recorder Button - Center Stage */}
          <div className="flex flex-col items-center gap-8 w-full max-w-2xl relative min-h-[300px] justify-center">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key="recorder"
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="z-20 flex flex-col items-center gap-12"
                >
                  <RecorderButton
                    onRecordingComplete={handleRecordingComplete}
                    onDataAvailable={handleDataAvailable}
                  />

                  {/* Recent History Preview */}
                  {recentHistory.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full max-w-md mt-8"
                    >
                      <div className="flex items-center gap-2 text-white/40 mb-4 text-xs uppercase tracking-widest font-semibold">
                        <Clock className="w-3 h-3" /> Recent Recognitions
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {recentHistory.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                            <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center overflow-hidden">
                              {item.album_art_url ? (
                                <img src={item.album_art_url} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <Music2 className="w-4 h-4 text-slate-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-white text-sm truncate">{item.title}</h4>
                              <p className="text-xs text-white/40 truncate">{item.artist}</p>
                            </div>
                            <span className="text-[10px] text-white/20">
                              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="result-card"
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-full max-w-3xl"
                >
                  <Card className="bg-black/40 backdrop-blur-xl border-white/10 overflow-hidden shadow-2xl">
                    <CardContent className="p-0">
                      <div className="grid md:grid-cols-[300px_1fr] gap-0">
                        {/* Album Art Section */}
                        <div className="relative h-[300px] md:h-auto bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-8">
                          {music?.external_metadata?.spotify?.album?.images?.[0]?.url ? (
                            <div className="w-full aspect-square rounded-xl shadow-2xl shadow-black/50 relative overflow-hidden group">
                              <img
                                src={music.external_metadata.spotify.album.images[0].url}
                                alt={music.title || 'Album Art'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-48 h-48 rounded-full bg-slate-800 flex items-center justify-center">
                              <Music2 className="w-16 h-16 text-slate-600" />
                            </div>
                          )}
                        </div>

                        {/* Details Section */}
                        <div className="p-8 flex flex-col justify-center space-y-6">
                          <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">{music?.title}</h2>
                            <p className="text-xl text-blue-400 font-medium">{music?.artists?.[0]?.name}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm text-white/60">
                            <div className="flex items-center gap-2">
                              <Disc className="w-4 h-4" />
                              <span className="truncate">{music?.album?.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{music?.release_date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              <span>{music?.genres?.[0]?.name || 'Unknown Genre'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Share2 className="w-4 h-4" />
                              <span>{music?.label || 'Independent'}</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 pt-4">
                            <div className="flex gap-3">
                              {music?.external_metadata?.spotify && (
                                <Button
                                  className="flex-1 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold h-12"
                                  onClick={() => window.open(`https://open.spotify.com/track/${music.external_metadata?.spotify?.track.id}`, '_blank')}
                                >
                                  Play on Spotify
                                </Button>
                              )}
                              {music?.external_metadata?.youtube?.vid ? (
                                <Button
                                  className="flex-1 bg-[#FF0000] hover:bg-[#ff1a1a] text-white font-bold h-12"
                                  onClick={() => window.open(`https://www.youtube.com/watch?v=${music.external_metadata?.youtube?.vid}`, '_blank')}
                                >
                                  Watch Video
                                </Button>
                              ) : (
                                <Button
                                  className="flex-1 bg-[#FF0000] hover:bg-[#ff1a1a] text-white font-bold h-12"
                                  onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(`${music?.title} ${music?.artists?.[0]?.name}`)}`, '_blank')}
                                >
                                  Search YouTube
                                </Button>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              className="w-full border-white/10 hover:bg-white/10 h-12"
                              onClick={reset}
                            >
                              Scan Another Song
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Toast / Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute -bottom-20 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-md"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </main>
  )
}
