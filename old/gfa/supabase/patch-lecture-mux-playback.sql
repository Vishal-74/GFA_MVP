-- Run once in Supabase SQL if lectures still use an old/broken Mux playback ID.
-- Matches the ID from @mux/mux-player-react README (public sample asset).

UPDATE lectures
SET mux_asset_id = 'DS00Spx1CV902MCtPj5WknGlR102V5HFkDe'
WHERE mux_asset_id = 'DS00Spx1CV902NBtzh8YrMVyAH00HTqzN';
