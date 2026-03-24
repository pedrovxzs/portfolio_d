import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { LogOut, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { portfolioItems, type PortfolioItem } from "../data/portfolioItems";

export function AdminPanel() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    mediaUrl: "",
    mediaKind: "image" as const,
  });
  const [showForm, setShowForm] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Carrega items do localStorage
    const saved = localStorage.getItem("portfolio_items");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems(portfolioItems);
      }
    } else {
      setItems(portfolioItems);
    }
  }, []);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.mediaUrl) {
      alert("Preencha todos os campos!");
      return;
    }

    const newItem: PortfolioItem = {
      id: Math.max(...items.map((i) => i.id), 0) + 1,
      title: formData.title,
      category: formData.category,
      description: formData.description,
      media: {
        kind: formData.mediaKind,
        source: {
          type: "url",
          src: formData.mediaUrl,
        },
      },
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    localStorage.setItem("portfolio_items", JSON.stringify(updatedItems));

    setFormData({
      title: "",
      category: "",
      description: "",
      mediaUrl: "",
      mediaKind: "image",
    });
    setShowForm(false);
    alert("Item adicionado com sucesso!");
  };

  const handleDeleteItem = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este item?")) {
      const updatedItems = items.filter((item) => item.id !== id);
      setItems(updatedItems);
      localStorage.setItem("portfolio_items", JSON.stringify(updatedItems));
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Painel Admin</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie seus itens de portfolio
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>

        {/* Botão Adicionar */}
        <div className="mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            <Plus size={20} />
            {showForm ? "Cancelar" : "Adicionar Item"}
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Novo Item
            </h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Ex: Meu Projeto"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="Ex: Artes, Videos"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tipo de Mídia
                  </label>
                  <select
                    value={formData.mediaKind}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mediaKind: e.target.value as "image" | "video" | "audio",
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="image">Imagem</option>
                    <option value="video">Vídeo</option>
                    <option value="audio">Áudio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    URL da Mídia
                  </label>
                  <input
                    type="url"
                    value={formData.mediaUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, mediaUrl: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descreva seu projeto..."
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Adicionar Item
              </button>
            </form>
          </div>
        )}

        {/* Lista de Items */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-foreground">
              Items do Portfolio ({items.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {items.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum item adicionado ainda
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded mr-2">
                          {item.category}
                        </span>
                        <span className="inline-block px-2 py-1 bg-secondary/10 text-secondary-foreground rounded">
                          {item.media.kind}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {item.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Dica Importante</h3>
          <p className="text-sm text-blue-800">
            Os items são salvos em localStorage e aparecerão no seu portfolio.
            Para adicionar imagens locais, você precisará fazer upload em um
            serviço como Imgur ou similar e colar a URL aqui.
          </p>
        </div>
      </div>
    </div>
  );
}
