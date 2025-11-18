import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ClientBody from "./ClientBody";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Toaster from '@/components/ui/toaster';
import TooltipProvider from "@/components/ui/tooltip-provider";

const dmSans = DM_Sans({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1f2937"
};

export const metadata: Metadata = {
  title: "OnePredict - Prediction Platform",
  description: "The next-generation prediction market for exchanging beliefs and forecasting global events across finance, politics, crypto, entertainment and more.",
  applicationName: "OnePredict",
  authors: [{ name: "OnePredict Team" }],
  keywords: ["OnePredict", "forecasting", "trading", "finance", "politics", "crypto"],
  creator: "OnePredict",
  publisher: "OnePredict",
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OnePredict",
    startupImage: [
      {
        url: "/icons/startup-768x1024.png",
        media: "(device-width: 768px) and (device-height: 1024px)"
      }
    ]
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "msapplication-TileColor": "#1f2937",
    "msapplication-config": "/browserconfig.xml"
  }
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={dmSans.className}>
        <LanguageProvider>
          <ThemeProvider>
            <TooltipProvider>
              <ClientBody>{children}</ClientBody>
            </TooltipProvider>
          </ThemeProvider>
          {/* 全局挂载 */}
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}
