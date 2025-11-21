import { useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'

interface UseRecorderProps {
    onRecordingComplete: (blob: Blob) => void
    onDataAvailable?: (blob: Blob) => void
    maxDuration?: number // in seconds
}

export function useRecorder({ onRecordingComplete, onDataAvailable, maxDuration = 20 }: UseRecorderProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [duration, setDuration] = useState(0)
    const [audioLevel, setAudioLevel] = useState(0)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const animationFrameRef = useRef<number | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)

    const cleanup = useCallback(() => {
        setIsRecording(false)
        setDuration(0)
        setAudioLevel(0)

        if (timerRef.current) clearInterval(timerRef.current)
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
            // Request data every 4 seconds (4000ms)
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data)
                    // Emit chunk for real-time processing if callback provided
                    if (onDataAvailable) {
                        onDataAvailable(e.data)
                    }
                }
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                onRecordingComplete(blob)
                cleanup()
            }

            // Start recording and request data every 4 seconds
            mediaRecorder.start(4000)
            setIsRecording(true)

            // Timer for duration
            const startTime = Date.now()
            timerRef.current = setInterval(() => {
                const elapsed = (Date.now() - startTime) / 1000
                setDuration(elapsed)
                if (elapsed >= maxDuration) {
                    stopRecording()
                }
            }, 100)

            // Animation frame for audio level
            const updateLevel = () => {
                if (!analyserRef.current) return
                const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
                analyserRef.current.getByteFrequencyData(dataArray)
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length
                setAudioLevel(average)
                animationFrameRef.current = requestAnimationFrame(updateLevel)
            }
            updateLevel()

        } catch (error) {
            console.error('Error starting recording:', error)
            toast.error('Could not access microphone')
        }
    }, [maxDuration, onRecordingComplete, onDataAvailable, cleanup, stopRecording])

    return {
        isRecording,
        duration,
        audioLevel,
        startRecording,
        stopRecording
    }
}
