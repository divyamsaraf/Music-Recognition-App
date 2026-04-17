'use client'

import { Mic, Square } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
interface RecorderButtonProps {
    isRecording: boolean
    isAnalyzing?: boolean
    onToggle: () => void
    audioLevel?: number
}

export function RecorderButton({ isRecording, isAnalyzing = false, onToggle, audioLevel = 0 }: RecorderButtonProps) {
    return (
        <div className="relative w-[260px] h-[260px] md:w-[300px] md:h-[300px] flex items-center justify-center">
            {/* Outer pulsing rings */}
            {isRecording && (
                <>
                        {/* Primary listening pulse ring */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{
                                opacity: [0.22, 0.45, 0.22],
                                scale: [0.98, 1.04 + audioLevel / 900, 0.98],
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 1.15,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="absolute z-0 w-[196px] h-[196px] md:w-[232px] md:h-[232px] rounded-full border border-cyan-200/60 shadow-[0_0_22px_rgba(56,189,248,0.45)]"
                        />

                        {/* Ambient outer breathing ring */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{
                                opacity: [0.08, 0.18, 0.08],
                                scale: [0.99, 1.02 + audioLevel / 1600, 0.99],
                            }}
                            transition={{
                                duration: 1.9,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="absolute z-0 w-[236px] h-[236px] md:w-[276px] md:h-[276px] rounded-full border border-cyan-200/35"
                        />

                        <motion.div
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{
                                scale: audioLevel > 15 ? 1.35 + (audioLevel / 280) : 1.08,
                                opacity: audioLevel > 15 ? 0.18 : 0.1
                            }}
                            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute w-[160px] h-[160px] md:w-[190px] md:h-[190px] rounded-full bg-blue-500/20"
                        />
                        <motion.div
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{
                                scale: audioLevel > 15 ? 1.22 + (audioLevel / 320) : 1.04,
                                opacity: audioLevel > 15 ? 0.12 : 0.06
                            }}
                            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                            className="absolute w-[160px] h-[160px] md:w-[190px] md:h-[190px] rounded-full bg-blue-500/10"
                        />
                </>
            )}

            {/* Main button */}
            <motion.button
                onClick={onToggle}
                whileHover={{ scale: isAnalyzing ? 1 : 1.03 }}
                whileTap={{ scale: isAnalyzing ? 1 : 0.97 }}
                disabled={isAnalyzing}
                animate={{
                    scale: isRecording ? [1, 1.03, 1] : 1,
                }}
                transition={{
                    scale: { duration: 1.4, repeat: isRecording ? Infinity : 0, ease: 'easeInOut' }
                }}
                className={cn(
                    "relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl",
                    isRecording
                        ? "bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 shadow-cyan-500/50"
                        : "bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 shadow-blue-500/30 hover:shadow-blue-500/45",
                    isAnalyzing && "cursor-not-allowed opacity-80"
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
                            <Square className="w-11 h-11 text-white fill-white/95" />
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

        </div>
    )
}
