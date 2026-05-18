import { useState, useEffect } from 'react';

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface UseGeolocationReturn {
  location: GeolocationData | null;
  error: string | null;
  loading: boolean;
  requestLocation: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<GeolocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada neste dispositivo');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
        setLoading(false);
      },
      (err) => {
        // Mensagens de erro mais legíveis
        let errorMsg = 'Erro ao obter localização';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = 'Permissão negada para acessar localização. Verifique as configurações do navegador.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg = 'Informação de localização não disponível. Tente em um local aberto.';
            break;
          case err.TIMEOUT:
            errorMsg = 'Tempo limite excedido ao obter localização';
            break;
        }
        setError(errorMsg);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return {
    location,
    error,
    loading,
    requestLocation
  };
}
