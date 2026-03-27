import { neon } from "@neondatabase/serverless";

const allowCors = (fn: (req: Request) => Promise<Response>) => {
  return async (req: Request) => {
    const corsHeaders = {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
      "Access-Control-Allow-Headers":
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const response = await fn(req);

    // Add CORS headers to response
    const newResponse = new Response(response.body, response);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value);
    });

    return newResponse;
  };
};

const handler = async (req: Request): Promise<Response> => {
  const { POSTGRES_URL } = process.env;

  if (!POSTGRES_URL) {
    return new Response(JSON.stringify({ error: "Database connection failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const sql = neon(POSTGRES_URL);

    await sql`CREATE TABLE IF NOT EXISTS about_content (
      id INTEGER PRIMARY KEY,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;

    // Garante um único registro para leitura/gravação rápida e previsível.
    await sql`INSERT INTO about_content (id, content)
      VALUES (1, '')
      ON CONFLICT (id) DO NOTHING`;

    if (req.method === "GET") {
      const result = await sql`SELECT content, updated_at FROM about_content WHERE id = 1 LIMIT 1`;

      if (result && result.length > 0) {
        return new Response(JSON.stringify(result[0]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Return empty content if not found
      return new Response(JSON.stringify({ content: "", updated_at: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "PUT") {
      const body = await req.json() as { content?: string };
      const { content } = body;

      if (!content || typeof content !== "string") {
        return new Response(JSON.stringify({ error: "Content is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const updateResult = await sql`
        UPDATE about_content
        SET content = ${content.trim()}, updated_at = NOW()
        WHERE id = 1
        RETURNING id, content, updated_at
      `;

      return new Response(
        JSON.stringify({
          message: "Content updated successfully",
          data: updateResult[0],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("API Error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to process request",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export default allowCors(handler);
