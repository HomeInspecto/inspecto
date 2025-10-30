import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * This file is web-only and used to configure the root HTML for every web page during static rendering.
 * The contents of this function only run in Node.js environments and do not have access to the DOM or browser APIs.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Material Icons Font - Required for @expo/vector-icons on web */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
        {/* Inline CSS to ensure font is available immediately */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'Material Icons';
              font-style: normal;
              font-weight: 400;
              src: url(https://fonts.gstatic.com/s/materialicons/v142/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2) format('woff2');
            }
          `
        }} />

        <meta name="description" content="Inspection App" />
        <meta name="keywords" content="expo, react native, inspection" />
        <title>Inspection App</title>
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}

