
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
import { OfflineProvider } from "./context/OfflineContext.tsx";
import { OfflineIndicator } from "./components/OfflineIndicator.tsx";

// Register Service Worker for offline support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js", { scope: "/" })
      .then((registration) => {
        console.log("✅ Service Worker registrado");
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
  