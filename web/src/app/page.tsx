'use client'

import { RecorderButton } from '@/components/features/recorder'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRecognitionStore } from '@/store/useRecognitionStore'
import { useRecorder } from '@/hooks/useRecorder'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { HistoryPreview } from '@/components/features/history/HistoryPreview'
import { HistoryModal } from '@/components/features/history/HistoryModal'
import { ResultCard } from '@/components/features/result/ResultCard'

import { Navbar } from '@/components/layout/Navbar'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { getAnonymousId } from '@/lib/storage'

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { result, error, setMusic, setError, reset, history, loadHistory } = useRecognitionStore()
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const supabase = createBrowserSupabaseClient()

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
        setMusic(music)
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
        // No match found logic
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
      toast.error('Failed to process audio. Please check your connection.')
    } finally {
      setIsAnalyzing(false)
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


  const handleToggle = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      reset()
      startRecording()
    }
  }, [isRecording, stopRecording, reset, startRecording])

  // Reset state on mount
  useEffect(() => {
    reset()
  }, [reset])

  return (
    <main className="flex min-h-screen flex-col relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white selection:bg-blue-500/30">
      <Navbar />

      <div className="flex-1 flex flex-col items-center pt-20 md:pt-32 pb-20 px-4 md:px-8 w-full">
        <div className="z-10 max-w-5xl w-full flex flex-col items-center gap-8 md:gap-16 mb-12">

          {/* Hero Text - Fade out when result found */}
          <AnimatePresence>
            {!result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-6 max-w-3xl mx-auto mb-8"
              >
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                  SoundLens
                </h1>
                <p className="text-lg md:text-2xl text-white/60 font-light leading-relaxed max-w-2xl mx-auto">
                  Record a moment. Discover the music behind it.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recorder Button - Center Stage */}
          <div className="flex flex-col items-center gap-10 w-full max-w-5xl relative min-h-[300px] justify-start">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key="recorder"
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="z-20 flex flex-col items-center gap-12 w-full"
                >
                  <RecorderButton
                    isRecording={isRecording}
                    onToggle={handleToggle}
                    audioLevel={audioLevel}
                  />

                  {/* Recent History Preview - Positioned below recorder with better spacing */}
                  <div className="w-full pt-4">
                    <HistoryPreview history={history} onOpenHistory={() => setIsHistoryOpen(true)} />
                  </div>
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

