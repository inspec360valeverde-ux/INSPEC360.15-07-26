
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import "./styles/pwa.css";
import { OfflineProvider } from "./context/OfflineContext.tsx";
import { OfflineIndicator } from "./components/OfflineIndicator.tsx";

// Register Service Worker for offline support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js", { scope: "/" })
      .then((registration) => {
        console.log("✅ Service Worker registrado");
        
        // Verificar atualizações a cada 5 minutos
        setInterval(() => {
          registration.update().catch(err => {
            console.log("Erro ao verificar atualização do SW:", err);
          });
        }, 5 * 60 * 1000);
        
        // Detectar quando nova versão do SW está pronta
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 Nova versão detectada, recarregando...');
              // Limpar cache antigo antes de recarregar
              caches.keys().then(cacheNames => {
                Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
                  .then(() => window.location.reload())
                  .catch(() => window.location.reload());
              });
            }
          });
        });
      })
      .catch((error) => {
        console.log("⚠️ Service Worker erro:", error);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <OfflineProvider>
    <App />
    <OfflineIndicator />
  </OfflineProvider>
);
  