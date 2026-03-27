import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { LogOut, Plus, Trash2, Upload, Check, AlertCircle, X, FileText } from "lucide-react";
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

interface BulkFileUpload {
  id: string;
  file: File;
  progress: number;
  loading: boolean;
  error: string | null;
  url: string | null;
  syncedToPortfolio: boolean;
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
  const [aboutContent, setAboutContent] = useState("");
  const [aboutLoading, setAboutLoading] = useState(false);
  const [bulkFiles, setBulkFiles] = useState<BulkFileUpload[]>([]);
  const [activeTab, setActiveTab] = useState<"portfolio" | "about" | "bulk">("portfolio");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const inferMediaKindFromType = (mimeType: string): PortfolioMedia["kind"] => {
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    return "image";
  };

  const formatTitleFromFilename = (filename: string): string => {
    return filename
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]+/g, " ")
      .trim() || "Item sem título";
  };

  // About Me handlers (defined before useEffect)
  const loadAboutContent = async () => {
    try {
      const response = await fetch("/api/about", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setAboutContent(data.content || "");
      }
    } catch (error) {
      console.error("Erro ao carregar About:", error);
    }
  };

  // Load About content when tab changes
  useEffect(() => {
    if (activeTab === "about") {
      loadAboutContent();
    }
  }, [activeTab]);

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

  const handleSaveAbout = async () => {
    if (!aboutContent.trim()) {
      showFeedback("error", "Conteúdo não pode estar vazio");
      return;
    }

    setAboutLoading(true);
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 20000);

      const response = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ content: aboutContent }),
      });

      window.clearTimeout(timeout);

      if (response.ok) {
        showFeedback("success", "About Me atualizado com sucesso!");
      } else {
        const errorData = (await response.json().catch(() => null)) as { error?: string; details?: string } | null;
        showFeedback("error", errorData?.error || "Erro ao atualizar About Me");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        showFeedback("error", "Timeout ao salvar Sobre Mim. Tente novamente.");
      } else {
        showFeedback("error", "Erro ao salvar About Me");
      }
    } finally {
      setAboutLoading(false);
    }
  };

  // Bulk Media handlers
  const handleBulkFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: BulkFileUpload[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      loading: false,
      error: null,
      url: null,
      syncedToPortfolio: false,
    }));
    setBulkFiles((prev) => [...prev, ...newFiles]);
  };

  const removeBulkFile = (id: string) => {
    setBulkFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleBulkUpload = async () => {
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "audio/mpeg",
      "audio/wav",
    ];

    for (const fileState of bulkFiles) {
      if (fileState.url) continue;

      try {
        if (!validTypes.includes(fileState.file.type)) {
          setBulkFiles((prev) =>
            prev.map((f) =>
              f.id === fileState.id
                ? { ...f, error: `Tipo não suportado: ${fileState.file.type}` }
                : f
            )
          );
          continue;
        }

        const MAX_SIZE = 100 * 1024 * 1024;
        if (fileState.file.size > MAX_SIZE) {
          setBulkFiles((prev) =>
            prev.map((f) =>
              f.id === fileState.id
                ? { ...f, error: "Arquivo muito grande (máx. 100MB)" }
                : f
            )
          );
          continue;
        }

        setBulkFiles((prev) =>
          prev.map((f) =>
            f.id === fileState.id ? { ...f, loading: true, progress: 10 } : f
          )
        );

        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onload = async () => {
            try {
              const base64 = reader.result as string;
              const base64Data = base64.split(",")[1];
              const timestamp = Date.now();
              const filename = `${timestamp}-${fileState.file.name}`;

              setBulkFiles((prev) =>
                prev.map((f) =>
                  f.id === fileState.id ? { ...f, progress: 50 } : f
                )
              );

              const uploadResponse = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ file: base64Data, filename }),
              });

              if (!uploadResponse.ok) {
                throw new Error("Upload falhou");
              }

              const result = await uploadResponse.json();

              const mediaKind = inferMediaKindFromType(fileState.file.type);
              const baseTitle = formatTitleFromFilename(fileState.file.name);
              const primaryCreate = await addItem({
                title: baseTitle,
                category: "Upload em lote",
                description: "Item criado automaticamente via upload em lote.",
                media: {
                  kind: mediaKind,
                  source: {
                    type: "url",
                    src: result.url,
                  },
                },
              });

              let createdInPortfolio = primaryCreate.success;
              if (!createdInPortfolio) {
                const fallbackTitle = `${baseTitle} ${Date.now()}`;
                const fallbackCreate = await addItem({
                  title: fallbackTitle,
                  category: "Upload em lote",
                  description: "Item criado automaticamente via upload em lote.",
                  media: {
                    kind: mediaKind,
                    source: {
                      type: "url",
                      src: result.url,
                    },
                  },
                });
                createdInPortfolio = fallbackCreate.success;
              }

              if (!createdInPortfolio) {
                throw new Error("Arquivo enviado, mas falhou ao criar item no portfólio");
              }

              setBulkFiles((prev) =>
                prev.map((f) =>
                  f.id === fileState.id
                    ? {
                        ...f,
                        url: result.url,
                        progress: 100,
                        loading: false,
                        error: null,
                        syncedToPortfolio: true,
                      }
                    : f
                )
              );
            } catch (error) {
              const errorMsg =
                error instanceof Error ? error.message : "Erro no upload";
              setBulkFiles((prev) =>
                prev.map((f) =>
                  f.id === fileState.id
                    ? { ...f, error: errorMsg, loading: false }
                    : f
                )
              );
            }
            resolve();
          };

          reader.onerror = () => {
            setBulkFiles((prev) =>
              prev.map((f) =>
                f.id === fileState.id
                  ? { ...f, error: "Falha ao ler arquivo", loading: false }
                  : f
              )
            );
            resolve();
          };

          reader.readAsDataURL(fileState.file);
        });
      } catch (error) {
        console.error("Erro:", error);
      }
    }
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

        {/* Tabs Navigation */}
        <div className="mb-8 flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === "portfolio"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => {
              setActiveTab("about");
              if (!aboutContent) loadAboutContent();
            }}
            className={`px-4 py-3 font-semibold transition-colors flex items-center gap-2 ${
              activeTab === "about"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText size={18} />
            Sobre Mim
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={`px-4 py-3 font-semibold transition-colors flex items-center gap-2 ${
              activeTab === "bulk"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload size={18} />
            Upload em Lote
          </button>
        </div>

        {/* Botão Adicionar */}
        {activeTab === "portfolio" && (
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
        )}

        {/* Formulário */}
        {showForm && activeTab === "portfolio" && (
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
        {activeTab === "portfolio" && (
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
        )}

        {/* About Me Editor */}
        {activeTab === "about" && (
          <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg">
            <h2 className="text-2xl font-bold text-foreground mb-6">Editar Sobre Mim</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveAbout();
            }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="aboutContent" className="block text-sm font-medium text-foreground mb-2">
                    Texto sobre você
                  </label>
                  <textarea
                    id="aboutContent"
                    value={aboutContent}
                    onChange={(e) => setAboutContent(e.target.value)}
                    rows={10}
                    placeholder="Escreva um texto interessante sobre você, seu background, habilidades e objetivos..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-normal"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {aboutContent.length} caracteres
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={aboutLoading || !aboutContent.trim()}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {aboutLoading ? "Salvando..." : "Salvar"}
                  </button>
                  <button
                    type="button"
                    onClick={loadAboutContent}
                    className="px-6 py-2 bg-gray-100 text-foreground rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Bulk Upload Manager */}
        {activeTab === "bulk" && (
          <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg">
            <h2 className="text-2xl font-bold text-foreground mb-6">Upload em Lote</h2>
            
            <div className="space-y-6">
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Selecione múltiplos arquivos
                </label>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleBulkFilesSelect}
                    className="hidden"
                    id="bulkFileInput"
                  />
                  <label
                    htmlFor="bulkFileInput"
                    className="flex items-center justify-center w-full px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-center">
                      <FileText size={32} className="mx-auto text-muted-foreground mb-2" />
                      <p className="font-medium text-foreground">Arraste arquivos aqui ou clique</p>
                      <p className="text-sm text-muted-foreground mt-1">Imagens e vídeos suportados</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Files List */}
              {bulkFiles.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">
                    {bulkFiles.length} arquivo{bulkFiles.length !== 1 ? 's' : ''} selecionado{bulkFiles.length !== 1 ? 's' : ''}
                  </h3>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {bulkFiles.map((file) => (
                      <div key={file.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-foreground truncate">{file.file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          
                          {/* Status Badge */}
                          {file.syncedToPortfolio && (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                              Publicado
                            </span>
                          )}
                          {!file.syncedToPortfolio && file.url && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                              Só Blob
                            </span>
                          )}
                          {file.error && !file.loading && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                              ✕ Erro
                            </span>
                          )}
                          {file.loading && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                              ⏳ Enviando
                            </span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        {file.loading && (
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        )}

                        {/* Error Message */}
                        {file.error && (
                          <p className="text-xs text-red-600 mb-2">{file.error}</p>
                        )}

                        {/* Remove Button */}
                        <button
                          onClick={() => removeBulkFile(file.id)}
                          disabled={file.loading}
                          className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleBulkUpload}
                      disabled={bulkFiles.length === 0 || bulkFiles.some(f => f.loading)}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      Enviar Tudo
                    </button>
                    <button
                      onClick={() => setBulkFiles([])}
                      className="px-6 py-2 bg-gray-100 text-foreground rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Limpar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
