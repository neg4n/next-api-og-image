import { extendTheme } from '@chakra-ui/react'

const overrides = {
  config: {
    useSystemColorMode: true,
    initialColorMode: 'light',
  },
  styles: {
    global: {
      'html, body': {
        w: '100%',
        h: '100%',
      },
      '#__next': {
        w: '100%',
        h: '100%',
      },
    },
  },
}

export const theme = extendTheme(overrides)
