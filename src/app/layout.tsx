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
  const attributes = ['bis_skin_checked', 'bis_register', 'bis_size', 'bis_id'];
  const selector = attributes.map((attribute) => '[' + attribute + ']').join(',');

  const clean = (node) => {
    if (!(node instanceof Element)) return;
    for (const attribute of attributes) node.removeAttribute(attribute);
    for (const element of node.querySelectorAll(selector)) {
      for (const attribute of attributes) element.removeAttribute(attribute);
    }
  };

  clean(document.documentElement);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName) {
        mutation.target.removeAttribute(mutation.attributeName);
      }
      for (const node of mutation.addedNodes) clean(node);
    }
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: attributes,
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
      <body className="flex flex-col min-h-screen">
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
