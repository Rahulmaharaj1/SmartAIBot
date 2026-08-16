


import { InferenceClient } from "@huggingface/inference";



const HF_TOKEN = "";

const client = new InferenceClient(HF_TOKEN);

export async function query(prompt) {
  if (!prompt || !prompt.trim()) {
    throw new Error("Please enter an image prompt");
  }

  console.log("Generating image:", prompt);

  try {
    const result = await client.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: prompt,
      provider: "fal-ai",
    });

    console.log("Hugging Face Response:", result);
    console.log("Response Type:", result?.type);
    console.log("Response Size:", result?.size);

    // --------------------------------
    // Check whether response is JSON
    // --------------------------------

    if (result.type === "application/json") {
      const text = await result.text();

      console.error("Hugging Face JSON Error:", text);

      let errorMessage = text;

      try {
        const json = JSON.parse(text);

        errorMessage =
          json.error ||
          json.message ||
          JSON.stringify(json);

      } catch {
        // Response was not valid JSON
      }

      throw new Error(errorMessage);
    }

    // --------------------------------
    // Check whether actual image
    // --------------------------------

    if (!result.type.startsWith("image/")) {
      throw new Error(
        `Unexpected response type: ${result.type}`
      );
    }

    console.log("✅ Actual image received!");

    return result;

  } catch (error) {

    console.error(
      "❌ Hugging Face Error:",
      error
    );

    throw error;
  }
}
