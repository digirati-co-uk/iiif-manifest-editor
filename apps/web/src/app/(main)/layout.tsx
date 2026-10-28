import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";

import "exhibition-viewer/dist/lib.css";
import "manifest-editor/dist/index.css";

// Hopefully these are not needed.
// import "@manifest-editor/components/dist/lib.css";
// import "@manifest-editor/exhibition-preset/dist/index.css";

import { Posthog } from "../../components/PostHog";
import { SiteProvider } from "../../components/site/Provider";
import { WebI18nProvider } from "../../i18n/WebI18nProvider";
import { parseWebUiPreferences, UI_PREFERENCES_COOKIE, webUiPolicy, webUiSelection } from "../../i18n/policy";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IIIF Manifest Editor",
  description: "Digirati Manifest Editor",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const preferences = parseWebUiPreferences((await cookies()).get(UI_PREFERENCES_COOKIE)?.value);
  const { locale } = webUiSelection(preferences);
  const direction = webUiPolicy.locales.find((item) => item.id === locale)?.direction ?? "ltr";
  return (
    <html lang={locale} dir={direction}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={inter.className}>
        <WebI18nProvider preferences={preferences}>
          <SiteProvider>{children}</SiteProvider>
        </WebI18nProvider>
        <Posthog />
      </body>
    </html>
  );
}
