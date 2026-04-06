/** Hero images for programme cards — distinct Unsplash art per track. */
export function programCardImageUrl(slug: string): string {
  const bySlug: Record<string, string> = {
    // Library / foundations — undergraduate breadth
    bachelor:
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=85&auto=format&fit=crop',
    // Graduate / focus — advanced study
    master:
      'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&q=85&auto=format&fit=crop',
  }
  return bySlug[slug] ?? bySlug.bachelor
}
