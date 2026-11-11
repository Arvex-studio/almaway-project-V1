import type { Metadata, Viewport } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import "./product.css";
import localFont from "next/font/local";
const manrope = localFont({
  src: "../public/fonts/Manrope.woff2",
  variable: "--font-ui",
  display: "swap",
  weight: "200 800",
});
const lora = localFont({
  src: "../public/fonts/Lora.woff2",
  variable: "--font-story",
  display: "swap",
  weight: "400 700",
  preload: false,
});
import { JournalProvider } from "@/components/journal/journal-state";
import { DemoStateProvider } from "@/components/demo-state";

export const metadata: Metadata = {
  title: "AlmaWay — открывай места рядом",
  description: "Природа ближе, чем кажется.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f7faf8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${manrope.variable} ${lora.variable}`}>
        <DemoStateProvider>
          <JournalProvider>{children}</JournalProvider>
        </DemoStateProvider>
      </body>
    </html>
  );
}
