'use client'

import { RecorderButton } from '@/components/features/recorder'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRecognitionStore } from '@/store/useRecognitionStore'
import { useRecorder } from '@/hooks/useRecorder'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { HistoryModal } from '@/components/features/history/HistoryModal'
import { ResultCard } from '@/components/features/result/ResultCard'
import {
  getRecognitionUiState,
  RECOGNITION_HELPER_TEXT,
  RECOGNITION_STATUS_LABELS,
  RECOGNITION_STEPS,
  RECOGNITION_TIP,
  RECENT_RECOGNITIONS_HOME_PREVIEW,
} from '@/lib/ui/recognition-ui'

import { Navbar } from '@/components/layout/Navbar'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { getAnonymousId } from '@/lib/storage'
import { ArrowRight, ChevronDown, ChevronUp, Lightbulb, Music2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { RemoteAlbumImage } from '@/components/ui/remote-album-image'

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isRecorderVisualActive, setIsRecorderVisualActive] = useState(false)
  const { result, error, setMusic, reset, history, loadHistory } = useRecognitionStore()
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [hadNoMatch, setHadNoMatch] = useState(false)
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)
  const [isFirstVisitHintVisible, setIsFirstVisitHintVisible] = useState(false)
  const supabase = createBrowserSupabaseClient()
  const FIRST_VISIT_HINT_KEY = 'soundlens:first-visit-hint-seen'

  // Load history from cookies on mount
  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  // Sync with Supabase if logged in (optional, for now we rely on cookies for anonymous)
  useEffect(() => {
    const syncHistory = async () => {
      if (!supabase) return
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Merge anonymous history if exists
        const anonId = getAnonymousId()
        if (anonId) {
          await supabase.rpc('merge_anonymous_history', { anon_id: anonId })
          // We don't clear the anon ID from local storage immediately as it might be used for other things,
          // but the DB records are now owned by the user.
        }
      }
    }
    syncHistory()
  }, [supabase])

  // Handle real-time chunks
  const isRequestPending = useRef(false)

  const handleDataAvailable = useCallback(async (chunk: Blob) => {
    // call original logic but we need to stop
    // Let's just rewrite handleDataAvailable here to be self-contained
    if (useRecognitionStore.getState().result) return

    if (isRequestPending.current) return

    setIsAnalyzing(true)
    isRequestPending.current = true

    try {
      console.log(`[Page] Sending request with blob size: ${chunk.size} bytes`)
      const formData = new FormData()
      formData.append('audio', chunk)

      const response = await fetch('/api/recognize', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if (response.ok && data.metadata?.music?.length > 0) {
        const music = data.metadata.music[0]
        setHadNoMatch(false)
        setIsRecorderVisualActive(false)
        setMusic(music)
        toast.success('Song identified and saved to history.')
        stopRecordingRef.current() // Use the Ref!
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsAnalyzing(false)
      isRequestPending.current = false
    }
  }, [setMusic])

  const stopRecordingRef = useRef<() => void>(() => { })

  const handleRecordingComplete = useCallback(async (blob: Blob) => {
    // Check result AGAIN in case a race condition happened just before this fired
    // (Although the hook ref fix solves the main one, this is double safety)
    if (useRecognitionStore.getState().result) return

    setIsAnalyzing(true)
    setIsRecorderVisualActive(false)
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
        setHadNoMatch(false)
        setIsRecorderVisualActive(false)
        setMusic(music)
        toast.success('Song identified and saved to history.')
      } else {
        // No match found logic
        setHadNoMatch(true)
        setIsRecorderVisualActive(false)
        toast.error('No match found. Try getting closer to the source.')

        // Log to history silently
        const { addToHistory } = useRecognitionStore.getState()
        addToHistory({
          title: 'No Match Found',
          artists: [{ name: 'Unknown' }],
          album: { name: 'Unknown' },
          score: 0
        })

        // Do NOT set error state that hides the UI, just show toast
        // actually, let's just leave the UI in "ready to record" state
        // setError('No match found') // This would show the error UI, maybe we just want toast?
        // User asked: "if no match found add that result to the database"

      }
    } catch (error) {
      console.error('Recognition error:', error)
      setIsRecorderVisualActive(false)
      toast.error('Failed to process audio. Please check your connection.')
    } finally {
      setIsAnalyzing(false)
      setIsRecorderVisualActive(false)
    }
  }, [setMusic])

  const { isRecording, startRecording, stopRecording, audioLevel } = useRecorder({
    onRecordingComplete: handleRecordingComplete,
    onDataAvailable: handleDataAvailable,
    maxDuration: 20,
    timeslice: 2000, // Check every 2 seconds
    silenceThreshold: 15 // Skip chunks with average volume below 15 (0-255 range)
  })

  // Update ref for the circular dependency
  useEffect(() => {
    stopRecordingRef.current = stopRecording
  }, [stopRecording])

  // Safety: if a result is present, force-stop any active recording immediately.
  useEffect(() => {
    if (result && isRecording) {
      stopRecording()
    }
    if (result) {
      setIsRecorderVisualActive(false)
    }
  }, [result, isRecording, stopRecording])

  // Hard guard: visuals are allowed only while media recorder is truly active.
  useEffect(() => {
    if (!isRecording) {
      setIsRecorderVisualActive(false)
    }
  }, [isRecording])


  const handleToggle = useCallback(() => {
    if (isRecording) {
      // Immediately switch UI out of "recording animation" state on stop tap.
      setIsAnalyzing(true)
      setIsRecorderVisualActive(false)
      stopRecording()
    } else {
      reset()
      setHadNoMatch(false)
      setIsRecorderVisualActive(true)
      startRecording()
    }
  }, [isRecording, stopRecording, reset, startRecording])

  // Reset state on mount
  useEffect(() => {
    reset()
    setHadNoMatch(false)
    setIsRecorderVisualActive(false)
  }, [reset])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hasSeenHint = window.localStorage.getItem(FIRST_VISIT_HINT_KEY)
    if (!hasSeenHint) {
      setIsFirstVisitHintVisible(true)
      setIsHowItWorksOpen(true)
      window.localStorage.setItem(FIRST_VISIT_HINT_KEY, 'true')
    }
  }, [])

  useEffect(() => {
    if (!isFirstVisitHintVisible) return
    const timeoutId = window.setTimeout(() => {
      setIsFirstVisitHintVisible(false)
    }, 5000)
    return () => window.clearTimeout(timeoutId)
  }, [isFirstVisitHintVisible])

  const uiState = getRecognitionUiState({
    isRecording,
    isAnalyzing,
    hasResult: Boolean(result),
    hasError: Boolean(error),
    hadNoMatch,
  })

  const statusLabel = RECOGNITION_STATUS_LABELS[uiState]
  const helperText = RECOGNITION_HELPER_TEXT[uiState]

  return (
    <main className="flex min-h-screen flex-col relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white selection:bg-blue-500/30">
      <Navbar />

      <div className="flex-1 flex flex-col items-center pt-20 md:pt-24 pb-14 md:pb-16 px-4 md:px-8 w-full">
        <div className="z-10 max-w-6xl w-full flex flex-col items-center gap-7 md:gap-9 mb-10">

          {/* Hero Text - Fade out when result found */}
          <AnimatePresence>
            {!result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-4 max-w-2xl mx-auto mb-2"
              >
                <p className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100/90">
                  Identify songs in seconds
                </p>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/75">
                  SoundLens
                </h1>
                <p className="text-base md:text-xl text-white/65 font-normal leading-relaxed">
                  Tap once. Listen briefly. Get the exact track instantly.
                </p>
                <p className="text-sm text-white/45">Works best near the sound source.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recorder + Side Panels */}
          <div className="w-full relative">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key="recorder"
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="z-20 w-full"
                >
                  <section className="max-w-3xl mx-auto min-h-[340px] md:min-h-[390px] px-4 md:px-6 flex flex-col items-center justify-center">
                      <AnimatePresence mode="wait">
                        {isRecorderVisualActive && !isAnalyzing && !result && (
                          <motion.div
                            key="recording-badge"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-300/30 bg-cyan-400/15 px-3 py-1 text-xs text-cyan-100"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-200 animate-pulse" />
                            Listening now
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <RecorderButton
                        isRecording={isRecorderVisualActive && !isAnalyzing && !result}
                        isAnalyzing={false}
                        onToggle={handleToggle}
                        audioLevel={audioLevel}
                      />
                      <p className="text-sm md:text-base font-semibold text-cyan-100 mt-2.5 tracking-[0.01em]" aria-live="polite">
                        {statusLabel}
                      </p>
                      {helperText && <p className="mt-1.5 text-xs text-white/65">{helperText}</p>}

                      {!isRecording && !isAnalyzing && !result && (
                        <div className="mt-4 w-full max-w-md">
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setIsHowItWorksOpen((prev) => !prev)}
                              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-cyan-100/90 hover:bg-white/10 transition-colors"
                            >
                              <Lightbulb className="h-3.5 w-3.5" />
                              New here? See how it works
                              {isHowItWorksOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                          </div>

                          <AnimatePresence initial={false}>
                            {isHowItWorksOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.18 }}
                                className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
                              >
                                <div className="space-y-1.5">
                                  {RECOGNITION_STEPS.map((step, idx) => (
                                    <p key={step} className="text-sm text-white/85 leading-relaxed">
                                      <span className="text-cyan-200/90 mr-1.5">{idx + 1}.</span>
                                      {step}
                                    </p>
                                  ))}
                                </div>
                                <p className="mt-2 text-xs text-slate-300/75">{RECOGNITION_TIP}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <AnimatePresence>
                            {isFirstVisitHintVisible && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.2 }}
                                className="mt-2 text-center text-[11px] text-cyan-100/80"
                              >
                                Quick tip: this helper appears once for new users.
                                <button
                                  type="button"
                                  onClick={() => setIsFirstVisitHintVisible(false)}
                                  className="ml-2 underline underline-offset-2 hover:text-white"
                                >
                                  Dismiss
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                  </section>

                  <section className="mx-auto mt-1 w-full max-w-6xl px-2 md:px-3 py-3">
                    {/* Match header width to 5×200px cards + gaps so “View all” lines up with the last card */}
                    <div className="mx-auto w-full max-w-[1064px]">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2 text-cyan-200/90">
                        <Music2 className="h-4 w-4 shrink-0" />
                        <p className="text-xs uppercase tracking-[0.18em]">Recent recognitions</p>
                      </div>
                      {history.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 shrink-0 px-2 text-xs text-cyan-100 hover:bg-white/10 hover:text-white"
                          onClick={() => setIsHistoryOpen(true)}
                        >
                          View all <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>

                    {history.length === 0 ? (
                      <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-4 text-sm text-white/60">
                        No songs recognized yet. Your latest matches will show here.
                      </div>
                    ) : (
                      <div className="flex flex-wrap justify-start gap-3 md:gap-4">
                        {history.slice(0, RECENT_RECOGNITIONS_HOME_PREVIEW).map((item) => {
                          const thumbUrl =
                            item.album?.cover ||
                            item.album?.covers?.large ||
                            item.album?.covers?.medium ||
                            item.album?.covers?.small ||
                            item.external_metadata?.spotify?.album?.images?.[0]?.url ||
                            item.external_metadata?.spotify?.album?.images?.[1]?.url ||
                            (item.external_metadata?.youtube?.vid
                              ? `https://img.youtube.com/vi/${item.external_metadata.youtube.vid}/mqdefault.jpg`
                              : null)

                          const spotifyId = item.external_metadata?.spotify?.track?.id
                          const youtubeId = item.external_metadata?.youtube?.vid
                          const deezerId = item.external_metadata?.deezer?.track?.id
                          const appleMusicId = item.external_metadata?.applemusic?.track?.id

                          const links: { label: string; href: string; className: string }[] = []
                          if (spotifyId) {
                            links.push({
                              label: 'Spotify',
                              href: `https://open.spotify.com/track/${spotifyId}`,
                              className:
                                'bg-[#1DB954] text-black hover:bg-[#1ed760] border-transparent',
                            })
                          }
                          if (youtubeId) {
                            links.push({
                              label: 'YouTube',
                              href: `https://www.youtube.com/watch?v=${youtubeId}`,
                              className: 'bg-red-600 text-white hover:bg-red-500 border-transparent',
                            })
                          }
                          if (appleMusicId) {
                            links.push({
                              label: 'Apple Music',
                              href: `https://music.apple.com/us/album/${appleMusicId}`,
                              className: 'bg-[#FA243C] text-white hover:bg-[#fb4559] border-transparent',
                            })
                          }
                          if (deezerId) {
                            links.push({
                              label: 'Deezer',
                              href: `https://www.deezer.com/track/${deezerId}`,
                              className: 'bg-[#00C7F2] text-slate-900 hover:bg-[#33d2f4] border-transparent',
                            })
                          }

                          const artistLine =
                            item.artists?.map((a) => a.name).filter(Boolean).join(', ') || 'Unknown artist'
                          const albumName = item.album?.name
                          const showAlbum = Boolean(albumName && albumName !== item.title)

                          return (
                            <div
                              key={item.id}
                              role="button"
                              tabIndex={0}
                              aria-label={`Open history: ${item.title ?? 'recognition'}`}
                              onClick={() => setIsHistoryOpen(true)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  setIsHistoryOpen(true)
                                }
                              }}
                              className="group flex w-[200px] max-w-full flex-col rounded-2xl border border-white/[0.08] bg-slate-950/50 p-3 text-left shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)] outline-none ring-white/10 transition-all duration-200 hover:border-cyan-400/25 hover:bg-slate-950/70 hover:shadow-[0_16px_48px_-12px_rgba(56,189,248,0.12)] focus-visible:ring-2 focus-visible:ring-cyan-400/50"
                            >
                              <div className="relative h-40 w-full overflow-hidden rounded-xl bg-slate-900/80">
                                {thumbUrl ? (
                                  <RemoteAlbumImage
                                    src={thumbUrl}
                                    alt=""
                                    sizes="200px"
                                    className="object-cover"
                                    fallback={
                                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
                                        <Music2 className="h-7 w-7 text-slate-500 sm:h-8 sm:w-8" />
                                      </div>
                                    }
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
                                    <Music2 className="h-7 w-7 text-slate-500 sm:h-8 sm:w-8" />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex flex-1 flex-col gap-1.5 overflow-visible pt-2">
                                <p className="text-sm font-semibold leading-snug text-white break-words [overflow-wrap:anywhere] hyphens-auto">
                                  {item.title}
                                </p>
                                <p className="text-xs leading-relaxed text-slate-400 break-words [overflow-wrap:anywhere] hyphens-auto">
                                  {artistLine}
                                </p>
                                {showAlbum && (
                                  <p className="text-xs text-slate-500 break-words [overflow-wrap:anywhere] hyphens-auto">
                                    <span className="text-slate-500/90">Album · </span>
                                    <span className="text-slate-400">{albumName}</span>
                                  </p>
                                )}
                                <p className="text-[11px] text-slate-500 break-words [overflow-wrap:anywhere]">
                                  Recognized {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                                </p>

                                {links.length > 0 ? (
                                  <div className="mt-1 flex min-w-0 flex-wrap gap-1.5">
                                    {links.map((link) => (
                                      <a
                                        key={link.label}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className={`inline-flex max-w-full min-w-0 items-center justify-center rounded-full border px-2.5 py-1 text-center text-[11px] font-semibold leading-tight shadow-sm transition active:scale-[0.99] break-words [overflow-wrap:anywhere] ${link.className}`}
                                      >
                                        {link.label}
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setIsHistoryOpen(true)
                                    }}
                                    className="mt-1 w-fit rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium text-white/90 transition hover:bg-white/10"
                                  >
                                    View in history
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    </div>
                  </section>
                </motion.div>
              ) : (
                <motion.div
                  key="result-card"
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-full"
                >
                  <ResultCard result={result} onReset={reset} />

                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Toast / Message - Handled by Sonner now */}
          </div>

        </div>
      </div>
      <HistoryModal open={isHistoryOpen} onOpenChange={setIsHistoryOpen} />
    </main>
  )
}

