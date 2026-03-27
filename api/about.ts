import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing POSTGRES_URL or DATABASE_URL environment variable");
}

const sql = neon(databaseUrl);

function setCors(res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST,PUT,DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
}

async function ensureAboutTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS about_content (
      id INTEGER PRIMARY KEY,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    INSERT INTO about_content (id, content)
    VALUES (1, '')
    ON CONFLICT (id) DO NOTHING
  `;
}

export default async function handler(req: any, res: any) {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    await ensureAboutTable();

    if (req.method === "GET") {
      const rows = await sql`
        SELECT content, updated_at
        FROM about_content
        WHERE id = 1
        LIMIT 1
      `;

      if (rows.length === 0) {
        return res.status(200).json({ content: "", updated_at: null });
      }

      return res.status(200).json(rows[0]);
    }

    if (req.method === "PUT") {
      const content = req.body?.content;

      if (!content || typeof content !== "string") {
        return res.status(400).json({ error: "Content is required" });
      }

      const updatedRows = await sql`
        UPDATE about_content
        SET content = ${content.trim()}, updated_at = NOW()
        WHERE id = 1
        RETURNING id, content, updated_at
      `;

      return res.status(200).json({
        message: "Content updated successfully",
        data: updatedRows[0],
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("About API error:", error);
    return res.status(500).json({
      error: "Failed to process about content",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
