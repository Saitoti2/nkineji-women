import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);

                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 1000 * 60 * 60); // Check every hour

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New update available, reload to apply
                                console.log('New content available, reloading...');
                                window.location.reload();
                            }
                        });
                    }
                });
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });

        // Listen for service worker updates
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('New service worker active, reloading...');
            window.location.reload();
        });
    });
}
