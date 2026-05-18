import { useState, useRef, useEffect } from 'react';
import { Camera, X, CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { addWatermarkToCanvas } from '@/utils/watermarkImage';

interface CameraWithWatermarkProps {
  componentName?: string;
  anomalyName?: string;
  onPhotoCapture: (base64: string) => void;
  onClose: () => void;
}

export function CameraWithWatermark({
  componentName,
  anomalyName,
  onPhotoCapture,
  onClose
}: CameraWithWatermarkProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { location } = useGeolocation();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      setError('Erro ao acessar câmera. Verifique as permissões.');
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    // Desenhar frame atual
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

    // Adicionar watermark
    setIsProcessing(true);
    try {
      const blobWithWatermark = await addWatermarkToCanvas(canvasRef.current, {
        latitude: location?.latitude,
        longitude: location?.longitude,
        accuracy: location?.accuracy,
        componentName,
        anomalyName
      });

      // Converter para base64 para preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setPreviewImage(base64);
      };
      reader.readAsDataURL(blobWithWatermark);
      stopCamera();
      setIsCapturing(false);
    } catch (err) {
      setError('Erro ao processar imagem com watermark');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmPhoto = () => {
    if (previewImage) {
      onPhotoCapture(previewImage);
    }
  };

  const retakePhoto = () => {
    setPreviewImage(null);
    startCamera();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium" style={{ color: '#193A2A' }}>
            Capturar Foto com Marca d'água
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Câmera ou Preview */}
          {!previewImage && isCapturing ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-80 object-cover rounded-lg bg-black"
              />
              <canvas
                ref={canvasRef}
                width={1280}
                height={960}
                className="hidden"
              />

              {/* Info sobre watermark */}
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-700">
                    <p className="font-medium mb-1">Marca d'água será adicionada:</p>
                    <ul className="space-y-0.5">
                      <li>✓ {componentName || 'Componente'}</li>
                      {anomalyName && <li>✓ {anomalyName}</li>}
                      <li>✓ Data e Hora</li>
                      {location && <li>✓ GPS: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</li>}
                      {!location && <li>⚠ Sem GPS capturado</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          ) : previewImage ? (
            <>
              <img
                src={previewImage}
                alt="Preview com watermark"
                className="w-full h-80 object-cover rounded-lg"
              />
              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-700">Marca d'água adicionada com sucesso!</p>
              </div>
            </>
          ) : (
            <div className="w-full h-80 bg-gray-100 rounded-lg flex items-center justify-center">
              <Loader className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer - Actions */}
        <div className="flex gap-2 p-4 border-t border-gray-200 bg-gray-50">
          {!previewImage ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={capturePhoto}
                disabled={isProcessing || !isCapturing}
                className="flex-1 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Capturar
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={retakePhoto}
                className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Recapturar
              </button>
              <button
                onClick={confirmPhoto}
                className="flex-1 px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirmar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
