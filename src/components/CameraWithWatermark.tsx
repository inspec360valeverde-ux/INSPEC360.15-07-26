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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const { location } = useGeolocation();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      setCameraReady(false);
      setIsCapturing(true);
      
      // Verificar se browser suporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Câmera não suportada neste navegador. Use o upload de arquivo como alternativa.');
        setIsCapturing(false);
        return;
      }
      
      // Timeout de 8 segundos para getUserMedia (mais tempo em mobile)
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout ao acessar câmera (8s). Verifique permissões ou conexão.')), 8000)
      );
      
      // Configuração mais compatível com mobile
      const streamPromise = navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { min: 320, ideal: 1280, max: 1920 },
          height: { min: 240, ideal: 960, max: 1440 }
        },
        audio: false
      });
      
      const stream = await Promise.race([streamPromise, timeoutPromise]);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        let readyTimeoutId: NodeJS.Timeout | null = null;
        
        // Aguardar o vídeo estar pronto antes de permitir captura
        const canPlayHandler = () => {
          if (readyTimeoutId) clearTimeout(readyTimeoutId);
          setCameraReady(true);
          console.log('✅ Câmera pronta para capturar');
        };
        
        const errorHandler = () => {
          console.error('❌ Erro ao reproduzir vídeo');
          if (readyTimeoutId) clearTimeout(readyTimeoutId);
          setError('Erro ao iniciar câmera. Verifique as permissões e tente novamente.');
          setIsCapturing(false);
          setCameraReady(false);
        };
        
        videoRef.current.addEventListener('canplay', canPlayHandler, { once: true });
        videoRef.current.addEventListener('error', errorHandler, { once: true });
        
        // Timeout para estar pronto (máximo 10 segundos)
        readyTimeoutId = setTimeout(() => {
          console.warn('⏱️ Câmera não ficou pronta em 10 segundos');
          setError('⏳ Câmera demorando para iniciar. Pode estar sem permissão ou a câmera pode estar ocupada. Tente novamente.');
          setIsCapturing(false);
          setCameraReady(false);
          // Remover listeners
          if (videoRef.current) {
            videoRef.current.removeEventListener('canplay', canPlayHandler);
            videoRef.current.removeEventListener('error', errorHandler);
          }
        }, 10000);
        
        // Tentar iniciar reprodução
        videoRef.current.play().catch(err => {
          if (readyTimeoutId) clearTimeout(readyTimeoutId);
          console.error('Erro ao iniciar reprodução:', err);
          if (err.name === 'NotAllowedError') {
            setError('🔒 Permissão de câmera negada. Verifique em Configurações > Privacidade.');
          } else if (err.name === 'NotSupportedError') {
            setError('Tipo de mídia não suportado. Use HTTPS em alguns navegadores.');
          } else {
            setError('Erro ao iniciar câmera. Tente novamente.');
          }
          setIsCapturing(false);
          setCameraReady(false);
        });
      }
    } catch (err: any) {
      console.error('❌ Erro na câmera:', err);
      
      let errorMsg = 'Erro ao acessar câmera.';
      
      if (err.name === 'NotAllowedError' || err.message?.includes('denied')) {
        errorMsg = '🔒 Permissão negada. Vá em Configurações > Privacidade e permita acesso à câmera.';
      } else if (err.name === 'NotFoundError' || err.message?.includes('not found')) {
        errorMsg = '📷 Câmera não encontrada. Causas possíveis:\n\n• Dispositivo sem câmera\n• Navegador em contexto sem suporte (como iframe)\n• HTTPS obrigatório no servidor\n\nUse o upload de arquivo como alternativa.';
      } else if (err.name === 'NotReadableError' || err.message?.includes('in use')) {
        errorMsg = '⚠️ Câmera está sendo usada por outro aplicativo. Feche-o e tente novamente.';
      } else if (err.name === 'SecurityError') {
        errorMsg = '🔐 Erro de segurança. Use HTTPS e verifique permissões.';
      } else if (err.message?.includes('Timeout')) {
        errorMsg = '⏱️ Câmera demorando. Verifique permissões ou conexão de rede.';
      } else {
        errorMsg = err.message || 'Erro desconhecido ao acessar câmera.';
      }
      
      setError(errorMsg);
      setIsCapturing(false);
      setCameraReady(false);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Câmera não está pronta. Tente novamente.');
      return;
    }

    // Validar se vídeo está realmente pronto
    if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
      setError('⏳ Câmera ainda está carregando. Aguarde alguns segundos e tente novamente.');
      return;
    }

    const context = canvasRef.current.getContext('2d');
    if (!context) {
      setError('Erro ao acessar canvas. Tente novamente.');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Ajustar canvas para o tamanho real do vídeo
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      // Desenhar frame atual
      context.drawImage(videoRef.current, 0, 0);

      // Adicionar watermark
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
        setError(null);
      };
      reader.onerror = () => {
        setError('Erro ao ler imagem. Tente novamente.');
      };
      reader.readAsDataURL(blobWithWatermark);
      
      stopCamera();
      setIsCapturing(false);
    } catch (err: any) {
      console.error('❌ Erro ao processar imagem:', err);
      setError(`Erro ao processar imagem: ${err.message || 'desconhecido'}. Tente novamente.`);
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
    setError(null);
    setRetryCount(0);
    startCamera();
  };

  const retryCameraAccess = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setIsCapturing(false);
    setCameraReady(false);
    startCamera();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Ler arquivo como image
      const reader = new FileReader();
      reader.onload = async (e) => {
        const img = new Image();
        img.onload = async () => {
          try {
            // Desenhar no canvas e aplicar watermark
            if (canvasRef.current) {
              canvasRef.current.width = img.width;
              canvasRef.current.height = img.height;
              const context = canvasRef.current.getContext('2d');
              if (context) {
                context.drawImage(img, 0, 0);

                const blobWithWatermark = await addWatermarkToCanvas(canvasRef.current, {
                  latitude: location?.latitude,
                  longitude: location?.longitude,
                  accuracy: location?.accuracy,
                  componentName,
                  anomalyName
                });

                const reader2 = new FileReader();
                reader2.onload = (e2) => {
                  const base64 = e2.target?.result as string;
                  setPreviewImage(base64);
                };
                reader2.readAsDataURL(blobWithWatermark);
              }
            }
          } catch (err: any) {
            setError(`Erro ao processar imagem: ${err.message}`);
          } finally {
            setIsProcessing(false);
          }
        };
        img.onerror = () => {
          setError('Arquivo não é uma imagem válida.');
          setIsProcessing(false);
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        setError('Erro ao ler arquivo.');
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(`Erro ao carregar arquivo: ${err.message}`);
      setIsProcessing(false);
    }
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
          {!previewImage && isCapturing && cameraReady ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-80 object-cover rounded-lg bg-black"
              />
              <canvas
                ref={canvasRef}
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
          ) : !previewImage && isCapturing && !cameraReady ? (
            <div className="w-full h-80 bg-gray-100 rounded-lg flex flex-col items-center justify-center gap-3">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              <div className="text-center">
                <p className="text-sm text-gray-600">⏳ Inicializando câmera...</p>
                <p className="text-xs text-gray-500 mt-1">Isso pode levar alguns segundos</p>
              </div>
              {retryCount > 0 && (
                <p className="text-xs text-gray-500">Tentativa {retryCount + 1}</p>
              )}
            </div>
          ) : (
            <div className="w-full h-80 bg-gray-100 rounded-lg flex items-center justify-center">
              <Loader className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 whitespace-pre-wrap">{error}</p>
              </div>
              
              {/* Sugestões de solução - Permissão */}
              {error.includes('Permissão') && (
                <div className="text-xs text-red-600 bg-red-100 p-2 rounded mt-1 space-y-1">
                  <p className="font-medium">Como permitir acesso à câmera:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li><strong>iPhone/iPad:</strong> Ajustes → Privacidade → Câmera</li>
                    <li><strong>Android:</strong> Configurações → Privacidade → Câmera</li>
                    <li><strong>Desktop:</strong> Verifique as permissões do navegador</li>
                  </ul>
                </div>
              )}
              
              {/* Sugestões de solução - Câmera não encontrada */}
              {error.includes('não encontrada') && (
                <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded mt-1 space-y-1">
                  <p className="font-medium">💡 Alternativa disponível:</p>
                  <p>Use o botão "📁 Usar Imagem da Galeria" abaixo para enviar uma foto de seu dispositivo. A marca d'água será adicionada automaticamente!</p>
                </div>
              )}
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Footer - Actions */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          {!previewImage && isCapturing && cameraReady ? (
            // Estado: Câmera pronta para captura
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={capturePhoto}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Capturar Foto
                  </>
                )}
              </button>
            </div>
          ) : !previewImage && error ? (
            // Estado: Câmera com erro
            <div className="flex flex-col gap-2">
              {/* Se for erro de câmera não encontrada, colocar galeria como opção primária */}
              {error.includes('não encontrada') ? (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    📁 Usar Imagem da Galeria
                  </button>
                  <button
                    onClick={retryCameraAccess}
                    className="w-full px-4 py-2 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Tentar Câmera Novamente
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={retryCameraAccess}
                    className="w-full px-4 py-2 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    {retryCount > 0 ? `Tentar Novamente (Tentativa ${retryCount})` : 'Tentar Novamente'}
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    📁 Usar Imagem da Galeria
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full px-4 py-2 text-sm rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          ) : previewImage ? (
            // Estado: Preview da imagem
            <div className="flex gap-2">
              <button
                onClick={retakePhoto}
                className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Recapturar
              </button>
              <button
                onClick={confirmPhoto}
                className="flex-1 px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirmar
              </button>
            </div>
          ) : isCapturing && !cameraReady ? (
            // Estado: Inicializando câmera
            <div className="flex flex-col gap-2">
              <button
                onClick={retryCameraAccess}
                className="w-full px-4 py-2 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                {retryCount > 0 ? `Tentar Novamente (Tentativa ${retryCount})` : 'Tentar Novamente'}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                📁 Usar Imagem da Galeria
              </button>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 text-sm rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          ) : (
            // Estado: Padrão
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 text-sm rounded-lg bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                📁 Galeria
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
