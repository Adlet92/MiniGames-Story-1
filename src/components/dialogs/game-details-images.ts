const HERO_IMAGES: Record<string, string> = import.meta.glob<string>('../../assets/*-hero.jpg', {
  eager: true,
  import: 'default',
  query: '?url',
});
const CARD_IMAGES: Record<string, string> = import.meta.glob<string>('../../assets/*-card.jpg', {
  eager: true,
  import: 'default',
  query: '?url',
});

export function getGameHeroImage(gameSlug: string, fallback: string): string {
  const heroPath: string = `../../assets/${gameSlug}-hero.jpg`;
  const cardPath: string = `../../assets/${gameSlug}-card.jpg`;
  return HERO_IMAGES[heroPath] ?? CARD_IMAGES[cardPath] ?? fallback;
}
