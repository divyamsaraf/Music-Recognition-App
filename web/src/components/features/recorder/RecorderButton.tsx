'use client'

import { Mic, Square } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
interface RecorderButtonProps {
    isRecording: boolean
    onToggle: () => void
    audioLevel?: number
}

export function RecorderButton({ isRecording, onToggle, audioLevel = 0 }: RecorderButtonProps) {
    return (
        <div className="relative flex items-center justify-center">
            {/* Outer pulsing rings */}
            <AnimatePresence>
                {isRecording && (
                    <>
                        <motion.div
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{
                                scale: audioLevel > 15 ? 2 + (audioLevel / 100) : 1.2,
                                opacity: audioLevel > 15 ? 0 : 0.2
                            }}
                            transition={{ duration: audioLevel > 15 ? 2 : 3, repeat: Infinity, ease: "easeOut" }}
                            className="absolute w-[140px] h-[140px] md:w-[160px] md:h-[160px] rounded-full bg-blue-500/20"
                        />
                        <motion.div
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{
                                scale: audioLevel > 15 ? 1.5 + (audioLevel / 100) : 1.1,
                                opacity: audioLevel > 15 ? 0 : 0.1
                            }}
                            transition={{ duration: audioLevel > 15 ? 2 : 3, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                            className="absolute w-[140px] h-[140px] md:w-[160px] md:h-[160px] rounded-full bg-blue-500/10"
                        />
                    </>
                )}
            </AnimatePresence>

            {/* Main button */}
            <motion.button
                onClick={onToggle}
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
