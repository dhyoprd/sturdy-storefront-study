import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "@/styles/header.css";
import "@/styles/hero.css";
import "@/styles/footers.css";
import "@/styles/overlays.css";
import "@/styles/cart.css";
import "@/styles/search.css";
import "@/styles/nav-drawer.css";
import "@/styles/modals.css";
import "@/styles/catalog.css";
import "@/styles/editorial.css";
import "@/styles/documents.css";
import "@/styles/product.css";
import "@/styles/checkout.css";
import "@/styles/admin.css";
import "@/styles/admin-shell.css";
import "@/styles/admin-homepage.css";
import "@/styles/admin-products.css";

const helvetica = localFont({
  src: [
    { path: "./fonts/HelveticaNeue-Roman.woff2", weight: "400", style: "normal" },
    { path: "./fonts/HelveticaNeue-Italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/HelveticaNeue-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/HelveticaNeue-Bold.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-helvetica",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Stüssy",
  description: "The official Stüssy website. New arrivals, collections, chapters and archive.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Stüssy",
    description: "The official Stüssy website.",
    images: ["/images/homepage-hero.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={helvetica.variable}>
      <body>{children}</body>
    </html>
  );
}
