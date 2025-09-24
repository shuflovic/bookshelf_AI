import React, { useState, useRef, useEffect, useCallback } from 'react';
import ActionButton from './ActionButton';
import Spinner from './Spinner';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    // Ensure any existing stream is stopped before starting a new one.
    stopCamera();
    setIsLoading(true);
    setError(null);
    try {
      // Prefer the rear camera on mobile devices with higher resolution
      const constraints: MediaStreamConstraints = {
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
            setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error accessing camera with environment facingMode:", err);
      // Try again with any camera if environment fails, also with higher resolution
      try {
        const fallbackConstraints: MediaStreamConstraints = {
            video: {
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        };
        const stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        streamRef.current = stream;
         if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
      } catch (finalErr) {
        console.error("Final error accessing camera:", finalErr);
        setError("Could not access the camera. Please ensure you have granted permission and that your camera is not in use by another application.");
        setIsLoading(false);
      }
    }
  }, [stopCamera]);


  useEffect(() => {
    if (!capturedImage) {
      startCamera();
    }
    // Cleanup function to stop camera when component unmounts or when an image is captured.
    return () => {
      stopCamera();
    };
  }, [capturedImage, startCamera, stopCamera]);

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error('Could not parse mime type from data URL');
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && !isLoading) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };
  
  const handleUsePicture = () => {
    if (capturedImage) {
      const file = dataURLtoFile(capturedImage, `capture-${Date.now()}.jpg`);
      onCapture(file);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6 w-full max-w-lg" role="alert">
          <strong className="font-bold">Camera Error</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
        <ActionButton onClick={onCancel} text="Go Back" primary={true} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full animate-fade-in">
      <div className="relative w-full max-w-2xl aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-700 flex items-center justify-center">
        {isLoading && !capturedImage && <Spinner message="Starting camera..." />}
        {capturedImage ? (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-contain ${isLoading ? 'hidden' : 'block'}`}></video>
        )}
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        {capturedImage ? (
          <>
            <ActionButton onClick={handleRetake} text="Retake" primary={false} />
            <ActionButton onClick={handleUsePicture} text="Use This Picture" primary={true} />
          </>
        ) : (
          <>
            <ActionButton onClick={onCancel} text="Cancel" primary={false} />
            <ActionButton onClick={handleCapture} text="Take Picture" primary={true} disabled={isLoading} />
          </>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;