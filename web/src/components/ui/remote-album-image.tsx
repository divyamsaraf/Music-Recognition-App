'use client'

import Image from 'next/image'
import { useState, type ReactNode } from 'react'

type RemoteAlbumImageProps = {
    src: string
    alt: string
    sizes: string
    className?: string
    priority?: boolean
    fallback: ReactNode
}

/**
 * Remote cover art with next/image; on load failure renders `fallback` (same pattern as prior <img onError />).
 */
export function RemoteAlbumImage({
    src,
    alt,
    sizes,
    className,
    priority,
    fallback,
}: RemoteAlbumImageProps) {
    const [failed, setFailed] = useState(false)
    if (failed) return <>{fallback}</>
    return (
        <div className="relative h-full w-full">
            <Image
                src={src}
                alt={alt}
                fill
                sizes={sizes}
                className={className}
                priority={priority}
                onError={() => setFailed(true)}
            />
        </div>
    )
}
