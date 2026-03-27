import { useState } from "react";

interface UploadProgress {
  loading: boolean;
  error: string | null;
  progress: number;
}

export function useMediaUpload() {
  const [state, setState] = useState<UploadProgress>({
    loading: false,
    error: null,
    progress: 0,
  });

  const uploadFile = async (file: File): Promise<string> => {
    setState({ loading: true, error: null, progress: 0 });

    try {
      // Valida tipo de arquivo
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "audio/mpeg",
        "audio/wav",
      ];

      if (!validTypes.includes(file.type)) {
        throw new Error(
          `Tipo de arquivo não suportado: ${file.type}. Use imagens (JPG, PNG, WebP) ou vídeos (MP4, WebM, MOV).`
        );
      }

      // Valida tamanho (máximo 100MB)
      const MAX_SIZE = 100 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        throw new Error("Arquivo é muito grande (máximo 100MB)");
      }

      // Lê arquivo como base64
      const reader = new FileReader();

      return await new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64 = reader.result as string;
            const base64Data = base64.split(",")[1];

            // Gera nome único com timestamp
            const timestamp = Date.now();
            const filename = `${timestamp}-${file.name}`;

            setState({ loading: true, error: null, progress: 50 });

            // Faz upload para Vercel Blob
            const uploadResponse = await fetch("/api/upload", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                file: base64Data,
                filename,
                contentType: file.type,
              }),
            });

            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json();
              throw new Error(
                errorData.message || "Failed to upload file"
              );
            }

            const result = await uploadResponse.json();

            setState({ loading: false, error: null, progress: 100 });
            resolve(result.url as string);
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Upload failed";
            setState({ loading: false, error: errorMessage, progress: 0 });
            reject(error);
          }
        };

        reader.onerror = () => {
          const errorMessage = "Failed to read file";
          setState({ loading: false, error: errorMessage, progress: 0 });
          reject(new Error(errorMessage));
        };

        reader.readAsDataURL(file);
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      setState({ loading: false, error: errorMessage, progress: 0 });
      throw error;
    }
  };

  return {
    uploadFile,
    ...state,
  };
}
