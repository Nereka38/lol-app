"use client";

import { extendTheme, type ThemeConfig, ChakraProvider } from "@chakra-ui/react";
import { ColorModeProvider } from './color-mode';

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
}

const theme = extendTheme({ config })

export function Provider({ children }: { children: React.ReactNode }) {
  return (
     <ChakraProvider theme={theme}>
      <ColorModeProvider>{children}</ColorModeProvider>
    </ChakraProvider>
  );
}