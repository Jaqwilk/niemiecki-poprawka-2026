import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import Script from 'next/script';
import { StudyStateProvider } from '@/components/study/state-provider';
import { StudyTutor } from '@/components/study/tutor';

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
  description: 'Osobisty plan przygotowania do poprawki z niemieckiego.',
  openGraph: {
    title: 'Deutsch',
    description: 'Osobisty plan przygotowania do poprawki z niemieckiego.',
    locale: 'pl_PL',
    siteName: 'Deutsch',
    type: 'website',
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pl" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen" suppressHydrationWarning>
        <RootProvider
          i18n={{
            locale: 'pl',
            translations: {
              Search: 'Szukaj',
              'Search(search trigger)': 'Szukaj',
              'Search(search dialog)': 'Szukaj',
              'Open Search': 'Otwórz wyszukiwanie',
              'Open Search(search trigger)(aria-label)': 'Otwórz wyszukiwanie',
              'Close Search': 'Zamknij wyszukiwanie',
              'Close Search(search dialog)(aria-label)': 'Zamknij wyszukiwanie',
              'No results found(search dialog)': 'Brak wyników',
              'Previous Page': 'Poprzednia strona',
              'Previous Page(pagination)': 'Poprzednia strona',
              'Next Page': 'Następna strona',
              'Next Page(pagination)': 'Następna strona',
              'On this page': 'Na tej stronie',
              'On this page(table of contents)': 'Na tej stronie',
              'Table of Contents': 'Spis treści',
              'No Headings': 'Brak nagłówków',
              'No Headings(table of contents)': 'Brak nagłówków',
              'Open Sidebar': 'Otwórz menu',
              'Open Sidebar(sidebar)(aria-label)': 'Otwórz menu',
              'Close Sidebar': 'Zamknij menu',
              'Close Sidebar(sidebar)(aria-label)': 'Zamknij menu',
              'Collapse Sidebar': 'Zwiń menu',
              'Collapse Sidebar(sidebar)(aria-label)': 'Zwiń menu',
              'Show Sidebar': 'Pokaż menu',
              'Hide Sidebar': 'Ukryj menu',
              'Toggle Theme': 'Zmień motyw',
              'Toggle Theme(theme switcher)(aria-label)': 'Zmień motyw',
              Light: 'Jasny',
              'Light(theme switcher)(aria-label)': 'Jasny',
              Dark: 'Ciemny',
              'Dark(theme switcher)(aria-label)': 'Ciemny',
              System: 'Systemowy',
              'System(theme switcher)(aria-label)': 'Systemowy',
              'Copy Link': 'Kopiuj link',
              'Copy Link(accordion)(aria-label)': 'Kopiuj link',
              'Copy Text': 'Kopiuj tekst',
              'Copied Text': 'Skopiowano',
              'Copy Markdown': 'Kopiuj Markdown',
              Open: 'Otwórz',
              'Open in GitHub': 'Otwórz w GitHubie',
              'View as Markdown': 'Wyświetl jako Markdown',
              'Open in Scira AI': 'Otwórz w Scira AI',
              'Open in ChatGPT': 'Otwórz w ChatGPT',
              'Open in Claude': 'Otwórz w Claude',
              'Open in Cursor': 'Otwórz w Cursorze',
              'Read {url}, I want to ask questions about it.': 'Przeczytaj {url}. Chcę zadać pytania o tę stronę.',
              'Last updated on': 'Ostatnia aktualizacja',
              'Last updated on(page footer)': 'Ostatnia aktualizacja',
            },
          }}
        >
          <StudyStateProvider>
            {children}
            <StudyTutor />
          </StudyStateProvider>
        </RootProvider>
        <Script
          id="extension-attribute-guard"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: extensionAttributeGuard }}
        />
      </body>
    </html>
  );
}
