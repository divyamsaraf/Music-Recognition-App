'use client'

import { Mic, Square } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRecorder } from '@/hooks/useRecorder'
import { cn } from '@/lib/utils'

interface RecorderButtonProps {
    onRecordingComplete: (blob: Blob) => void
    onDataAvailable: (blob: Blob) => void
}

export function RecorderButton({ onRecordingComplete, onDataAvailable }: RecorderButtonProps) {
    const { isRecording, startRecording, stopRecording } = useRecorder({
        onRecordingComplete,
        onDataAvailable,
        maxDuration: 20
    })

    const handleToggle = () => {
        if (isRecording) {
            stopRecording()
        } else {
            startRecording()
        }
    }

    return (
        <div className="relative flex items-center justify-center">
            {/* Ripple Effects (Only when recording) */}
            <AnimatePresence>
                {isRecording && (
                    <>
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0.5, scale: 1 }}
                                animate={{ opacity: 0, scale: 2.5 }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.4,
                                    ease: "easeOut"
                                }}
                                className="absolute inset-0 rounded-full bg-blue-500/20 z-0"
                            />
                        ))}
                        {/* Outer Glow */}
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 blur-xl opacity-50 z-0"
                        />
                    </>
                )}
            </AnimatePresence>

            {/* Main Button */}
            <motion.button
                onClick={handleToggle}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                    scale: isRecording ? [1, 1.1, 1] : 1,
                }}
                transition={{
                    scale: { duration: 1.5, repeat: isRecording ? Infinity : 0 }
                }}
                className={cn(
                    "relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl",
                    isRecording
                        ? "bg-gradient-to-r from-red-500 to-pink-600 shadow-red-500/50"
                        : "bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 shadow-blue-500/50 hover:shadow-blue-500/80"
                )}
            >
                <div className="absolute inset-1 rounded-full border-2 border-white/20" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-50" />

                <AnimatePresence mode="wait">
                    {isRecording ? (
                        <motion.div
                            key="stop"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                        >
                            <Square className="w-12 h-12 text-white fill-white" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="start"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                        >
                            <Mic className="w-12 h-12 text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Status Text */}
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <AnimatePresence mode="wait">
                    {isRecording ? (
                        <motion.span
                            key="listening"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-xl font-medium text-white/90 tracking-widest uppercase"
                        >
                            Listening...
                        </motion.span>
                    ) : (
                        <motion.span
                            key="tap"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-lg font-medium text-white/60"
                        >
                            Tap to SoundLens
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
