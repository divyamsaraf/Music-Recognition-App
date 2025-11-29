import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const body = await request.json()
    console.log('--- DEBUG JSON START ---')
    console.log(JSON.stringify(body, null, 2))
    console.log('--- DEBUG JSON END ---')
    return NextResponse.json({ success: true })
}
