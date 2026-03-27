export interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  media: PortfolioMedia;
  description: string;
}

export interface PortfolioAssetSource {
  type: "url" | "local";
  src: string;
}

export interface PortfolioMedia {
  kind: "image" | "video" | "audio";
  source: PortfolioAssetSource;
  previewSource?: PortfolioAssetSource;
}

function resolvePortfolioAssetSrc(source: PortfolioAssetSource): string {
  if (source.type === "url") {
    return source.src;
  }

  const normalizedPath = source.src.replace(/^\/+/, "");
  return `/assets/${normalizedPath}`;
}

export function getPortfolioMediaSrc(media: PortfolioMedia): string {
  return resolvePortfolioAssetSrc(media.source);
}

export function getPortfolioMediaPreviewSrc(media: PortfolioMedia): string {
  if (media.previewSource) {
    return resolvePortfolioAssetSrc(media.previewSource);
  }

  return getPortfolioMediaSrc(media);
}

// To add a new work, duplicate one object and update its values.
// Keep the category name consistent to group items together.
// For media source files:
// - URL: { type: "url", src: "https://..." }
// - Local file in src/assets/portfolio: { type: "local", src: "portfolio/minha-arte.jpg" }
// Media examples:
// - image: { kind: "image", source: { ... } }
// - video: { kind: "video", source: { ... }, previewSource: { ... } }
// - audio: { kind: "audio", source: { ... }, previewSource: { ... } }
export const portfolioItems: PortfolioItem[] = [
  
];