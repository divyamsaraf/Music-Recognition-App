import Link from 'next/link'
import { AuthButton } from '@/components/features/auth'
import { Button } from '@/components/ui/button'
import { HistoryModal } from '@/components/features/history/HistoryModal'
import { useState } from 'react'
import { Music2 } from 'lucide-react'

export function Navbar() {
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)

    return (
        <nav className="fixed top-0 left-0 right-0 h-[70px] md:h-[80px] z-50 flex items-center justify-between px-4 md:px-6 bg-transparent backdrop-blur-sm">
            {/* Left: Logo */}
            <div className="flex items-center">
                <Link href="/" className="flex items-center gap-2 text-lg md:text-[22px] font-bold text-white tracking-tight hover:opacity-90 transition-opacity">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Music2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                    </div>
                    SoundLens
                </Link>
            </div>

            {/* Right: Navigation Items */}
            <div className="flex items-center gap-4 md:gap-8">
                <Button
                    variant="ghost"
                    className="text-white font-medium hover:text-blue-400 hover:bg-white/5 transition-all text-sm md:text-base px-2 md:px-4"
                    onClick={() => setIsHistoryOpen(true)}
                >
                    History
                </Button>
                <AuthButton />
            </div>

            <HistoryModal open={isHistoryOpen} onOpenChange={setIsHistoryOpen} />
        </nav>
    )
}
