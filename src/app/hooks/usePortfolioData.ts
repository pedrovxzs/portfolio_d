import { usePortfolioContext } from "../context/PortfolioContext";

/**
 * Hook que fornece acesso aos dados e operações do portfolio
 * com segurança contra duplicação (idempotência)
 */
export function usePortfolioData() {
  return usePortfolioContext();
}
