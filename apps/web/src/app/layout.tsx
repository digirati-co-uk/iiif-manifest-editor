import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteProvider } from "../components/site/Provider";
import "@manifest-editor/components/dist/index.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IIIF Manifest Editor",
  description: "Digirati Manifest Editor",
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SiteProvider>{children}</SiteProvider>
      </body>
    </html>
  );
}
