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
  {
    id: 3,
    title: "Projeto IMG_1793",
    category: "Artes",
    media: {
      kind: "image",
      source: {
        type: "local",
        src: "portfolio/IMG_1793.PNG",
      },
    },
    description: "Sua obra de arte criativa",
  },
  {
    id: 4,
    title: "Projeto IMG_1794",
    category: "Artes",
    media: {
      kind: "image",
      source: {
        type: "local",
        src: "portfolio/IMG_1794.PNG",
      },
    },
    description: "Sua obra de arte criativa",
  },
  {
    id: 5,
    title: "Projeto IMG_1796",
    category: "Artes",
    media: {
      kind: "image",
      source: {
        type: "local",
        src: "portfolio/IMG_1796.PNG",
      },
    },
    description: "Sua obra de arte criativa",
  },
  {
    id: 6,
    title: "Projeto IMG_1798",
    category: "Artes",
    media: {
      kind: "image",
      source: {
        type: "local",
        src: "portfolio/IMG_1798.PNG",
      },
    },
    description: "Sua obra de arte criativa",
  },
  {
    id: 7,
    title: "Projeto IMG_1799",
    category: "Artes",
    media: {
      kind: "image",
      source: {
        type: "local",
        src: "portfolio/IMG_1799.PNG",
      },
    },
    description: "Sua obra de arte criativa",
  },
  {
    id: 8,
    title: "Projeto IMG_1800",
    category: "Artes",
    media: {
      kind: "image",
      source: {
        type: "local",
        src: "portfolio/IMG_1800.PNG",
      },
    },
    description: "Sua obra de arte criativa",
  },
  {
    id: 9,
    title: "Projeto IMG_1801",
    category: "Artes",
    media: {
      kind: "image",
      source: {
        type: "local",
        src: "portfolio/IMG_1801.PNG",
      },
    },
    description: "Sua obra de arte criativa",
  },
  {
    id: 10,
    title: "Projeto IMG_1802",
    category: "Artes",
    media: {
      kind: "image",
      source: {
        type: "local",
        src: "portfolio/IMG_1802.PNG",
      },
    },
    description: "Sua obra de arte criativa",
  },
  {
    id: 11,
    title: "Projeto IMG_1803",
    category: "Artes",
    media: {
      kind: "image",
      source: {
        type: "local",
        src: "portfolio/IMG_1803.PNG",
      },
    },
    description: "Sua obra de arte criativa",
  },
  {
    id: 12,
    title: "Projeto IMG_1804",
    category: "Artes",
    media: {
      kind: "image",
      source: {
        type: "local",
        src: "portfolio/IMG_1804.PNG",
      },
    },
    description: "Sua obra de arte criativa",
  },
  {
    id: 13,
    title: "Projeto IMG_1805",
    category: "Artes",
    media: {
      kind: "image",
      source: {
        type: "local",
        src: "portfolio/IMG_1805.PNG",
      },
    },
    description: "Sua obra de arte criativa",
  },
  {
    id: 14,
    title: "Projeto IMG_1806",
    category: "Artes",
    media: {
      kind: "image",
      source: {
        type: "local",
        src: "portfolio/IMG_1806.PNG",
      },
    },
    description: "Sua obra de arte criativa",
  },
  {
    id: 15,
    title: "Projeto IMG_1807",
    category: "Artes",
    media: {
      kind: "image",
      source: {
        type: "local",
        src: "portfolio/IMG_1807.PNG",
      },
    },
    description: "Sua obra de arte criativa",
  },
  {
    id: 16,
    title: "Video IMG_0387",
    category: "Videos",
    media: {
      kind: "video",
      source: {
        type: "local",
        src: "portfolio/IMG_0387.MOV",
      },
      previewSource: {
        type: "local",
        src: "portfolio/IMG_1793.PNG",
      },
    },
    description: "Video de seu portfolio",
  },
  {
    id: 17,
    title: "Video IMG_1788",
    category: "Videos",
    media: {
      kind: "video",
      source: {
        type: "local",
        src: "portfolio/IMG_1788.MOV",
      },
      previewSource: {
        type: "local",
        src: "portfolio/IMG_1794.PNG",
      },
    },
    description: "Video de seu portfolio",
  },
  {
    id: 18,
    title: "Video IMG_1792",
    category: "Videos",
    media: {
      kind: "video",
      source: {
        type: "local",
        src: "portfolio/IMG_1792.MOV",
      },
      previewSource: {
        type: "local",
        src: "portfolio/IMG_1796.PNG",
      },
    },
    description: "Video de seu portfolio",
  },
  {
    id: 19,
    title: "Video IMG_7974",
    category: "Videos",
    media: {
      kind: "video",
      source: {
        type: "local",
        src: "portfolio/IMG_7974.MOV",
      },
      previewSource: {
        type: "local",
        src: "portfolio/IMG_1798.PNG",
      },
    },
    description: "Video de seu portfolio",
  },
];