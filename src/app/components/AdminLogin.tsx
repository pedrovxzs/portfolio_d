import { useState } from "react";
import { useNavigate } from "react-router";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (login(password)) {
        navigate("/admin");
      } else {
        setError("Senha incorreta! Tente novamente.");
        setPassword("");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Lock size={32} className="text-primary" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-foreground mb-2">
            Painel Admin
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Digite sua senha para acessar
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verificando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <a
              href="/"
              className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors block"
            >
              ← Voltar ao portfolio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
