import { useState, useEffect } from "react";
import { portfolioItems as defaultItems, type PortfolioItem } from "../data/portfolioItems";

export function usePortfolioItems() {
  const [items, setItems] = useState<PortfolioItem[]>(defaultItems);

  useEffect(() => {
    // Tenta carregar do localStorage
    const saved = localStorage.getItem("portfolio_items");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems(defaultItems);
      }
    }
  }, []);

  return items;
}
