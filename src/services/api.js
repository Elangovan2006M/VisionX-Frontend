// src/services/api.js
import axios from "axios";

const API_BASE_URL = "https://visionx-backend-2k2n.onrender.com";

export const askLLM = async ({ userId, query, imageFile = null }) => {
  try {
    const formData = new FormData();
    formData.append("query", query);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const response = await axios.post(`${API_BASE_URL}/llm/ask`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: {
        userId, // optional query param if backend uses it for history
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error while calling LLM API:", error);
    throw error.response?.data || { message: "Something went wrong" };
  }
};
