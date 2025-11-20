import { NextRequest, NextResponse } from 'next/server'
import { identifyMusic } from '@/lib/acrcloud'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const audioFile = formData.get('audio') as File

        if (!audioFile) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
        }

        // Convert File to Buffer
        const arrayBuffer = await audioFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // TODO: If ACRCloud requires WAV/PCM and we receive WebM, we might need conversion here.
        // However, ACRCloud supports many formats including WebM/Opus.
        // We will try sending the buffer directly first.

        const result = await identifyMusic(buffer)

        if (result.status.code !== 0) {
            return NextResponse.json({ error: result.status.msg }, { status: 400 })
        }

        // Save to history if user is logged in
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user && result.metadata?.music?.[0]) {
            const music = result.metadata.music[0]
            await supabase.from('history').insert({
                user_id: user.id,
                title: music.title,
                artist: music.artists?.map((a: { name: string }) => a.name).join(', '),
                album: music.album?.name,
                spotify_id: music.external_metadata?.spotify?.track?.id,
                youtube_id: music.external_metadata?.youtube?.vid,
            })
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error('Recognition error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
