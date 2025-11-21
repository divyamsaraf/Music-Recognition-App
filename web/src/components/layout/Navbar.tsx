'use client'

import Link from 'next/link'
import { Music2, History } from 'lucide-react'
import { AuthButton } from '@/components/features/auth'
import { Button } from '@/components/ui/button'
import { HistoryModal } from '@/components/features/history/HistoryModal'
import { useState } from 'react'

export function Navbar() {
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-lg">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Music2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-2xl tracking-tight text-white">SoundLens</span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:text-white hover:bg-white/10 gap-2 hidden md:flex"
                        onClick={() => setIsHistoryOpen(true)}
                    >
                        <History className="w-4 h-4" />
                        History
                    </Button>

                    <AuthButton />
                </div>
            </div>

            <HistoryModal open={isHistoryOpen} onOpenChange={setIsHistoryOpen} />
        </nav>
    )
}
