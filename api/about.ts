import { neon } from "@neondatabase/serverless";

const allowCors = (fn: (req: Request) => Promise<Response>) => {
  return async (req: Request) => {
    const response = await fn(req);
    
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

    if (req.method === "GET") {
      // Fetch about content
      const result = await sql`SELECT content, updated_at FROM about_content LIMIT 1`;

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

      // Check if table exists and has data
      const checkResult = await sql`SELECT id FROM about_content LIMIT 1`;

      if (checkResult && checkResult.length > 0) {
        // Update existing record
        const updateResult = await sql`UPDATE about_content SET content = ${content}, updated_at = NOW() RETURNING id, content, updated_at`;

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
      } else {
        // Insert new record if none exists
        const insertResult = await sql`INSERT INTO about_content (content, updated_at) VALUES (${content}, NOW()) RETURNING id, content, updated_at`;

        return new Response(
          JSON.stringify({
            message: "Content created successfully",
            data: insertResult[0],
          }),
          {
            status: 201,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("API Error:", error);

    // Handle table not exists error
    if (error.message && error.message.includes("does not exist")) {
      // Try to create the table
      try {
        const sql = neon(POSTGRES_URL);
        await sql`CREATE TABLE IF NOT EXISTS about_content (
          id SERIAL PRIMARY KEY,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )`;

        // If this is a PUT request, insert the content
        if (req.method === "PUT") {
          const body = await req.json() as { content?: string };
          const { content } = body;
          const insertResult = await sql`INSERT INTO about_content (content, updated_at) VALUES (${content}, NOW()) RETURNING id, content, updated_at`;

          return new Response(
            JSON.stringify({
              message: "Table created and content inserted successfully",
              data: insertResult[0],
            }),
            {
              status: 201,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        // If GET, return empty
        return new Response(JSON.stringify({ content: "", updated_at: null }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (createError) {
        console.error("Table creation error:", createError);
        return new Response(JSON.stringify({ error: "Failed to create table" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

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
