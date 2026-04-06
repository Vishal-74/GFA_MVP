"use client"

import { useEffect, useMemo, useState } from "react"
import { Camera, User, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfileCardProps {
  name?: string
  title?: string
  avatarUrl?: string
  backgroundUrl?: string
  likes?: number
  posts?: number
  views?: number
  instagramUrl?: string
  twitterUrl?: string
  threadsUrl?: string
  showFollowButton?: boolean
  /** Shows the decorative progress bar row (was labeled "exp."). */
  showExpBar?: boolean
  showStats?: boolean
  showSocialIcons?: boolean
  className?: string
}

export function ProfileCard({
  name = "Faculty of Economics",
  title = "A calm, modern card adapted to the GFA dark theme.",
  avatarUrl,
  backgroundUrl,
  likes = 72900,
  posts = 828,
  views = 342900,
  instagramUrl,
  twitterUrl,
  threadsUrl,
  showFollowButton = true,
  showExpBar = false,
  showStats = true,
  showSocialIcons = true,
  className,
}: ProfileCardProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)
  const [expProgress, setExpProgress] = useState(0)
  const [animatedLikes, setAnimatedLikes] = useState(0)
  const [animatedPosts, setAnimatedPosts] = useState(0)
  const [animatedViews, setAnimatedViews] = useState(0)

  const hasAnySocial = useMemo(
    () => Boolean(instagramUrl || twitterUrl || threadsUrl),
    [instagramUrl, twitterUrl, threadsUrl]
  )

  // Animate experience bar
  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setExpProgress((prev) => {
          if (prev >= 65) {
            clearInterval(interval)
            return 65
          }
          return prev + 1
        })
      }, 20)
      return () => clearInterval(interval)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // Animate counters
  useEffect(() => {
    if (!showStats) return

    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps

    const likesIncrement = likes / steps
    const postsIncrement = posts / steps
    const viewsIncrement = views / steps

    let currentStep = 0

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        currentStep++
        setAnimatedLikes(Math.min(Math.floor(likesIncrement * currentStep), likes))
        setAnimatedPosts(Math.min(Math.floor(postsIncrement * currentStep), posts))
        setAnimatedViews(Math.min(Math.floor(viewsIncrement * currentStep), views))

        if (currentStep >= steps) {
          clearInterval(interval)
        }
      }, stepDuration)
      return () => clearInterval(interval)
    }, 500)

    return () => clearTimeout(timer)
  }, [likes, posts, views, showStats])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className={cn("mx-auto flex h-full w-full max-w-sm flex-col", className)}>
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem] border border-gfa-border/80 bg-gradient-to-b from-gfa-rose/35 via-gfa-rose/20 to-gfa-canvas/20 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.11),inset_1px_0_0_rgba(255,255,255,0.05),inset_-1px_0_0_rgba(255,255,255,0.05)] backdrop-blur-sm">
        {/* Header: gradient only unless `backgroundUrl` is set */}
        <div className="relative h-40 shrink-0 overflow-hidden bg-gradient-to-br from-gfa-hero-from via-gfa-hero-via to-gfa-hero-to">
          {backgroundUrl ? (
            <img
              src={backgroundUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-55"
              loading="lazy"
            />
          ) : null}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 22% 22%, rgba(96, 165, 250, 0.14), transparent 56%), linear-gradient(180deg, rgba(5, 7, 10, 0.08), rgba(5, 7, 10, 0.48))",
            }}
          />

          {showFollowButton ? (
            <button
              type="button"
              onClick={() => setIsFollowing(!isFollowing)}
              className={`absolute right-4 top-4 rounded-full px-5 py-2 text-[13px] font-medium tracking-wide transition-all duration-200 ${
                isFollowing
                  ? "border border-gfa-border bg-gfa-canvas/70 text-gfa-fg hover:bg-gfa-rose/30"
                  : "border border-gfa-border bg-gfa-canvas/70 text-gfa-fg hover:bg-gfa-rose/30"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
              <span className="ml-2 text-lg">{isFollowing ? "✓" : "+"}</span>
            </button>
          ) : null}
        </div>

        {/* Profile content — avatar overlaps header slightly (original layout) */}
        <div className="-mt-12 flex min-h-0 flex-1 flex-col px-6 pb-6">
          <div className="flex min-h-0 flex-1 items-stretch gap-4">
            <div className="relative h-24 w-24 shrink-0">
              <div
                className="h-full w-full overflow-hidden rounded-full border-2 border-gfa-accent/40 bg-gradient-to-br from-gfa-ink via-gfa-elevated to-gfa-deep shadow-[0_10px_32px_-10px_rgba(0,0,0,0.75)] ring-2 ring-gfa-accent/25 ring-offset-2 ring-offset-[rgba(11,16,32,0.85)]"
              >
                {avatarUrl && !avatarFailed ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={() => setAvatarFailed(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gfa-deep via-gfa-elevated to-gfa-hero-from">
                    <User className="h-8 w-8 text-gfa-accent-soft/90" aria-hidden />
                  </div>
                )}
              </div>
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col rounded-2xl border border-gfa-border/80 bg-gradient-to-b from-gfa-canvas/55 to-gfa-canvas/20 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.09),inset_1px_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md">
              <h2 className="line-clamp-3 text-[18px] font-semibold leading-tight tracking-tight text-gfa-fg-bright [overflow-wrap:anywhere]">
                {name}
              </h2>
              <p className="mt-2 text-[13px] font-light leading-relaxed text-gfa-muted [overflow-wrap:anywhere] break-words">
                {title}
              </p>
            </div>
          </div>

            {/* Decorative progress bar (optional) */}
            {showExpBar ? (
              <div className="mt-6">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm text-gfa-muted font-light">progress</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full border border-gfa-border/60 bg-gfa-rose/35">
                    <div
                      className="h-full bg-gradient-to-r from-gfa-accent via-gfa-accent-bright to-gfa-accent-soft transition-all duration-300 ease-out"
                      style={{ width: `${expProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : null}

          {/* Stats */}
          {showStats ? (
            <div className="mt-6 grid grid-cols-3 gap-4 border-y border-gfa-border py-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gfa-fg-bright mb-1">{formatNumber(animatedLikes)}</div>
                <div className="text-xs text-gfa-muted font-light">Likes</div>
              </div>
              <div className="text-center border-l border-r border-gfa-border">
                <div className="text-2xl font-semibold text-gfa-fg-bright mb-1">{animatedPosts}</div>
                <div className="text-xs text-gfa-muted font-light">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gfa-fg-bright mb-1">{formatNumber(animatedViews)}</div>
                <div className="text-xs text-gfa-muted font-light">Views</div>
              </div>
            </div>
          ) : null}

          {/* Social icons */}
          {showSocialIcons && hasAnySocial ? (
            <div className="mt-6 flex justify-center gap-6">
              {instagramUrl ? (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-gfa-rose/30 rounded-lg transition-colors"
                  aria-label="Social profile"
                >
                  <Camera className="w-5 h-5 text-gfa-fg" />
                </a>
              ) : null}
              {twitterUrl ? (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-gfa-rose/30 rounded-lg transition-colors"
                  aria-label="X profile"
                >
                  <X className="w-5 h-5 text-gfa-fg" />
                </a>
              ) : null}
              {threadsUrl ? (
                <a
                  href={threadsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-gfa-rose/30 rounded-lg transition-colors"
                  aria-label="Threads Profile"
                >
                  <svg
                    className="w-5 h-5 text-gfa-fg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

