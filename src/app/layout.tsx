import { Provider } from "@/components/ui/provider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>LOLpedia</title>
        <meta charSet="UTF-8" />
      </head>
      <body>
      <Provider>{children}</Provider>
      </body>
    </html>
  );
}