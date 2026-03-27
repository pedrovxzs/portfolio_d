import { put } from "@vercel/blob";
import { Buffer } from "node:buffer";

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { file, filename, contentType } = req.body;

    if (!file || !filename) {
      return res
        .status(400)
        .json({ error: "Missing file or filename" });
    }

    const normalizedFilename = String(filename).toLowerCase();
    const inferredContentType =
      typeof contentType === "string" && contentType.length > 0
        ? contentType
        : normalizedFilename.endsWith(".mov")
          ? "video/quicktime"
          : undefined;

    // Converte base64 para buffer
    const buffer = Buffer.from(file, "base64");

    // Faz upload para Vercel Blob
    const blob = await put(filename, buffer, {
      access: "public",
      contentType: inferredContentType,
    });

    return res.status(200).json({
      success: true,
      url: blob.url,
      filename: blob.pathname,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      error: "Upload failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
