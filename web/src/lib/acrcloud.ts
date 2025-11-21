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
    form.append('sample', audioBuffer, { filename: 'sample.webm', contentType: 'audio/webm' })
    form.append('sample_bytes', audioBuffer.length)
    form.append('access_key', config.access_key)
    form.append('data_type', 'audio')
    form.append('signature_version', '1')
    form.append('signature', signature)
    form.append('timestamp', timestamp)

    try {
        const response = await axios.post(`https://${config.host}/v1/identify`, form, {
            headers: form.getHeaders(),
            validateStatus: (status) => status < 500, // Handle 4xx errors manually
        })

        if (response.status !== 200) {
            console.error('ACRCloud API Error Status:', response.status)
            console.error('ACRCloud API Error Body:', JSON.stringify(response.data, null, 2))
            throw new Error(`ACRCloud API Error: ${response.status}`)
        }

        return response.data
    } catch (error) {
        console.error('ACRCloud Request Failed:', error)
        throw error
    }
}
