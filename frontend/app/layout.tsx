import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono, Space_Mono } from "next/font/google";
import "./globals.css";
import { FilterProvider } from "@/app/context/FilterContext";
import { ResourceProvider } from "@/app/context/ResourceContext";

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-heading",
});

const jetBrainsMono = JetBrains_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-specifications",
});

export const metadata: Metadata = {
  title: "STEM Commons - India | Discover STEM Resources",
  description: "Discover Makerspaces, ATAL Tinkering Labs, and STEM vendors across India on an interactive map.",
  keywords: "STEM, Makerspaces, ATAL Labs, Education, Innovation, India",
  authors: [{ name: "STEM Commons" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${jetBrainsMono.variable} ${spaceMono.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        <FilterProvider>
          <ResourceProvider>
            {children}
          </ResourceProvider>
        </FilterProvider>
      </body>
    </html>
  );
}
