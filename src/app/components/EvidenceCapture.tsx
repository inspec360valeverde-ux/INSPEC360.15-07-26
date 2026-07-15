import { useState, useRef } from 'react';
import { Camera, X, Check } from 'lucide-react';
import { Button } from './ui/button';
import { addWatermarkToImage } from '@/utils/watermarkImage';
import { useGeolocation } from '@/hooks/useGeolocation';

interface EvidenceCaptureProps {
  isOpen: boolean;
  technicianName: string;
  componentName?: string;
  anomalyName?: string;
  orderId: string;
  onCaptureComplete: (photoData: {
    file: Blob;
    filename: string;
    metadata: {
      componentName?: string;
      anomalyName?: string;
      latitude?: number;
      longitude?: number;
      accuracy?: number;
      timestamp: string;
      technician: string;
    };
  }) => void;
  onClose: () => void;
}

export function EvidenceCapture({
  isOpen,
  technicianName,
  componentName,
  anomalyName,
  orderId,
  onCaptureComplete,
  onClose
}: EvidenceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'menu' | 'camera' | 'preview'>('menu');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { coordinates: geoLocation } = useGeolocation();

  // ─────────────────────────────────────────────────────────────────────────────
  // INICIAR CÂMERA
  // ─────────────────────────────────────────────────────────────────────────────
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setMode('camera');
      }
    } catch (error) {
      console.error('❌ Erro ao acessar câmera:', error);
      alert('Não foi possível acessar a câmera');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // CAPTURAR FOTO DA CÂMERA
  // ─────────────────────────────────────────────────────────────────────────────
  const captureFromCamera = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    setIsProcessing(true);

    try {
      // Desenhar vídeo no canvas
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);

      // Adicionar marca d'água
      const watermarkedCanvas = await addWatermarkToCanvas(canvasRef.current, {
        technicianName,
        componentName,
        anomalyName,
        latitude: geoLocation?.latitude,
        longitude: geoLocation?.longitude,
        accuracy: geoLocation?.accuracy
      });

      setCapturedImage(watermarkedCanvas.toDataURL('image/jpeg', 0.9));
      setMode('preview');
    } catch (error) {
      console.error('❌ Erro ao capturar:', error);
      alert('Erro ao capturar foto');
    } finally {
      setIsProcessing(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // GALERIA/UPLOAD
  // ─────────────────────────────────────────────────────────────────────────────
  const handleGallerySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      const img = new Image();
      img.onload = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);

        // Adicionar marca d'água
        const watermarkedCanvas = await addWatermarkToCanvas(canvas, {
          technicianName,
          componentName,
          anomalyName,
          latitude: geoLocation?.latitude,
          longitude: geoLocation?.longitude,
          accuracy: geoLocation?.accuracy
        });

        setCapturedImage(watermarkedCanvas.toDataURL('image/jpeg', 0.9));
        setMode('preview');
        setIsProcessing(false);
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('❌ Erro ao processar imagem:', error);
      alert('Erro ao processar imagem');
      setIsProcessing(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // CONFIRMAR E SALVAR
  // ─────────────────────────────────────────────────────────────────────────────
  const confirmCapture = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);

    try {
      // Converter data URL para Blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      // Preparar metadata
      const filename = `evidence_${Date.now()}.jpg`;
      const metadata = {
        componentName,
        anomalyName,
        latitude: geoLocation?.latitude,
        longitude: geoLocation?.longitude,
        accuracy: geoLocation?.accuracy,
        timestamp: new Date().toISOString(),
        technician: technicianName
      };

      // Callback com foto
      onCaptureComplete({
        file: blob,
        filename,
        metadata
      });

      // Reset
      setCapturedImage(null);
      setMode('menu');
      onClose();
    } catch (error) {
      console.error('❌ Erro ao confirmar:', error);
      alert('Erro ao salvar foto');
    } finally {
      setIsProcessing(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // CANCELAR
  // ─────────────────────────────────────────────────────────────────────────────
  const handleCancel = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(t => t.stop());
    }

    setCapturedImage(null);
    setMode('menu');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="w-full bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-5 max-h-[90vh] overflow-y-auto">
        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* MENU INICIAL */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        {mode === 'menu' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: '#193A2A' }}>
                Registrar Evidência Fotográfica
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <p className="text-gray-700">
                  📍 <strong>Técnico:</strong> {technicianName}
                  {componentName && <><br />🔧 <strong>Componente:</strong> {componentName}</>}
                  {anomalyName && <><br />⚠️ <strong>Anomalia:</strong> {anomalyName}</>}
                </p>
              </div>

              {/* Botões */}
              <Button
                onClick={startCamera}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <Camera size={20} />
                Tirar Foto com Câmera
              </Button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-12 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
              >
                📷 Selecionar da Galeria
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleGallerySelect}
                className="hidden"
              />

              <Button
                onClick={handleCancel}
                variant="outline"
                className="w-full h-12"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* CÂMERA AO VIVO */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        {mode === 'camera' && (
          <div className="p-4 space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-4 border-yellow-400 opacity-30" />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={captureFromCamera}
                disabled={isProcessing}
                className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                {isProcessing ? '⏳ Capturando...' : '✓ Capturar Foto'}
              </Button>

              <Button
                onClick={() => {
                  if (videoRef.current?.srcObject) {
                    const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                    tracks.forEach(t => t.stop());
                  }
                  setMode('menu');
                }}
                variant="outline"
                className="flex-1 h-12"
              >
                Voltar
              </Button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* PREVIEW */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        {mode === 'preview' && capturedImage && (
          <div className="p-4 space-y-4">
            <h3 className="font-semibold text-center" style={{ color: '#193A2A' }}>
              Preview com Marca d'Água
            </h3>

            <div className="bg-gray-100 rounded-lg overflow-hidden max-h-96">
              <img src={capturedImage} alt="Preview" className="w-full h-full object-contain" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={confirmCapture}
                disabled={isProcessing}
                className="h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <Check size={18} />
                {isProcessing ? 'Salvando...' : 'Confirmar'}
              </Button>

              <Button
                onClick={() => {
                  setCapturedImage(null);
                  setMode('menu');
                }}
                variant="outline"
                className="h-12"
              >
                Descartar
              </Button>
            </div>
          </div>
        )}

        {/* Canvas oculto */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
