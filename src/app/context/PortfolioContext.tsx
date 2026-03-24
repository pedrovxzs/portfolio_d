import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import {
  portfolioItems as defaultItems,
  type PortfolioItem,
} from "../data/portfolioItems";

interface PortfolioContextType {
  items: PortfolioItem[];
  addItem: (
    item: Omit<PortfolioItem, "id">
  ) => { success: boolean; id?: number };
  removeItem: (id: number) => boolean;
  updateItem: (id: number, item: Partial<PortfolioItem>) => boolean;
  getItemById: (id: number) => PortfolioItem | undefined;
  refreshItems: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(
  undefined
);

const STORAGE_KEY = "portfolio_items";

function initializeItems(): PortfolioItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Erro ao carregar items do localStorage:", error);
  }
  return defaultItems;
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<PortfolioItem[]>(initializeItems);

  // Sincronizar mudanças do localStorage de outras abas/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newItems = JSON.parse(e.newValue);
          setItems(newItems);
        } catch (error) {
          console.error("Erro ao sincronizar portfolio:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Persiste items no localStorage sempre que mudam
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Gera novo ID único e válido (idempotência)
  const generateUniqueId = useCallback((existingItems: PortfolioItem[]) => {
    const maxId = existingItems.length > 0 ? Math.max(...existingItems.map((i) => i.id)) : 0;
    return maxId + 1;
  }, []);

  // Adiciona item com verificação de idempotência
  const addItem = useCallback(
    (itemData: Omit<PortfolioItem, "id">): { success: boolean; id?: number } => {
      try {
        // Valida campos obrigatórios
        if (!itemData.title || !itemData.category || !itemData.media?.source?.src) {
          return { success: false };
        }

        // Verifica se item duplicado (mesmo título e categoria)
        const isDuplicate = items.some(
          (item) => item.title === itemData.title && item.category === itemData.category
        );

        if (isDuplicate) {
          return { success: false };
        }

        const newId = generateUniqueId(items);
        const newItem: PortfolioItem = {
          ...itemData,
          id: newId,
        };

        setItems((prevItems) => [...prevItems, newItem]);
        return { success: true, id: newId };
      } catch (error) {
        console.error("Erro ao adicionar item:", error);
        return { success: false };
      }
    },
    [items, generateUniqueId]
  );

  // Remove item com validação
  const removeItem = useCallback((id: number): boolean => {
    try {
      const exists = items.some((item) => item.id === id);
      if (!exists) {
        return false;
      }

      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      return true;
    } catch (error) {
      console.error("Erro ao remover item:", error);
      return false;
    }
  }, [items]);

  // Atualiza item existente
  const updateItem = useCallback(
    (id: number, updates: Partial<PortfolioItem>): boolean => {
      try {
        const itemExists = items.some((item) => item.id === id);
        if (!itemExists) {
          return false;
        }

        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === id ? { ...item, ...updates, id } : item
          )
        );
        return true;
      } catch (error) {
        console.error("Erro ao atualizar item:", error);
        return false;
      }
    },
    [items]
  );

  // Busca item por ID
  const getItemById = useCallback(
    (id: number): PortfolioItem | undefined => {
      return items.find((item) => item.id === id);
    },
    [items]
  );

  // Força refresh dos items (útil para sincronização manual)
  const refreshItems = useCallback(() => {
    const freshItems = initializeItems();
    setItems(freshItems);
  }, []);

  const value: PortfolioContextType = {
    items,
    addItem,
    removeItem,
    updateItem,
    getItemById,
    refreshItems,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolioContext() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolioContext deve ser usado dentro de PortfolioProvider");
  }
  return context;
}
