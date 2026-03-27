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
  loading: boolean;
  error: string | null;
  addItem: (
    item: Omit<PortfolioItem, "id">
  ) => Promise<{ success: boolean; id?: number }>;
  removeItem: (id: number) => Promise<boolean>;
  updateItem: (id: number, item: Partial<PortfolioItem>) => Promise<boolean>;
  getItemById: (id: number) => PortfolioItem | undefined;
  refreshItems: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(
  undefined
);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<PortfolioItem[]>(defaultItems);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/portfolio-data");

      if (!response.ok) {
        throw new Error("Falha ao carregar portfolio remoto");
      }

      const remoteItems = (await response.json()) as PortfolioItem[];
      setItems(remoteItems);
      setError(null);
    } catch (fetchError) {
      console.error("Erro ao carregar portfolio remoto:", fetchError);
      setItems(defaultItems);
      setError("Usando dados locais temporariamente. Verifique a API.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshItems();
  }, [refreshItems]);

  // Adiciona item com verificação de idempotência
  const addItem = useCallback(
    async (itemData: Omit<PortfolioItem, "id">): Promise<{ success: boolean; id?: number }> => {
      try {
        if (!itemData.title || !itemData.category || !itemData.media?.source?.src) {
          return { success: false };
        }

        const isDuplicate = items.some(
          (item) => item.title === itemData.title && item.category === itemData.category
        );

        if (isDuplicate) {
          return { success: false };
        }

        const response = await fetch("/api/portfolio-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        });

        if (!response.ok) {
          return { success: false };
        }

        const created = await response.json();
        const newId = created.id as number;
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
    [items]
  );

  const removeItem = useCallback(async (id: number): Promise<boolean> => {
    try {
      const exists = items.some((item) => item.id === id);
      if (!exists) {
        return false;
      }

      const response = await fetch(`/api/portfolio-data?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        return false;
      }

      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      return true;
    } catch (error) {
      console.error("Erro ao remover item:", error);
      return false;
    }
  }, [items]);

  const updateItem = useCallback(
    async (id: number, updates: Partial<PortfolioItem>): Promise<boolean> => {
      try {
        const itemExists = items.some((item) => item.id === id);
        if (!itemExists) {
          return false;
        }

        const response = await fetch("/api/portfolio-data", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, updates }),
        });

        if (!response.ok) {
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

  const getItemById = useCallback(
    (id: number): PortfolioItem | undefined => {
      return items.find((item) => item.id === id);
    },
    [items]
  );

  const value: PortfolioContextType = {
    items,
    loading,
    error,
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
