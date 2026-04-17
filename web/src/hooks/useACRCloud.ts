import { useState, useEffect, useCallback, useRef } from 'react'

// Define types for the ACRCloud SDK
// These are inferred based on typical SDK patterns as we don't have the d.ts file
interface ACRCloudSDK {
    Recognize: new (config: {
        host: string
        access_key: string
        access_secret: string
        recognizer_type: number // 0: Audio, 1: Hum, 2: Both
        debug: boolean
        audio_context?: AudioContext
        sample_rate?: number
    }) => ACRCloudRecognizer
}

interface ACRCloudRecognizer {
    recognize(audioData: Float32Array, callback: (result: unknown) => void): void
    create_fingerprint?: (audioData: Float32Array, sampleRate: number) => unknown
}

// Global declaration
declare global {
    interface Window {
        ACRCloud: ACRCloudSDK
    }
}

interface UseACRCloudProps {
    onFingerprintGenerated?: (fingerprint: unknown) => void
}

export function useACRCloud(props: UseACRCloudProps = {}) {
    void props.onFingerprintGenerated
    const [isSDKLoaded, setIsSDKLoaded] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const recognizerRef = useRef<ACRCloudRecognizer | null>(null)

    useEffect(() => {
        const loadSDK = async () => {
            if (window.ACRCloud) {
                setIsSDKLoaded(true)
                return
            }

            try {
                // Load the script
                const script = document.createElement('script')
                script.src = '/acrcloud/acrcloud_sdk.js'
                script.async = true

                script.onload = () => {
                    console.log('ACRCloud SDK script loaded')
                    setIsSDKLoaded(true)
                }

                script.onerror = () => {
                    setError('Failed to load ACRCloud SDK script. Please ensure files are in public/acrcloud/')
                }

                document.body.appendChild(script)
            } catch (err) {
                console.error('Error loading SDK:', err)
                setError('Error loading SDK')
            }
        }

        loadSDK()
    }, [])

    const initRecognizer = useCallback((audioContext: AudioContext) => {
        if (!window.ACRCloud || recognizerRef.current) return

        try {
            // Initialize the recognizer
            // We might need to fetch config from server or just use public keys if safe (usually not safe)
            // OR, if this is just for fingerprinting, maybe keys aren't needed for generation?
            // Usually they are needed to salt/sign the fingerprint.

            // For now, we will assume we need to pass some config. 
            // If the user wants to keep secrets on server, this flow is tricky.
            // HOWEVER, the standard "Web SDK" flow usually implies the client does the recognition directly against ACRCloud.
            // If we want "Client Fingerprint -> My Server -> ACRCloud", we need a specific "Fingerprint Generation" mode.

            console.log('Initializing ACRCloud Recognizer...')
            // Placeholder init - actual parameters depend on the specific SDK version downloaded
            // We will try to instantiate it.

            // NOTE: This part is highly speculative without the docs/files.
            // We will assume a generic "ACRCloud.Recognize" exists.
            recognizerRef.current = new window.ACRCloud.Recognize({
                host: 'placeholder', // These might not be needed just for fingerprinting
                access_key: 'placeholder',
                access_secret: 'placeholder',
                recognizer_type: 0, // Audio
                debug: false,
                audio_context: audioContext,
                sample_rate: audioContext.sampleRate
            })

        } catch (err) {
            console.error('Failed to init recognizer:', err)
        }
    }, [])

    const generateFingerprint = useCallback((audioData: Float32Array, sampleRate: number) => {
        if (!recognizerRef.current) {
            console.warn('Recognizer not initialized')
            return null
        }

        const rec = recognizerRef.current
        return new Promise((resolve, reject) => {
            try {
                if (typeof rec.create_fingerprint === 'function') {
                    const fingerprint = rec.create_fingerprint(audioData, sampleRate)
                    resolve(fingerprint)
                } else {
                    console.warn('create_fingerprint method not found on recognizer')
                    reject('Method not found')
                }
            } catch (err) {
                reject(err)
            }
        })
    }, [])

    return {
        isSDKLoaded,
        error,
        initRecognizer,
        generateFingerprint
    }
}
