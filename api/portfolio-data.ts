import { neon } from "@neondatabase/serverless";
import { portfolioItems as defaultItems } from "../src/app/data/portfolioItems.js";

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
}

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS portfolio_items (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      media JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export default async function handler(req: any, res: any) {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    await ensureTable();

    if (req.method === "GET") {
      res.setHeader("Cache-Control", "no-store");

      let rows = await sql`
        SELECT id, title, category, description, media
        FROM portfolio_items
        ORDER BY id ASC
      `;

      if (rows.length === 0) {
        for (const item of defaultItems) {
          await sql`
            INSERT INTO portfolio_items (id, title, category, description, media)
            VALUES (
              ${item.id},
              ${item.title},
              ${item.category},
              ${item.description ?? ""},
              ${JSON.stringify(item.media)}::jsonb
            )
          `;
        }

        const seeded = await sql`
          SELECT id, title, category, description, media
          FROM portfolio_items
          ORDER BY id ASC
        `;
        rows = seeded;
      }

      const normalizedRows = rows.map((row) => ({
        ...row,
        media: typeof row.media === "string" ? JSON.parse(row.media) : row.media,
      }));

      return res.status(200).json(normalizedRows);
    }

    if (req.method === "POST") {
      const item = req.body;

      if (!item?.title || !item?.category || !item?.media?.source?.src) {
        return res.status(400).json({ error: "Invalid portfolio item payload" });
      }

      const insertedRows = await sql`
        INSERT INTO portfolio_items (title, category, description, media)
        VALUES (
          ${item.title},
          ${item.category},
          ${item.description ?? ""},
          ${JSON.stringify(item.media)}::jsonb
        )
        RETURNING id
      `;

      return res.status(201).json({ success: true, id: insertedRows[0].id });
    }

    if (req.method === "PUT") {
      const { id, updates } = req.body ?? {};

      if (!id || !updates) {
        return res.status(400).json({ error: "Missing id or updates" });
      }

      const current = await sql`
        SELECT id, title, category, description, media
        FROM portfolio_items
        WHERE id = ${id}
      `;

      if (current.length === 0) {
        return res.status(404).json({ error: "Item not found" });
      }

      const currentItem = current[0];
      const mergedMedia = updates.media ?? currentItem.media;

      await sql`
        UPDATE portfolio_items
        SET
          title = ${updates.title ?? currentItem.title},
          category = ${updates.category ?? currentItem.category},
          description = ${updates.description ?? currentItem.description},
          media = ${JSON.stringify(mergedMedia)}::jsonb
        WHERE id = ${id}
      `;

      return res.status(200).json({ success: true });
    }

    if (req.method === "DELETE") {
      const id = Number(req.query?.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid id" });
      }

      const deletedRows = await sql`
        DELETE FROM portfolio_items
        WHERE id = ${id}
        RETURNING id
      `;

      if (deletedRows.length === 0) {
        return res.status(404).json({ error: "Item not found" });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Portfolio data error:", error);
    return res.status(500).json({
      error: "Failed to process portfolio data",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
