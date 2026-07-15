import { X, Download, Share2 } from 'lucide-react';
import { Button } from './ui/button';

interface ImageViewerModalProps {
  isOpen: boolean;
  imageUrl: string;
  title?: string;
  anomalyName?: string;
  onClose: () => void;
}

export function ImageViewerModal({
  isOpen,
  imageUrl,
  title,
  anomalyName,
  onClose,
}: ImageViewerModalProps) {
  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${anomalyName || 'foto'}_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], `${anomalyName || 'foto'}.jpg`, { type: 'image/jpeg' });
        
        await navigator.share({
          files: [file],
          title: anomalyName,
          text: `Foto da anomalia: ${anomalyName}`,
        });
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative bg-white rounded-2xl overflow-hidden max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="font-semibold text-gray-900">{title || 'Visualizar Imagem'}</h2>
            {anomalyName && (
              <p className="text-sm text-gray-600 mt-1">
                📍 Anomalia: {anomalyName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Image Container */}
        <div className="flex-1 flex items-center justify-center bg-black overflow-auto">
          <img
            src={imageUrl}
            alt={anomalyName || 'Evidência fotográfica'}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-gray-100 bg-gray-50">
          {navigator.share && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 flex items-center gap-2"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
              Compartilhar
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="flex-1 flex items-center gap-2"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
            Baixar
          </Button>
          <Button
            size="sm"
            className="flex-1 text-white"
            style={{ backgroundColor: '#193A2A' }}
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
