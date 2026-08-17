const API_URL = "http://localhost:5000/api/image";

export async function query(prompt) {
  if (!prompt || !prompt.trim()) {
    throw new Error("Please enter an image prompt");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: prompt.trim(),
    }),
  });

  if (!response.ok) {
    let errorMessage = "Image generation failed";

    try {
      const data = await response.json();
      errorMessage = data?.error || errorMessage;
    } catch {
      // Ignore JSON parsing error
    }

    throw new Error(errorMessage);
  }

  const blob = await response.blob();

  if (!blob.type.startsWith("image/")) {
    throw new Error(
      `Unexpected response type: ${blob.type}`
    );
  }

  return blob;
}