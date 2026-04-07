'use client'

import MuxPlayer from '@mux/mux-player-react'
import { resolveMuxPlaybackId } from '@/lib/mux-playback'

export default function OfficeMuxPlayer({ playbackId }: { playbackId: string | null | undefined }) {
  const id = resolveMuxPlaybackId(playbackId)
  return (
    <MuxPlayer
      streamType="on-demand"
      playbackId={id}
      className="aspect-video w-full overflow-hidden rounded-2xl border border-gfa-border bg-black"
    />
  )
}
