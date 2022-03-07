import { useState } from "react";
import "../styles/globals.css";
import { AppProps } from "next/app";
import { VaultProvider, SimpleViewerProvider } from "react-iiif-vault";

// Next.js <App /> component will keep state alive during client side transitions.
// If you refresh the page, or link to another page without utilizing Next.js <Link />,
// the <App /> will initialize again and the state will be reset.

// Here we are overriding Next.js implimentation of page creations to keep the manifest vault
// live between pages, like previewing the data.

// function MyApp({ Component, pageProps }: AppProps) {
//   return <Component {...pageProps} />;
// }

const CustomApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Component
        {...pageProps}
        // changeSampleManifest={(url: string) => setManifest(url)}
      />
    </>
  );
};

export default CustomApp;
