import axios from "axios";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dp3kcfkrn/image/upload";
const UPLOAD_PRESET = "Agriculture";

export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await axios.post(CLOUDINARY_URL, formData);
    return response.data.secure_url;
  } catch (err) {
    console.error("Cloudinary upload failed", err);
    throw err;
  }
};
