import { createBrowserClient } from '@supabase/ssr'
import { getAnonymousId } from '@/lib/storage'

export function createBrowserSupabaseClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key || !url.startsWith('http')) {
        return null
    }

    const anonymousId = getAnonymousId()

    return createBrowserClient(url, key, {
        global: {
            headers: {
                'x-anonymous-id': anonymousId
            }
        }
    })
}
