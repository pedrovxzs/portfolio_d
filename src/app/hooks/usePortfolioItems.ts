import { usePortfolioContext } from "../context/PortfolioContext";

/**
 * Hook que retorna os itens do portfolio
 * Sincroniza automaticamente com mudanças de outras abas/windows
 * @deprecated Use usePortfolioData() instead for full functionality
 * Mantido para compatibilidade com código existente
 */
export function usePortfolioItems() {
  const { items } = usePortfolioContext();
  return items;
}
