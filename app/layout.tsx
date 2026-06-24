import type { Metadata, Viewport } from "next";
import { Saira_Condensed } from "next/font/google";
import "./globals.css";

const saira = Saira_Condensed({ variable: "--font-saira", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "BarberIA",
  description: "Reserva tu cita con SofIA, la asistente de tu barbería",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "BarberIA" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#D4AF37",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${saira.variable} antialiased bg-[#0A0A0A] text-[#F5F5F5] h-full`} style={{ fontFamily: "var(--font-saira), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
