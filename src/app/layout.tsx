import { Provider } from "@/components/ui/provider"
import { LanguageProvider } from "@/app/hooks/useLanguage"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>LOLpedia</title>
        <meta charSet="UTF-8" />
      </head>
      <body>
      <Provider>
        <LanguageProvider>{children}</LanguageProvider>
      </Provider>
      </body>
    </html>
  );
}