import type { Metadata } from "next";
import "./globals.css";
import Backdrop from "@/components/Backdrop";

export const metadata: Metadata = {
  title: "The Elenchus Library",
  description: "A private GP library: sources, clippings, scrapbooks and past-year questions.",
};

const FONTS =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500&family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Cinzel:wght@600;700&family=Playfair+Display:wght@700;900&family=Libre+Baskerville:wght@400;700&family=Oswald:wght@500;600&family=Bebas+Neue&family=Abril+Fatface&family=Space+Mono:wght@400;700&family=UnifrakturMaguntia&family=Josefin+Sans:wght@600;700&family=DM+Serif+Display&family=Caveat:wght@500;700&family=Special+Elite&display=swap";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body>
        <Backdrop />
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      </body>
    </html>
  );
}
