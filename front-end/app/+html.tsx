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
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Icons"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        <meta name="description" content="Inspection App" />
        <meta name="keywords" content="expo, react native, inspection" />
        <title>Inspection App</title>
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}

