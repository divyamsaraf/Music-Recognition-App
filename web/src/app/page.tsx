'use client'

import { RecorderButton } from '@/components/features/recorder'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import { useRecognitionStore } from '@/store/useRecognitionStore'

import { AuthButton } from '@/components/features/auth'

export default function Home() {
  const router = useRouter()
  const setResult = useRecognitionStore((state) => state.setResult)

  const handleRecordingComplete = async (blob: Blob) => {
    const formData = new FormData()
    formData.append('audio', blob)

    const promise = fetch('/api/recognize', {
      method: 'POST',
      body: formData,
    }).then(async (res) => {
      if (!res.ok) throw new Error('Recognition failed')
      const data = await res.json()
      setResult(data)
      router.push('/result')
      return data
    })

    toast.promise(promise, {
      loading: 'Identifying song...',
      success: 'Song identified!',
      error: 'Could not identify song',
    })
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20 relative">
      <div className="absolute top-4 right-4">
        <AuthButton />
      </div>

      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            What&apos;s that song?
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-[600px] mx-auto">
            Tap the button below to identify music playing around you.
          </p>
        </div>

        <div className="p-12 rounded-3xl bg-card/50 backdrop-blur-xl border shadow-2xl">
          <RecorderButton onRecordingComplete={handleRecordingComplete} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-muted-foreground">
          <div className="space-y-2">
            <div className="font-semibold text-foreground">Fast</div>
            <p>Results in seconds</p>
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-foreground">Accurate</div>
            <p>Powered by ACRCloud</p>
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-foreground">Free</div>
            <p>No login required</p>
          </div>
        </div>
      </div>
    </main>
  )
}
