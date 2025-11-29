import { useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'

interface UseRecorderProps {
    onRecordingComplete: (blob: Blob) => void
    onDataAvailable?: (blob: Blob) => void
    maxDuration?: number // in seconds
    timeslice?: number // in ms
    silenceThreshold?: number
}

export function useRecorder({ onRecordingComplete, onDataAvailable, maxDuration = 20, timeslice = 2000, silenceThreshold = 10 }: UseRecorderProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [duration, setDuration] = useState(0)
    const [audioLevel, setAudioLevel] = useState(0)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const startTimeRef = useRef<number>(0)
    const lastCheckpointRef = useRef<number>(0)
    const animationFrameRef = useRef<number | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)

    const maxAudioLevelRef = useRef(0)

    const cleanup = useCallback(() => {
        setIsRecording(false)
        setDuration(0)
        setAudioLevel(0)
        maxAudioLevelRef.current = 0


        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)

        if (sourceRef.current) sourceRef.current.disconnect()
        if (analyserRef.current) analyserRef.current.disconnect()
        if (audioContextRef.current) audioContextRef.current.close()

        // Stop all tracks
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop())
    }, [])

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
        }
    }, [])

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

            // Audio Context for visualization
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            const analyser = audioContext.createAnalyser()
            const source = audioContext.createMediaStreamSource(stream)
            source.connect(analyser)
            analyser.fftSize = 256

            audioContextRef.current = audioContext
            analyserRef.current = analyser
            sourceRef.current = source

            // MediaRecorder
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []
            maxAudioLevelRef.current = 0
            startTimeRef.current = Date.now() // Initialize start time
            lastCheckpointRef.current = 0 // Reset last checkpoint

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data)

                    // Calculate approximate duration based on number of chunks (assuming 1s timeslice)
                    // Calculate duration based on time, not chunks (more reliable)
                    const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000
                    const currentDuration = Math.floor(elapsedSeconds)

                    console.log(`[Recorder] Elapsed: ${elapsedSeconds.toFixed(1)}s | Level: ${maxAudioLevelRef.current}`)

                    // Checkpoints: 4s, 8s, 12s
                    // We use a ref to track if we've already triggered for this second to avoid double-firing
                    const checkpoints = [4, 8, 12]

                    // Find if we just passed a checkpoint
                    const checkpoint = checkpoints.find(cp =>
                        elapsedSeconds >= cp && elapsedSeconds < cp + 1.5 // 1.5s window to catch it
                    )

                    // Ensure we haven't fired for this checkpoint yet
                    // We can store the last fired checkpoint in a ref
                    if (checkpoint && lastCheckpointRef.current !== checkpoint) {
                        console.log(`[Recorder] Checkpoint ${checkpoint}s reached (Actual: ${elapsedSeconds.toFixed(1)}s). FORCING request...`)
                        lastCheckpointRef.current = checkpoint

                        const fullBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
                        if (onDataAvailable) onDataAvailable(fullBlob)

                        maxAudioLevelRef.current = 0
                    }

                    if (elapsedSeconds >= maxDuration) {
                        stopRecording()
                    }
                }
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                onRecordingComplete(blob)
                cleanup()
            }

            // Start recording and request data every timeslice
            mediaRecorder.start(timeslice)
            setIsRecording(true)

            // Animation frame for audio level and duration
            const updateLoop = () => {
                if (!analyserRef.current) return

                // Update Audio Level
                const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
                analyserRef.current.getByteFrequencyData(dataArray)
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length
                setAudioLevel(average)

                if (average > maxAudioLevelRef.current) {
                    maxAudioLevelRef.current = average
                }

                // Update Duration
                const elapsed = (Date.now() - startTimeRef.current) / 1000
                setDuration(elapsed)

                if (elapsed >= maxDuration) {
                    stopRecording()
                } else {
                    animationFrameRef.current = requestAnimationFrame(updateLoop)
                }
            }
            updateLoop()

        } catch (error) {
            console.error('Error starting recording:', error)
            toast.error('Could not access microphone')
        }
    }, [maxDuration, timeslice, onRecordingComplete, onDataAvailable, cleanup, stopRecording])

    return {
        isRecording,
        duration,
        audioLevel,
        startRecording,
        stopRecording
    }
}
