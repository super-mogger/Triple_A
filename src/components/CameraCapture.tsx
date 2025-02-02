import React, { useRef, useCallback, useState } from 'react';
import { Camera, X, RotateCcw, Camera as CameraIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageFile: File) => Promise<void>;
}

export default function CameraCapture({ isOpen, onClose, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  }, []);

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame on the canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally if using front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, 0, 0);

    // Convert canvas to blob
    try {
      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.8)
      );

      // Create a File object
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });

      // Stop camera and close modal
      stopCamera();
      onClose();

      // Pass the captured image to parent
      await onCapture(file);
    } catch (error) {
      console.error('Error capturing image:', error);
      toast.error('Failed to capture image. Please try again.');
    }
  }, [facingMode, onCapture, onClose, stopCamera]);

  const toggleCamera = useCallback(() => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, [stopCamera]);

  // Start camera when modal opens
  React.useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen, startCamera, stopCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="relative bg-white dark:bg-[#1E1E1E] rounded-2xl overflow-hidden max-w-lg w-full mx-4">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Take Profile Picture</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera View */}
        <div className="relative aspect-[3/4] bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Camera Controls */}
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
            <button
              onClick={toggleCamera}
              className="p-3 rounded-full bg-gray-800/80 text-white hover:bg-gray-700/80 transition-colors"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            <button
              onClick={handleCapture}
              className="p-4 rounded-full bg-white text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <CameraIcon className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Position your face in the center and ensure good lighting
          </p>
        </div>
      </div>
    </div>
  );
} 