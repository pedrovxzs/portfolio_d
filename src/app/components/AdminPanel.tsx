import { useState } from "react";
import { useNavigate } from "react-router";
import { LogOut, Plus, Trash2, Upload, Check, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePortfolioData } from "../hooks/usePortfolioData";
import { useMediaUpload } from "../hooks/useMediaUpload";
import { type PortfolioMedia } from "../data/portfolioItems";

interface FormData {
  title: string;
  category: string;
  description: string;
  mediaUrl: string;
  mediaKind: PortfolioMedia["kind"];
  mediaFile: File | null;
}

export function AdminPanel() {
  const { items, loading, error, addItem, removeItem, updateItem } = usePortfolioData();
  const { uploadFile, loading: uploading, error: uploadError, progress } = useMediaUpload();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    category: "",
    description: "",
    mediaUrl: "",
    mediaKind: "image",
    mediaFile: null,
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      category: "",
      description: "",
      mediaUrl: "",
      mediaKind: "image",
      mediaFile: null,
    });
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (id: number) => {
    const item = items.find((portfolioItem) => portfolioItem.id === id);
    if (!item) return;

    setEditingId(id);
    setFormData({
      title: item.title,
      category: item.category,
      description: item.description,
      mediaUrl: item.media.source.src,
      mediaKind: item.media.kind,
      mediaFile: null,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  // Limpa mensagem de feedback após 3 segundos
  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFormData({ ...formData, mediaFile: file });
      showFeedback("success", "Fazendo upload do arquivo...");
      
      const uploadedUrl = await uploadFile(file);
      if (!uploadedUrl) {
        throw new Error("Upload não retornou URL válida");
      }

      setFormData((prev) => ({
        ...prev,
        mediaUrl: uploadedUrl,
        mediaFile: null, // Limpa após sucesso
      }));
      showFeedback("success", "Arquivo enviado com sucesso!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro no upload";
      showFeedback("error", message);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.mediaUrl) {
      showFeedback("error", "Preencha todos os campos obrigatórios!");
      return;
    }

    const result = await addItem({
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
    });

    if (result.success) {
      closeForm();
      showFeedback("success", "Item adicionado com sucesso!");
    } else {
      showFeedback("error", "Erro ao adicionar item. Verifique os dados e tente novamente.");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId === null) {
      showFeedback("error", "Selecione um item para edição.");
      return;
    }

    if (!formData.title || !formData.category || !formData.mediaUrl) {
      showFeedback("error", "Preencha todos os campos obrigatórios!");
      return;
    }

    const success = await updateItem(editingId, {
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
    });

    if (success) {
      closeForm();
      showFeedback("success", "Item atualizado com sucesso!");
      return;
    }

    showFeedback("error", "Erro ao atualizar item.");
  };

  const handleDeleteItem = async (id: number) => {
    const success = await removeItem(id);
    if (!success) {
      showFeedback("error", "Erro ao remover item.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Feedback Message */}
        {feedbackMessage && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              feedbackMessage.type === "success"
                ? "bg-green-100 border border-green-400 text-green-800"
                : "bg-red-100 border border-red-400 text-red-800"
            }`}
          >
            {feedbackMessage.text}
          </div>
        )}

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

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-100 border border-yellow-400 text-yellow-800">
            {error}
          </div>
        )}

        {/* Botão Adicionar */}
        <div className="mb-8">
          <button
            onClick={() => {
              if (showForm) {
                closeForm();
              } else {
                openCreateForm();
              }
            }}
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
              {editingId === null ? "Novo Item" : "Editar Item"}
            </h2>
            <form
              onSubmit={editingId === null ? handleAddItem : handleSaveEdit}
              className="space-y-4"
            >
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
                    Arquivo de Mídia (Imagem/Vídeo)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,video/*"
                      disabled={uploading}
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg focus:outline-none focus:border-primary cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </div>
                  {uploading && (
                    <div className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                      <Upload size={14} className="animate-spin" />
                      Enviando... {progress}%
                    </div>
                  )}
                  {uploadError && (
                    <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle size={14} />
                      {uploadError}
                    </div>
                  )}
                  {formData.mediaUrl && (
                    <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                      <Check size={14} />
                      Arquivo enviado com sucesso!
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Formatos suportados: JPG, PNG, WebP (imagens) | MP4, WebM (vídeos) | Máximo 100MB
                  </p>
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
                {editingId === null ? "Adicionar Item" : "Salvar Alterações"}
              </button>
            </form>
          </div>
        )}

        {/* Lista de Items */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-foreground">
              Items do Portfolio {loading ? "(carregando...)" : `(${items.length})`}
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
                    <div className="ml-4 flex items-center gap-2">
                      <button
                        onClick={() => openEditForm(item.id)}
                        className="px-3 py-2 text-sm bg-gray-100 text-foreground hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Upload com Vercel Blob</h3>
          <p className="text-sm text-blue-800">
            Seus arquivos são agora enviados diretamente para o Vercel Blob, um serviço gratuito de armazenamento
            integrado ao Vercel. Os itens do portfólio são persistidos no Vercel Postgres, então aparecem
            corretamente entre diferentes dispositivos e sessões.
          </p>
        </div>
      </div>
    </div>
  );
}
