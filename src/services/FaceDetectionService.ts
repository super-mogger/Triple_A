import * as faceapi from '@vladmandic/face-api';
import { toast } from 'react-hot-toast';

let modelsLoaded = false;

export const loadFaceDetectionModels = async () => {
  if (modelsLoaded) return;

  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    modelsLoaded = true;
    console.log('Face detection models loaded successfully');
  } catch (error) {
    console.error('Error loading face detection models:', error);
    toast.error('Failed to initialize face detection. Please try again later.');
    throw new Error('Failed to load face detection models');
  }
};

export const detectFace = async (imageFile: File): Promise<boolean> => {
  let img: HTMLImageElement | null = null;
  
  try {
    // Ensure models are loaded
    if (!modelsLoaded) {
      await loadFaceDetectionModels();
    }

    // Create an image element
    img = await createImageFromFile(imageFile);

    // Configure face detection options
    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 320,
      scoreThreshold: 0.3
    });

    // Detect faces in the image
    const detections = await faceapi.detectAllFaces(img, options);

    // Check if exactly one face is detected
    if (!detections || detections.length === 0) {
      toast.error('No face detected in the image. Please upload a clear photo of your face.');
      return false;
    }

    if (detections.length > 1) {
      toast.error('Multiple faces detected. Please upload a photo with only your face.');
      return false;
    }

    // Get the detection with highest confidence
    const detection = detections[0];

    // Check confidence score (0 to 1)
    if (detection.score < 0.5) {
      toast.error('Face detection confidence is too low. Please upload a clearer photo.');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error detecting face:', error);
    toast.error('Failed to process image. Please try again.');
    return false;
  } finally {
    // Clean up any object URLs
    if (img) {
      URL.revokeObjectURL(img.src);
    }
  }
};

const createImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (error) => {
      URL.revokeObjectURL(img.src);
      reject(error);
    };
    img.src = URL.createObjectURL(file);
  });
}; 