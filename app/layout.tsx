import "./globals.css";
import Script from "next/script";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Altillo Música",
  description: "Gestiona contrataciones, riders y finanzas de tus conciertos",
  icons: {
    icon: "/icon-192.png"
  }
};

export default function RootLayout({ children }: { children: import("react").ReactNode }) {
  return (
    <html lang="es">
      <body className="text-white min-h-screen">
        {children}
        <Script id="register-sw" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) {navigator.serviceWorker.register('/sw.js').catch(console.error);}`}
        </Script>
      </body>
    </html>
  );
}
