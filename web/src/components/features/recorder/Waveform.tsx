'use client'

import { motion } from 'framer-motion'

interface WaveformProps {
    audioLevel: number // 0-255
    isRecording: boolean
}

export function Waveform({ audioLevel, isRecording }: WaveformProps) {
    // Create 5 bars for the waveform
    const bars = Array.from({ length: 5 })

    return (
        <div className="flex items-center justify-center gap-1 h-12">
            {bars.map((_, i) => {
                // Calculate height based on audio level and index
                // Center bars are taller
                const baseHeight = [0.4, 0.7, 1, 0.7, 0.4][i]
                const height = isRecording
                    ? Math.max(4, (audioLevel / 255) * 40 * baseHeight + ((audioLevel + i) % 10))
                    : 4

                return (
                    <motion.div
                        key={i}
                        className="w-1 bg-primary rounded-full"
                        animate={{ height }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                )
            })}
        </div>
    )
}
