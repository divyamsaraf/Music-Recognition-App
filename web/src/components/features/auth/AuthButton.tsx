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
    const supabase = createBrowserSupabaseClient()
    const [user, setUser] = useState<User | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (!supabase) return

        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }

        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [supabase])

    const handleSignIn = async () => {
        if (!supabase) return
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
        if (error) {
            console.error('Auth error:', error)
            // You might want to show a toast here
            alert(`Login failed: ${error.message}`)
        }
    }

    const handleSignOut = async () => {
        if (!supabase) return
        await supabase.auth.signOut()
        setUser(null)
        router.refresh()
    }

    if (!supabase) return null

    if (!user) {
        return (
            <Button onClick={handleSignIn} variant="outline" className="border-white/10 hover:bg-white/10 text-white">
                Login / Sign Up
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
                <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
