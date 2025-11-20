'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function AuthErrorPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-4">
            <h1 className="text-2xl font-bold text-destructive">Authentication Error</h1>
            <p className="text-muted-foreground">Something went wrong during sign in.</p>
            <Button onClick={() => router.push('/')}>
                Return Home
            </Button>
        </div>
    )
}
