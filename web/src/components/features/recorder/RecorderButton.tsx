'use client'

import { Button } from '@/components/ui/button'
import { Mic, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Waveform } from './Waveform'
import { useRecorder } from '@/hooks/useRecorder'
import { Progress } from '@/components/ui/progress'

interface RecorderButtonProps {
    onRecordingComplete: (blob: Blob) => void
}

export function RecorderButton({ onRecordingComplete }: RecorderButtonProps) {
    const { isRecording, duration, audioLevel, startRecording, stopRecording } = useRecorder({
        onRecordingComplete,
        maxDuration: 9
    })

    const progress = (duration / 9) * 100

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="relative">
                {/* Pulse effect when recording */}
                {isRecording && (
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                )}

                <Button
                    size="lg"
                    variant={isRecording ? "destructive" : "default"}
                    className={cn(
                        "h-24 w-24 rounded-full shadow-xl transition-all duration-300",
                        isRecording ? "scale-110" : "hover:scale-105"
                    )}
                    onClick={isRecording ? stopRecording : startRecording}
                >
                    {isRecording ? (
                        <Square className="h-8 w-8 fill-current" />
                    ) : (
                        <Mic className="h-8 w-8" />
                    )}
                </Button>
            </div>

            <div className="h-16 flex flex-col items-center justify-center w-full max-w-[200px] gap-2">
                {isRecording ? (
                    <>
                        <Waveform audioLevel={audioLevel} isRecording={isRecording} />
                        <Progress value={progress} className="h-1 w-full" />
                        <span className="text-xs text-muted-foreground font-mono">
                            {duration.toFixed(1)}s / 9.0s
                        </span>
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground animate-pulse">
                        Tap to identify song
                    </p>
                )}
            </div>
        </div>
    )
}
