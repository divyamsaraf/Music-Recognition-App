import crypto from 'crypto'
import axios from 'axios'
import FormData from 'form-data'

interface ACRCloudConfig {
    host: string
    access_key: string
    access_secret: string
}

const config: ACRCloudConfig = {
    host: process.env.ACRCLOUD_HOST || '',
    access_key: process.env.ACRCLOUD_ACCESS_KEY || '',
    access_secret: process.env.ACRCLOUD_ACCESS_SECRET || '',
}

export async function identifyMusic(audioBuffer: Buffer) {
    const timestamp = Math.floor(Date.now() / 1000)
    const stringToSign = `POST\n/v1/identify\n${config.access_key}\naudio\n1\n${timestamp}`

    const signature = crypto
        .createHmac('sha1', config.access_secret)
        .update(Buffer.from(stringToSign, 'utf-8'))
        .digest('base64')

    const form = new FormData()
    form.append('sample', audioBuffer)
    form.append('sample_bytes', audioBuffer.length)
    form.append('access_key', config.access_key)
    form.append('data_type', 'audio')
    form.append('signature_version', '1')
    form.append('signature', signature)
    form.append('timestamp', timestamp)

    try {
        const response = await axios.post(`https://${config.host}/v1/identify`, form, {
            headers: form.getHeaders(),
        })
        return response.data
    } catch (error) {
        console.error('ACRCloud Error:', error)
        throw new Error('Failed to identify music')
    }
}
