import { toast } from 'react-hot-toast';

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

if (!IMGBB_API_KEY) {
  console.error('ImgBB API key is not configured. Please check your .env file.');
}

export const validateImage = (file: File): boolean => {
  // Image uploads are disabled for users in the main app
  toast.error('Image uploads are disabled. Please contact an administrator.');
  return false;
};

export const uploadImageToImgBB = async (file: File): Promise<string | null> => {
  // Disabled for the main app
  toast.error('Image uploads are disabled. Please contact an administrator for profile picture updates.');
  return null;
};

// Keep the base64 upload function for admin app usage
export const uploadBase64ImageToImgBB = async (base64Image: string): Promise<string | null> => {
  if (!IMGBB_API_KEY) {
    console.error('ImgBB API key is not configured. Please check your .env file.');
    toast.error('Image upload service is not configured properly. Please contact support.');
    return null;
  }

  try {
    // Extract the base64 data without the data URL prefix
    const base64Data = base64Image.indexOf('base64,') >= 0 
      ? base64Image.split('base64,')[1]
      : base64Image;

    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', base64Data);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data.url;
    } else {
      console.error('ImgBB upload failed:', data);
      throw new Error(data.error?.message || 'Failed to upload image');
    }
  } catch (error) {
    console.error('Error uploading base64 image:', error);
    toast.error('Failed to upload image. Please try again.');
    return null;
  }
}; 