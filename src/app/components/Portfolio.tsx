import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Headphones,
  ImageIcon,
  Play,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  getPortfolioMediaPreviewSrc,
  getPortfolioMediaSrc,
  type PortfolioItem,
} from "../data/portfolioItems";
import { usePortfolioItems } from "../hooks/usePortfolioItems";

const ITEMS_PER_PAGE = 6;

const mediaKindLabelMap: Record<PortfolioItem["media"]["kind"], string> = {
  image: "Imagem",
  video: "Video",
  audio: "Audio",
};

export function Portfolio() {
  const portfolioItems = usePortfolioItems();
  const [activeCategory, setActiveCategory] = useState<string>("Todas");
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [activePage, setActivePage] = useState<number>(1);

  const categories = useMemo(() => {
    const itemCategories = Array.from(
      new Set(portfolioItems.map((item) => item.category)),
    );
    return ["Todas", ...itemCategories];
  }, [portfolioItems]);

  const filteredItems = useMemo(() => {
    let items = portfolioItems;

    if (activeCategory !== "Todas") {
      items = items.filter((item) => item.category === activeCategory);
    }

    return items;
  }, [activeCategory, portfolioItems]);

  useEffect(() => {
    if (activeCategory === "Todas") {
      return;
    }

    const categoryStillExists = portfolioItems.some(
      (item) => item.category === activeCategory,
    );

    if (!categoryStillExists) {
      setActiveCategory("Todas");
      setActivePage(1);
      setActiveItemIndex(null);
    }
  }, [activeCategory, portfolioItems]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

  const paginatedItems = useMemo(() => {
    const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, endIndex);
  }, [activePage, filteredItems]);

  const activeItem =
    activeItemIndex === null ? null : filteredItems[activeItemIndex];

  const handleOpenItem = (itemIndex: number) => {
    setActiveItemIndex(itemIndex);
  };

  const handleCloseItem = () => {
    setActiveItemIndex(null);
  };

  const handlePreviousItem = () => {
    if (activeItemIndex === null || filteredItems.length === 0) {
      return;
    }

    const previousIndex =
      (activeItemIndex - 1 + filteredItems.length) % filteredItems.length;
    setActiveItemIndex(previousIndex);
  };

  const handleNextItem = () => {
    if (activeItemIndex === null || filteredItems.length === 0) {
      return;
    }

    const nextIndex = (activeItemIndex + 1) % filteredItems.length;
    setActiveItemIndex(nextIndex);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setActiveItemIndex(null);
    setActivePage(1);
  };

  const handlePreviousPage = () => {
    setActivePage((currentPage) => Math.max(1, currentPage - 1));
  };

  const handleNextPage = () => {
    setActivePage((currentPage) => Math.min(totalPages, currentPage + 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeItem) return;

      if (e.key === "ArrowLeft") {
        handlePreviousItem();
      } else if (e.key === "ArrowRight") {
        handleNextItem();
      } else if (e.key === "Escape") {
        handleCloseItem();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeItem, activeItemIndex, filteredItems.length]);

  const renderMediaPreview = (item: PortfolioItem) => {
    if (item.media.kind === "video") {
      return (
        <>
          <video
            src={getPortfolioMediaSrc(item.media)}
            poster={getPortfolioMediaPreviewSrc(item.media)}
            className="w-full h-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
            <div className="w-14 h-14 rounded-full bg-white/85 text-foreground flex items-center justify-center">
              <Play size={22} className="ml-1" />
            </div>
          </div>
        </>
      );
    }

    if (item.media.kind === "audio") {
      if (item.media.previewSource) {
        return (
          <img
            src={getPortfolioMediaPreviewSrc(item.media)}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        );
      }

      return (
        <div className="w-full h-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
          <Headphones size={44} className="text-foreground/70" />
        </div>
      );
    }

    return (
      <img
        src={getPortfolioMediaSrc(item.media)}
        alt={item.title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
    );
  };

  const renderModalMedia = (item: PortfolioItem) => {
    if (item.media.kind === "video") {
      return (
        <video
          src={getPortfolioMediaSrc(item.media)}
          poster={getPortfolioMediaPreviewSrc(item.media)}
          className="w-full max-h-[70vh] rounded-2xl"
          controls
          autoPlay
          playsInline
        />
      );
    }

    if (item.media.kind === "audio") {
      return (
        <div className="w-full rounded-2xl bg-white/10 p-6">
          {item.media.previewSource ? (
            <img
              src={getPortfolioMediaPreviewSrc(item.media)}
              alt={item.title}
              className="w-full max-h-[42vh] object-cover rounded-xl mb-6"
            />
          ) : (
            <div className="w-full h-56 rounded-xl bg-white/10 flex items-center justify-center mb-6">
              <Headphones size={48} className="text-white/70" />
            </div>
          )}
          <audio
            src={getPortfolioMediaSrc(item.media)}
            controls
            autoPlay
            className="w-full"
          >
            Seu navegador nao suporta o player de audio.
          </audio>
        </div>
      );
    }

    return (
      <img
        src={getPortfolioMediaSrc(item.media)}
        alt={item.title}
        className="w-full max-h-[70vh] object-contain rounded-2xl"
      />
    );
  };

  return (
    <section id="portfolio" className="py-20 px-6 bg-muted">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-6 py-2 bg-white rounded-full mb-4">
            <span className="text-sm text-primary">Portfólio</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Meus Trabalhos
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Organize seus trabalhos por categoria com paginacao e visualizacao detalhada em modal
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-full text-sm transition-colors duration-200 ${
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-white text-foreground hover:bg-secondary"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground">
            Mostrando {paginatedItems.length} de {filteredItems.length} trabalhos
            {activeCategory !== "Todas" ? ` em ${activeCategory}` : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedItems.map((project, index) => {
            const absoluteItemIndex = (activePage - 1) * ITEMS_PER_PAGE + index;

            return (
            <div
              key={project.id}
              className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div
                className="relative h-64 overflow-hidden cursor-pointer"
                onClick={() => handleOpenItem(absoluteItemIndex)}
              >
                {renderMediaPreview(project)}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenItem(absoluteItemIndex);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-foreground rounded-full"
                  >
                    <span className="text-sm">Abrir Midia</span>
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full mb-3">
                  {project.media.kind === "image" ? (
                    <ImageIcon size={12} />
                  ) : project.media.kind === "video" ? (
                    <Play size={12} />
                  ) : (
                    <Headphones size={12} />
                  )}
                  {mediaKindLabelMap[project.media.kind]}
                </span>
                <span className="inline-block ml-2 px-3 py-1 bg-accent text-accent-foreground text-xs rounded-full mb-3">
                  {project.category}
                </span>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {project.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {project.description}
                </p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={`${project.id}-${tech}`}
                        className="inline-block px-2 py-1 text-xs rounded-md bg-primary/10 text-primary"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              Nenhum trabalho encontrado para os filtros selecionados.
            </p>
          </div>
        )}

        {filteredItems.length > ITEMS_PER_PAGE && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handlePreviousPage}
              disabled={activePage === 1}
              className="px-4 py-2 rounded-full bg-white text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <p className="text-sm text-muted-foreground">
              Pagina {activePage} de {totalPages}
            </p>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={activePage === totalPages}
              className="px-4 py-2 rounded-full bg-white text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proxima
            </button>
          </div>
        )}

        {activeItem && (
          <div
            className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            onClick={handleCloseItem}
          >
            <button
              type="button"
              onClick={handleCloseItem}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Fechar visualizacao"
            >
              <X size={18} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePreviousItem();
              }}
              className="absolute left-4 md:left-8 p-3 rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Imagem anterior"
            >
              <ChevronLeft size={22} />
            </button>

            <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              {renderModalMedia(activeItem)}

              <div className="mt-4 text-center text-white">
                <p className="text-sm mb-1">
                  {activeItem.category} • {mediaKindLabelMap[activeItem.media.kind]}
                </p>
                <h3 className="text-xl font-semibold">{activeItem.title}</h3>
                <p className="text-sm text-white/80 mt-2">
                  {activeItem.description}
                </p>
                {activeItem.technologies && activeItem.technologies.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    {activeItem.technologies.map((tech) => (
                      <span
                        key={`${activeItem.id}-${tech}`}
                        className="inline-block px-2 py-1 rounded-md bg-white/15 text-white text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-white/60 mt-3">
                  {(activeItemIndex ?? 0) + 1} de {filteredItems.length}
                </p>
                <p className="text-xs text-white/50 mt-2">
                  ⬅️ ➡️ Navegue • ESC Fechar
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextItem();
              }}
              className="absolute right-4 md:right-8 p-3 rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Proxima imagem"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
