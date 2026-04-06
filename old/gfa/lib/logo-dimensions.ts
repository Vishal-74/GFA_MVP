/**
 * Fixed logo size for the nav (after removing the runtime adjuster).
 * Edit `LOGO_*` if you change the asset or want a different visual size.
 */
/** Taller wordmark so the nav logo reads clearly (was 56 / 340). */
export const LOGO_HEIGHT_PX = 96
export const LOGO_MAX_WIDTH_PX = 480

/** Matches `Navigation`: `py-2` (16px total) + bottom border (1px). */
const NAV_VERTICAL_PAD_PX = 16
const NAV_BORDER_PX = 1

/** Space reserved below the fixed nav so content clears the bar. */
export const MAIN_CONTENT_TOP_OFFSET_PX = LOGO_HEIGHT_PX + NAV_VERTICAL_PAD_PX + NAV_BORDER_PX
