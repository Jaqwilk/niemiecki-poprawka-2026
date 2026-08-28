import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
});

const extensionAttributeGuard = `
(() => {
  const isInjectedAttribute = (attribute) =>
    attribute.startsWith('bis_') ||
    (attribute.startsWith('__processed_') && attribute.endsWith('__'));

  const clean = (node) => {
    if (!(node instanceof Element)) return;

    for (const element of [node, ...node.querySelectorAll('*')]) {
      for (const attribute of [...element.attributes]) {
        if (isInjectedAttribute(attribute.name)) {
          element.removeAttribute(attribute.name);
        }
      }
    }
  };

  clean(document.documentElement);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName &&
        isInjectedAttribute(mutation.attributeName)
      ) {
        mutation.target.removeAttribute(mutation.attributeName);
      }
      for (const node of mutation.addedNodes) clean(node);
    }
  }).observe(document.documentElement, {
    attributes: true,
    childList: true,
    subtree: true,
  });
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Deutsch',
    template: '%s | Deutsch',
  },
  description: 'Persönlicher Lernbereich für die Deutschprüfung.',
  openGraph: {
    title: 'Deutsch',
    description: 'Persönlicher Lernbereich für die Deutschprüfung.',
    locale: 'de_DE',
    siteName: 'Deutsch',
    type: 'website',
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="de" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen" suppressHydrationWarning>
        <RootProvider>{children}</RootProvider>
        <Script
          id="extension-attribute-guard"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: extensionAttributeGuard }}
        />
      </body>
    </html>
  );
}
