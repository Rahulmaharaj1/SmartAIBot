



import { prevUser } from "./context/UserContext";

const API_KEY = "";

const API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function generateResponse() {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324",
        messages: [
          {
            role: "user",
            content: prevUser.prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    console.log(data);

    if (!response.ok) {
      throw new Error(data.error?.message || "Something went wrong");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.log(error);
    return error.message;
  }
}

