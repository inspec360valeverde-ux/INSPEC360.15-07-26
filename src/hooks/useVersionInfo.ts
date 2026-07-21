import { useState, useEffect } from 'react';

interface VersionInfo {
  version: string;
  buildDate: string;
  lastUpdate: string;
}

export function useVersionInfo() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);

  useEffect(() => {
    // Verificar se já tem no sessionStorage (não refetch enquanto não recarregar)
    const cached = sessionStorage.getItem('appVersionInfo');
    if (cached) {
      setVersionInfo(JSON.parse(cached));
      return;
    }

    // Primeiro tentar a API backend que agrega info (quando presente)
    // IMPORTANTE: Forçar sem cache adicionando timestamp
    const timestamp = new Date().getTime();
    fetch(`/api/version?ts=${timestamp}`, { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error('no api');
        return res.json();
      })
      .then((data: any) => {
        const info: VersionInfo = {
          version: data.version || '2.2.0',
          buildDate: data.buildDate || new Date().toISOString(),
          lastUpdate: data.lastUpdate || ''
        };
        setVersionInfo(info);
        sessionStorage.setItem('appVersionInfo', JSON.stringify(info));
      })
      .catch(() => {
        // Fallback direto ao arquivo estático com timestamp para evitar cache
        fetch(`/version.json?ts=${timestamp}`, { cache: 'no-store' })
          .then(res => res.json())
          .then((data: VersionInfo) => {
            setVersionInfo(data);
            sessionStorage.setItem('appVersionInfo', JSON.stringify(data));
          })
          .catch(() => {
            setVersionInfo({
              version: '2.2.0',
              buildDate: new Date().toISOString(),
              lastUpdate: 'Versão atual'
            });
          });
      });
  }, []);

  return versionInfo;
}

export function formatUpdateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    
    // Formato: DD/MM/YYYY HH:mm
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  } catch {
    return 'Data indisponível';
  }
}
