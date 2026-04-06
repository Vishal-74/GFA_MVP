/**
 * Older seeds used a Mux playback ID that 404s on stream.mux.com. Remap so learn works without SQL.
 * Working ID verified from @mux/mux-player-react README (public sample asset).
 */
export const MUX_DEMO_PLAYBACK_ID = 'DS00Spx1CV902MCtPj5WknGlR102V5HFkDe'

const REMOVED_OR_INVALID_IDS: Record<string, string> = {
  DS00Spx1CV902NBtzh8YrMVyAH00HTqzN: MUX_DEMO_PLAYBACK_ID,
}

export function resolveMuxPlaybackId(storedId: string | undefined | null): string {
  const id = (storedId || '').trim()
  if (!id) return MUX_DEMO_PLAYBACK_ID
  return REMOVED_OR_INVALID_IDS[id] ?? id
}
