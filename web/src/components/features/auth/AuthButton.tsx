'use client'

import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { LogOut, User as UserIcon } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AuthButton() {
    const [user, setUser] = useState<User | null>(null)
    const supabase = createBrowserSupabaseClient()
    const router = useRouter()

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [supabase])

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    if (!user) {
        return (
            <Button onClick={handleLogin} variant="outline">
                Sign In
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata.avatar_url} alt={user.email} />
                        <AvatarFallback><UserIcon className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={() => router.push('/history')}>
                    History
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
