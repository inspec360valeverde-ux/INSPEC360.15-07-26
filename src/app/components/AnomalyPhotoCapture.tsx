import { useState, useRef } from 'react';
import { Camera, Upload, X, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';

interface AnomalyPhotoCaptureProps {
  anomalyName: string;
  onPhotoCapture: (base64: string) => void;
  onCancel: () => void;
  existingPhoto?: string;
  isOpen?: boolean;
}

export function AnomalyPhotoCapture({
  anomalyName,
  onPhotoCapture,
  onCancel,
  existingPhoto,
  isOpen = true,
}: AnomalyPhotoCaptureProps) {
  if (!isOpen) return null;
  const [mode, setMode] = useState<'choose' | 'camera' | 'gallery' | 'preview'>('choose');
  const [photoPreview, setPhotoPreview] = useState<string | null>(existingPhoto || null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setMode('camera');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setCameraError(`Não foi possível acessar a câmera: ${errorMsg}`);
      setMode('choose');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    ctx.drawImage(videoRef.current, 0, 0);
    const base64 = canvasRef.current.toDataURL('image/jpeg', 0.9);

    setPhotoPreview(base64);
    stopCamera();
    setMode('preview');
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setPhotoPreview(base64);
      setMode('preview');
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (photoPreview) {
      onPhotoCapture(photoPreview);
    }
  };

  const handleRetake = () => {
    setPhotoPreview(null);
    setMode('choose');
  };

  // ── Screen: Choose capture method ──
  if (mode === 'choose') {
    return (
      <div className="fixed inset-0 z-50 flex items-end bg-black/50">
        <div className="w-full bg-white rounded-t-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: '#193A2A' }}>
              Capturar Foto
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <p className="text-sm text-gray-600">
            📍 Anomalia: <span className="font-medium">{anomalyName}</span>
          </p>

          {cameraError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100">
              <p className="text-sm text-red-700">{cameraError}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={startCamera}
              disabled={!!cameraError}
              className="w-full py-6 text-white flex items-center justify-center gap-3 font-medium"
              style={{ backgroundColor: '#193A2A' }}
            >
              <Camera className="w-5 h-5" />
              Usar Câmera
            </Button>

            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full py-6 flex items-center justify-center gap-3 font-medium"
            >
              <Upload className="w-5 h-5" />
              Selecionar da Galeria
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          <Button
            onClick={onCancel}
            variant="outline"
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  // ── Screen: Camera ──
  if (mode === 'camera') {
    return (
      <div className="fixed inset-0 z-50 flex items-end bg-black/50">
        <div className="w-full bg-white rounded-t-2xl p-6 space-y-4 max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: '#193A2A' }}>
              Câmera Ativa
            </h2>
            <button
              onClick={() => {
                stopCamera();
                onCancel();
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="flex-1 bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                stopCamera();
                handleRetake();
              }}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={capturePhoto}
              className="flex-1 text-white"
              style={{ backgroundColor: '#AA8933' }}
            >
              <Camera className="w-4 h-4 mr-2" />
              Capturar Foto
            </Button>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    );
  }

  // ── Screen: Preview ──
  if (mode === 'preview' && photoPreview) {
    return (
      <div className="fixed inset-0 z-50 flex items-end bg-black/50">
        <div className="w-full bg-white rounded-t-2xl p-6 space-y-4 max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: '#193A2A' }}>
              Revisar Foto
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <p className="text-sm text-gray-600">
            📍 Anomalia: <span className="font-medium">{anomalyName}</span>
          </p>

          <div className="flex-1 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={photoPreview}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleRetake}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Nova Foto
            </Button>
            <Button
              onClick={handleConfirm}
              className="text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: '#193A2A' }}
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
