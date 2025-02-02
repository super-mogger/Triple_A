import { toast } from 'react-hot-toast';

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

if (!IMGBB_API_KEY) {
  console.error('ImgBB API key is not configured. Please check your .env file.');
}

export const validateImage = (file: File): boolean => {
  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    toast.error('Please upload an image file');
    return false;
  }

  // Check file size (max 2MB)
  const maxSize = 2 * 1024 * 1024; // 2MB in bytes
  if (file.size > maxSize) {
    toast.error('Image size should be less than 2MB');
    return false;
  }

  return true;
};

export const uploadImageToImgBB = async (file: File): Promise<string | null> => {
  if (!IMGBB_API_KEY) {
    console.error('ImgBB API key is not configured. Please check your .env file.');
    toast.error('Image upload service is not configured properly. Please contact support.');
    return null;
  }

  try {
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', file);

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
    console.error('Error uploading image:', error);
    toast.error('Failed to upload image. Please try again.');
    return null;
  }
}; 