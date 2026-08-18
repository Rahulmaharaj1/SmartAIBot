import express from "express";
import cors from "cors";

const app = express();

// ========================================
// CORS
// ========================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://rahulmaharaj1.github.io",
    ],
  })
);

// ========================================
// JSON LIMIT
// Base64 image ke liye
// ========================================

app.use(
  express.json({
    limit: "10mb",
  })
);

// ========================================
// HOME
// ========================================

app.get("/", (req, res) => {
  res.json({
    message: "SmartAIBot Backend is running 🚀",
  });
});

// ========================================
// CHAT + IMAGE ANALYSIS
// ========================================

app.post("/api/chat", async (req, res) => {
  try {
    const {
      prompt,
      image,
      mimeType,
    } = req.body;

    console.log("\n================================");
    console.log("📩 CHAT REQUEST");
    console.log("Prompt:", prompt);
    console.log("Image:", image ? "YES" : "NO");
    console.log("MimeType:", mimeType);
    console.log("================================\n");

    // ========================================
    // VALIDATE PROMPT
    // ========================================

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Prompt is required",
      });
    }

    // ========================================
    // CHECK API KEY
    // ========================================

    if (!process.env.OPENROUTER_API_KEY) {
      console.error(
        "❌ OPENROUTER_API_KEY missing"
      );

      return res.status(500).json({
        error: "OPENROUTER_API_KEY is missing",
      });
    }

    // ========================================
    // CREATE MESSAGE CONTENT
    // ========================================

    let content;

    // ========================================
    // IMAGE + TEXT
    // ========================================

    if (image && mimeType) {
      console.log(
        "🖼️ Image + Prompt request"
      );

      content = [
        {
          type: "text",
          text: prompt.trim(),
        },
        {
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${image}`,
          },
        },
      ];
    }

    // ========================================
    // TEXT ONLY
    // ========================================

    else {
      console.log(
        "💬 Text only request"
      );

      content = prompt.trim();
    }

    // ========================================
    // OPENROUTER
    // ========================================

    console.log(
      "🤖 Sending request to OpenRouter..."
    );

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${process.env.OPENROUTER_API_KEY}`,

          "Content-Type":
            "application/json",

          "HTTP-Referer":
            "https://rahulmaharaj1.github.io/SmartAIBot/",

          "X-Title":
            "SmartAIBot",
        },

        body: JSON.stringify({
          // Gemini Vision
          model: "google/gemini-2.5-flash",

          max_tokens: 2048,

          messages: [
            {
              role: "user",
              content: content,
            },
          ],
        }),
      }
    );

    // ========================================
    // READ RESPONSE
    // ========================================

    const data = await response.json();

    console.log(
      "OpenRouter Status:",
      response.status
    );

    // ========================================
    // OPENROUTER ERROR
    // ========================================

    if (!response.ok) {
      console.error(
        "❌ OpenRouter Error:",
        data
      );

      return res.status(
        response.status
      ).json({
        error:
          data?.error?.message ||
          "OpenRouter request failed",
      });
    }

    // ========================================
    // GET AI RESPONSE
    // ========================================

    const reply =
      data?.choices?.[0]?.message?.content;

    if (!reply) {
      console.error(
        "❌ No AI response:",
        data
      );

      return res.status(500).json({
        error:
          "No AI response received",
      });
    }

    console.log(
      "✅ AI Response received"
    );

    return res.json({
      reply: reply,
    });

  } catch (error) {
    console.error(
      "❌ Chat Backend Error:",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "Internal server error",
    });
  }
});

// ========================================
// IMAGE GENERATION - HUGGING FACE
// ========================================

app.post("/api/image", async (req, res) => {
  try {
    const {
      prompt,
    } = req.body;

    console.log(
      "\n================================"
    );

    console.log(
      "🎨 IMAGE GENERATION REQUEST"
    );

    console.log(
      "Prompt:",
      prompt
    );

    console.log(
      "================================\n"
    );

    // ========================================
    // VALIDATE PROMPT
    // ========================================

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error:
          "Image prompt is required",
      });
    }

    // ========================================
    // CHECK HF TOKEN
    // ========================================

    if (!process.env.HF_TOKEN) {
      console.error(
        "❌ HF_TOKEN missing"
      );

      return res.status(500).json({
        error:
          "HF_TOKEN is missing",
      });
    }

    // ========================================
    // HUGGING FACE REQUEST
    // ========================================

    const response = await fetch(
      "https://router.huggingface.co/fal-ai/fal-ai/flux/schnell",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${process.env.HF_TOKEN}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          prompt:
            prompt.trim(),

          image_size:
            "landscape_4_3",

          num_inference_steps: 4,
        }),
      }
    );

    console.log(
      "Hugging Face Status:",
      response.status
    );

    // ========================================
    // HUGGING FACE ERROR
    // ========================================

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "❌ Hugging Face Error:",
        errorText
      );

      return res.status(
        response.status
      ).json({
        error:
          errorText ||
          "Image generation failed",
      });
    }

    // ========================================
    // RESPONSE TYPE
    // ========================================

    const contentType =
      response.headers.get(
        "content-type"
      );

    console.log(
      "Content-Type:",
      contentType
    );

    // ========================================
    // DIRECT IMAGE
    // ========================================

    if (
      contentType &&
      contentType.startsWith(
        "image/"
      )
    ) {
      console.log(
        "🖼️ Direct image received"
      );

      const imageBuffer =
        Buffer.from(
          await response.arrayBuffer()
        );

      res.setHeader(
        "Content-Type",
        contentType
      );

      res.setHeader(
        "Content-Length",
        imageBuffer.length
      );

      return res.send(
        imageBuffer
      );
    }

    // ========================================
    // JSON RESPONSE
    // ========================================

    const data =
      await response.json();

    console.log(
      "HF JSON:",
      data
    );

    // ========================================
    // FIND IMAGE URL
    // ========================================

    const imageUrl =
      data?.images?.[0]?.url ||
      data?.image?.url ||
      data?.url;

    if (!imageUrl) {
      console.error(
        "❌ Image URL not found"
      );

      return res.status(500).json({
        error:
          "Generated image URL not found",
      });
    }

    console.log(
      "Generated Image URL:",
      imageUrl
    );

    // ========================================
    // DOWNLOAD IMAGE
    // ========================================

    const imageResponse =
      await fetch(
        imageUrl
      );

    if (!imageResponse.ok) {
      throw new Error(
        "Unable to download generated image"
      );
    }

    const imageType =
      imageResponse.headers.get(
        "content-type"
      ) ||
      "image/jpeg";

    const imageBuffer =
      Buffer.from(
        await imageResponse.arrayBuffer()
      );

    // ========================================
    // SEND IMAGE
    // ========================================

    res.setHeader(
      "Content-Type",
      imageType
    );

    res.setHeader(
      "Content-Length",
      imageBuffer.length
    );

    return res.send(
      imageBuffer
    );

  } catch (error) {
    console.error(
      "❌ Image Generation Error:",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "Image generation failed",
    });
  }
});

// ========================================
// VERCEL EXPORT
// ========================================

export default app;