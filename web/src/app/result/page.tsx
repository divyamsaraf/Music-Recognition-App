'use client'

import { useRecognitionStore } from '@/store/useRecognitionStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ResultCard } from '@/components/features/result/ResultCard'

export default function ResultPage() {
    const result = useRecognitionStore((state) => state.result)
    const router = useRouter()

    useEffect(() => {
        if (!result) {
            router.push('/')
        }
    }, [result, router])

    // Mock data for verification
    const mockResult = {
        metadata: {
            music: [{
                title: "Tere Ishk Mein (From \"Tere Ishk Mein\")",
                artists: [{ name: "A.R. Rahman" }],
                album: { name: "Tere Ishk Mein (From \"Tere Ishk Mein\")" },
                release_date: "2025-10-18",
                label: "Super Cassettes Industries Private Limited",
                genres: [{ name: "Bollywood" }],
                external_metadata: {
                    spotify: {
                        track: { id: "mock" },
                        album: { images: [{ url: "https://i.scdn.co/image/ab67616d0000b2731a8c4618dee81651187d6d48" }] }
                    },
                    youtube: { vid: "mock" }
                }
            }]
        }
    }
    const displayResult = result || mockResult
    const music = displayResult.metadata?.music?.[0]

    if (!music) return null

    const imageUrl = music.external_metadata?.spotify?.album?.images?.[0]?.url

    return (
        <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-background to-secondary/20 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Blurred Background Layer */}
            {imageUrl && (
                <div
                    className="absolute inset-0 z-0 opacity-30 blur-[100px] scale-110"
                    style={{
                        backgroundImage: `url(${imageUrl})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover'
                    }}
                />
            )}

            <div className="w-full max-w-5xl space-y-8 z-10 relative">
                <Button variant="ghost" onClick={() => router.push('/')} className="mb-4 hover:bg-white/10 text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Recorder
                </Button>

                <ResultCard result={displayResult} onReset={() => router.push('/')} />
            </div>
        </main>
    )
}
