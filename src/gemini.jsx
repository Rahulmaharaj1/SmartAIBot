// ========================================
// SMART AI BOT - GEMINI / OPENROUTER
// ========================================

export const generateResponse = async (
  prompt,
  image = null,
  mimeType = null
) => {
  try {
    console.log("================================");
    console.log("📤 Sending request to backend...");
    console.log("Prompt:", prompt);
    console.log("Image:", image ? "YES ✅" : "NO");
    console.log("MimeType:", mimeType);
    console.log("================================");

    const response = await fetch(
      "http://localhost:5000/api/chat",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          prompt: prompt.trim(),
          image: image || null,
          mimeType: mimeType || null,
        }),
      }
    );

    const data = await response.json();

    console.log("📥 Backend Response:", data);

    if (!response.ok) {
      throw new Error(
        data?.error || "Backend request failed"
      );
    }

    if (!data.reply) {
      throw new Error(
        "AI response was empty"
      );
    }

    return data.reply;

  } catch (error) {
    console.error(
      "❌ generateResponse Error:",
      error
    );

    throw error;
  }
};