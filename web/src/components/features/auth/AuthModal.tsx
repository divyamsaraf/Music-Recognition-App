'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Loader2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { authSchema, type AuthFormData } from './auth-schema'

interface AuthModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [rememberMe, setRememberMe] = useState(false)
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
    const supabase = createBrowserSupabaseClient()
    const router = useRouter()

    const {
        register: registerLogin,
        handleSubmit: handleSubmitLogin,
        formState: { errors: loginErrors },
        reset: resetLogin
    } = useForm<AuthFormData>({
        resolver: zodResolver(authSchema),
    })

    const {
        register: registerSignup,
        handleSubmit: handleSubmitSignup,
        formState: { errors: signupErrors },
        reset: resetSignup
    } = useForm<AuthFormData>({
        resolver: zodResolver(authSchema),
    })

    const onLogin = async (data: AuthFormData) => {
        if (!supabase) return
        setIsLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            })

            if (error) throw error

            if (rememberMe) {
                // In a real app, Supabase handles session persistence automatically via cookies/localstorage
                // based on the client configuration. The "Remember Me" checkbox here is mostly UI
                // unless we want to explicitly set a longer session expiry, which is usually server-side.
                // For now, we'll rely on Supabase's default persistence.
            }

            toast.success('Logged in successfully')
            onOpenChange(false)
            router.refresh()
            resetLogin()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to login')
        } finally {
            setIsLoading(false)
        }
    }

    const onSignup = async (data: AuthFormData) => {
        if (!supabase) return
        setIsLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
            })

            if (error) throw error

            toast.success('Account created! Please check your email to confirm.')
            onOpenChange(false)
            resetSignup()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to create account')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        if (!supabase) return
        setError(null)
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${location.origin}/auth/callback`,
                },
            })
            if (error) throw error
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to initiate Google login')
        }
    }

    const handleModalOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setError(null)
            setIsLoading(false)
            setRememberMe(false)
            setActiveTab('login')
            resetLogin()
            resetSignup()
        }
        onOpenChange(nextOpen)
    }

    const handleTabChange = (nextTab: string) => {
        const typedTab = nextTab as 'login' | 'signup'
        setActiveTab(typedTab)
        setError(null)
        setIsLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleModalOpenChange}>
            <DialogContent className="sm:max-w-[420px] bg-slate-950 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">Welcome to SoundLens</DialogTitle>
                    <DialogDescription className="text-center text-slate-400">
                        Sign in or create an account to save your discoveries.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid h-11 w-full grid-cols-2 bg-slate-900 p-1">
                        <TabsTrigger value="login" className="rounded-md text-sm font-semibold">Login</TabsTrigger>
                        <TabsTrigger value="signup" className="rounded-md text-sm font-semibold">Sign Up</TabsTrigger>
                    </TabsList>

                    {/* Login Tab */}
                    <TabsContent value="login" className="mt-3 min-h-[244px]">
                        <form onSubmit={handleSubmitLogin(onLogin)} className="flex min-h-[244px] flex-col">
                            <div className="space-y-3">
                                <div className="space-y-2">
                                <Label htmlFor="login-email">Email</Label>
                                <Input
                                    id="login-email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="bg-slate-900 border-slate-800 focus:border-blue-500"
                                    {...registerLogin('email')}
                                />
                                {loginErrors.email && (
                                    <p className="text-xs text-red-400">{loginErrors.email.message}</p>
                                )}
                                </div>
                                <div className="space-y-2">
                                <Label htmlFor="login-password">Password</Label>
                                <Input
                                    id="login-password"
                                    type="password"
                                    className="bg-slate-900 border-slate-800 focus:border-blue-500"
                                    {...registerLogin('password')}
                                />
                                {loginErrors.password && (
                                    <p className="text-xs text-red-400">{loginErrors.password.message}</p>
                                )}
                                </div>
                                <div className="h-6 flex items-center space-x-2">
                                    <Checkbox
                                        id="login-remember"
                                        checked={rememberMe}
                                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                        className="border-slate-700 data-[state=checked]:bg-blue-600"
                                    />
                                    <Label htmlFor="login-remember" className="text-sm font-normal text-slate-400 cursor-pointer">
                                        Remember me
                                    </Label>
                                </div>
                            </div>
                            <div className="mt-auto space-y-2 pt-1">
                                <div className="min-h-[36px]">
                                    {error && (
                                        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-md text-sm flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </div>
                                    )}
                                </div>
                                <Button type="submit" size="lg" className="w-full h-10 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
                                </Button>
                            </div>
                        </form>
                    </TabsContent>

                    {/* Signup Tab */}
                    <TabsContent value="signup" className="mt-3 min-h-[244px]">
                        <form onSubmit={handleSubmitSignup(onSignup)} className="flex min-h-[244px] flex-col">
                            <div className="space-y-3">
                                <div className="space-y-2">
                                <Label htmlFor="signup-email">Email</Label>
                                <Input
                                    id="signup-email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="bg-slate-900 border-slate-800 focus:border-blue-500"
                                    {...registerSignup('email')}
                                />
                                {signupErrors.email && (
                                    <p className="text-xs text-red-400">{signupErrors.email.message}</p>
                                )}
                                </div>
                                <div className="space-y-2">
                                <Label htmlFor="signup-password">Password</Label>
                                <Input
                                    id="signup-password"
                                    type="password"
                                    className="bg-slate-900 border-slate-800 focus:border-blue-500"
                                    {...registerSignup('password')}
                                />
                                {signupErrors.password && (
                                    <p className="text-xs text-red-400">{signupErrors.password.message}</p>
                                )}
                                </div>
                                <div className="h-6 flex items-center">
                                    <p className="text-[10px] text-slate-500">Must be at least 8 characters long</p>
                                </div>
                            </div>
                            <div className="mt-auto space-y-2 pt-1">
                                <div className="min-h-[36px]">
                                    {error && (
                                        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-md text-sm flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </div>
                                    )}
                                </div>
                                <Button type="submit" size="lg" className="w-full h-10 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
                                </Button>
                            </div>
                        </form>
                    </TabsContent>
                </Tabs>

                <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-950 px-2 text-slate-500">Or continue with</span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="lg"
                    className="w-full h-10 border-slate-800 hover:bg-slate-900"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                >
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                    </svg>
                    Continue with Google
                </Button>
            </DialogContent>
        </Dialog>
    )
}
