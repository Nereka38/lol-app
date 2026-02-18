// theme.ts
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: 'BeaufortforLOL-Regular',
    body: 'BeaufortforLOL-Regular',
  },
  styles: {
    global: {
      body: {
        bg: 'gray.900', // puedes dejarlo si ya usas fondo personalizado
        color: 'white',
      },
    },
  },
});

export default theme;